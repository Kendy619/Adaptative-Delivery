import { pool, initDb } from "./db";
import type { SessionStateRecord } from "./types";

// ============================================================
// Operações do repositório de sessão (PostgreSQL)
// ============================================================

/**
 * Persiste o estado de sessão (cada evento é um novo registro).
 */
export async function saveSessionState(
  state: SessionStateRecord
): Promise<void> {
  await initDb();

  await pool.query(
    `INSERT INTO session_state
       (session_id, event_timestamp, category_scores, last_item_viewed,
        last_category, event_type, event_count, ttl)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      state.sessionId,
      state.eventTimestamp,
      JSON.stringify(state.categoryScores),
      state.lastItemViewed,
      state.lastCategory,
      state.eventType,
      state.eventCount,
      state.ttl,
    ]
  );
}

/**
 * Busca o registro MAIS RECENTE da sessão.
 * ORDER BY event_timestamp DESC LIMIT 1.
 */
export async function findLatestSession(
  sessionId: string
): Promise<SessionStateRecord | null> {
  await initDb();

  const result = await pool.query(
    `SELECT session_id, event_timestamp, category_scores,
            last_item_viewed, last_category, event_type, event_count, ttl
       FROM session_state
      WHERE session_id = $1
      ORDER BY event_timestamp DESC
      LIMIT 1`,
    [sessionId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    sessionId: row.session_id,
    eventTimestamp: row.event_timestamp,
    categoryScores: row.category_scores,
    lastItemViewed: row.last_item_viewed,
    lastCategory: row.last_category,
    eventType: row.event_type,
    eventCount: row.event_count,
    ttl: row.ttl,
  };
}
