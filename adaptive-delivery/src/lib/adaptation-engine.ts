import { findLatestSession } from "./session-repository";
import { generateCrossSell } from "./cross-sell";
import {
  CATEGORIES,
  DEFAULT_CATEGORY_ORDER,
  type AdaptiveResponse,
  type CategoryKey,
  type CategoryRecommendation,
} from "./types";

/**
 * ── Motor de Adaptação (Análise / Decisão) ──────────────────
 *
 * Responsabilidade ÚNICA: analisar os scores acumulados e decidir
 * como apresentar as categorias ao usuário (ranking, highlights,
 * cross-sell). NÃO coleta eventos — isso é feito pelo monitor
 * de eventos (`event-monitor.ts`).
 *
 * Atende RN03 (ajustar categorias) e RA01 (adaptação instantânea).
 */

/** Score mínimo para "destacar" uma categoria na UI */
const HIGHLIGHT_THRESHOLD = 2.0;

// ============================================================
// Consultar recomendações (GET /api/session/recommendations)
// ============================================================

export async function getRecommendations(
  sessionId: string
): Promise<AdaptiveResponse> {
  const previous = await findLatestSession(sessionId);

  if (!previous) {
    return buildDefaultResponse(sessionId);
  }

  const adaptedCategories = rankCategories(previous.categoryScores || {});
  const crossSellSuggestions = previous.lastCategory
    ? generateCrossSell(
        previous.lastCategory as CategoryKey,
        previous.lastItemViewed
      )
    : [];

  return {
    sessionId,
    adaptedCategories,
    crossSellSuggestions,
    totalEventsProcessed: previous.eventCount,
    adaptationTimestampMs: Date.now(),
  };
}

// ============================================================
// Motor de ranking (RN03 + RA01)
// ============================================================

export function rankCategories(
  scores: Record<string, number>
): CategoryRecommendation[] {
  const result: CategoryRecommendation[] = [];
  let rank = 1;

  // 1. Categorias com pontuação, ordenadas por score decrescente
  const scored = Object.entries(scores)
    .filter(([, score]) => score > 0.01) // Ignorar resíduos de decaimento
    .sort(([, a], [, b]) => b - a);

  const scoredKeys = new Set(scored.map(([key]) => key));

  for (const [key, score] of scored) {
    const meta = CATEGORIES[key as CategoryKey];
    result.push({
      category: key as CategoryKey,
      displayName: meta?.displayName ?? key,
      emoji: meta?.emoji ?? "📦",
      score: Math.round(score * 100) / 100,
      rank: rank++,
      highlighted: score >= HIGHLIGHT_THRESHOLD,
    });
  }

  // 2. Categorias restantes na ordem padrão
  for (const catKey of DEFAULT_CATEGORY_ORDER) {
    if (!scoredKeys.has(catKey)) {
      const meta = CATEGORIES[catKey];
      result.push({
        category: catKey,
        displayName: meta.displayName,
        emoji: meta.emoji,
        score: 0,
        rank: rank++,
        highlighted: false,
      });
    }
  }

  return result;
}

// ============================================================
// Resposta padrão (sessão sem histórico)
// ============================================================

function buildDefaultResponse(sessionId: string): AdaptiveResponse {
  let rank = 1;
  const adaptedCategories: CategoryRecommendation[] =
    DEFAULT_CATEGORY_ORDER.map((key) => {
      const meta = CATEGORIES[key];
      return {
        category: key,
        displayName: meta.displayName,
        emoji: meta.emoji,
        score: 0,
        rank: rank++,
        highlighted: false,
      };
    });

  return {
    sessionId,
    adaptedCategories,
    crossSellSuggestions: [],
    totalEventsProcessed: 0,
    adaptationTimestampMs: Date.now(),
  };
}
