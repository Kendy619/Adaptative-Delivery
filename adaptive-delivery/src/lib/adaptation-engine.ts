import { saveSessionState, findLatestSession } from "./session-repository";
import { generateCrossSell } from "./cross-sell";
import {
  CATEGORIES,
  DEFAULT_CATEGORY_ORDER,
  EVENT_WEIGHTS,
  type AdaptiveResponse,
  type CategoryKey,
  type CategoryRecommendation,
  type ClickEventRequest,
  type EventType,
  type SessionStateRecord,
} from "./types";

/**
 * Fator de decaimento: a cada novo evento, scores anteriores são
 * multiplicados por este valor. 0.85 = esquece 15% por interação,
 * priorizando fortemente o comportamento MAIS RECENTE.
 */
const DECAY_FACTOR = 0.85;

/** TTL da sessão no PostgreSQL: 30 minutos */
const SESSION_TTL_SECONDS = 1800;

/** Score mínimo para "destacar" uma categoria na UI */
const HIGHLIGHT_THRESHOLD = 2.0;

// ============================================================
// Processar evento de clickstream (POST /api/session/event)
// ============================================================

export async function processClickEvent(
  request: ClickEventRequest
): Promise<AdaptiveResponse> {
  const startMs = Date.now();

  // 1. Resolver peso do evento
  const weight = EVENT_WEIGHTS[request.eventType] ?? EVENT_WEIGHTS.view;

  // 2. Buscar estado anterior da sessão
  const previous = await findLatestSession(request.sessionId);

  // 3. Construir novo estado com decaimento + incremento
  const scores: Record<string, number> = {};

  if (previous?.categoryScores) {
    // Herdar scores com decaimento temporal
    for (const [cat, score] of Object.entries(previous.categoryScores)) {
      scores[cat] = score * DECAY_FACTOR;
    }
  }

  // Incrementar a categoria do evento atual
  scores[request.category] = (scores[request.category] || 0) + weight;

  const eventCount = (previous?.eventCount ?? 0) + 1;
  const now = new Date().toISOString();

  // 4. Persistir novo estado
  const newState: SessionStateRecord = {
    sessionId: request.sessionId,
    eventTimestamp: now,
    categoryScores: scores,
    lastItemViewed: request.itemName,
    lastCategory: request.category,
    eventType: request.eventType,
    eventCount,
    ttl: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  await saveSessionState(newState);

  // 5. Gerar vitrine adaptada + cross-sell
  const adaptedCategories = rankCategories(scores);
  const crossSellSuggestions = generateCrossSell(
    request.category,
    request.itemName
  );

  console.log(
    `[AdaptationEngine] Sessão ${request.sessionId} | Evento #${eventCount} | ${request.eventType} em ${request.category} | ${Date.now() - startMs}ms`
  );

  return {
    sessionId: request.sessionId,
    adaptedCategories,
    crossSellSuggestions,
    totalEventsProcessed: eventCount,
    adaptationTimestampMs: Date.now(),
  };
}

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

function rankCategories(
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
