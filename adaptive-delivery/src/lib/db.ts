import { Pool } from "pg";

// ============================================================
// Singleton do PostgreSQL Pool
// Reutilizado entre invocações (Next.js mantém o módulo em cache)
// ============================================================

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/adaptive_delivery",
});

/**
 * Cria a tabela session_state caso não exista.
 * Chamado automaticamente na primeira operação.
 */
let initialized = false;

export async function initDb(): Promise<void> {
  if (initialized) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS session_state (
      id              SERIAL PRIMARY KEY,
      session_id      VARCHAR(255) NOT NULL,
      event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      category_scores JSONB NOT NULL DEFAULT '{}',
      last_item_viewed VARCHAR(255),
      last_category   VARCHAR(100),
      event_type      VARCHAR(50),
      event_count     INTEGER DEFAULT 0,
      ttl             BIGINT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_session_state_session_id
      ON session_state(session_id, event_timestamp DESC);
  `);

  initialized = true;
  console.log("[DB] Tabela session_state pronta.");
}

export { pool };
