import Database from 'better-sqlite3';

const db = new Database(process.env.DB_PATH || './data.sqlite');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  wallet_address TEXT UNIQUE,
  credit_balance INTEGER NOT NULL DEFAULT 0,
  on_chain_synced INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id),
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT '["agent:read","ai:execute"]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT
);
CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id),
  type TEXT NOT NULL CHECK(type IN ('topup','debit','chain_sync','adjustment')),
  credits INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  service_type TEXT,
  x402_tx_hash TEXT,
  on_chain_tx TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS rate_limit_windows (
  key_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key_hash, window_start)
);
CREATE TABLE IF NOT EXISTS idempotency_keys (
  agent_id TEXT NOT NULL REFERENCES agents(id),
  idempotency_key TEXT NOT NULL,
  response_body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (agent_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_api_keys_agent ON api_keys(agent_id);
CREATE INDEX IF NOT EXISTS idx_ledger_agent ON ledger(agent_id);
CREATE INDEX IF NOT EXISTS idx_rl_key_hash ON rate_limit_windows(key_hash);
CREATE INDEX IF NOT EXISTS idx_agents_wallet ON agents(wallet_address);
`);

export default db;
