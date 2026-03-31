import { saveSessionState, findLatestSession } from "./session-repository";
import { generateCrossSell } from "./cross-sell";
import { rankCategories } from "./adaptation-engine";
import {
  EVENT_WEIGHTS,
  type AdaptiveResponse,
  type ClickEventRequest,
  type SessionStateRecord,
} from "./types";

/**
 * ── Monitor de Eventos (Coleta de Clickstream) ──────────────
 *
 * Responsabilidade ÚNICA: capturar eventos de navegação do usuário,
 * calcular scores com decaimento temporal e persistir o estado
 * da sessão. Delega a lógica de ranking/decisão ao motor de
 * adaptação (`adaptation-engine.ts`).
 *
 * Atende RN01 (monitorar navegação) e RN02 (identificar interesse).
 */

/**
 * Fator de decaimento: a cada novo evento, scores anteriores são
 * multiplicados por este valor. 0.85 = esquece 15% por interação,
 * priorizando fortemente o comportamento MAIS RECENTE.
 */
const DECAY_FACTOR = 0.85;

/** TTL da sessão no PostgreSQL: 30 minutos */
const SESSION_TTL_SECONDS = 1800;

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

  // 5. Gerar vitrine adaptada + cross-sell (delega ranking ao motor)
  const adaptedCategories = rankCategories(scores);
  const crossSellSuggestions = generateCrossSell(
    request.category,
    request.itemName
  );

  console.log(
    `[EventMonitor] Sessão ${request.sessionId} | Evento #${eventCount} | ${request.eventType} em ${request.category} | ${Date.now() - startMs}ms`
  );

  return {
    sessionId: request.sessionId,
    adaptedCategories,
    crossSellSuggestions,
    totalEventsProcessed: eventCount,
    adaptationTimestampMs: Date.now(),
  };
}
