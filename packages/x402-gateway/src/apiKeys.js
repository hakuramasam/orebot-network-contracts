import crypto from 'crypto';
import db from './db.js';

const PREFIX = 'sk_ore_';

export function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateApiKey() {
  return `${PREFIX}${crypto.randomBytes(24).toString('hex')}`;
}

export function createAgent({ name, walletAddress }) {
  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO agents (id, name, wallet_address, credit_balance) VALUES (?, ?, ?, 0)`)
    .run(id, name, walletAddress || null);
  return id;
}

export function issueApiKey(agentId, scopes = ['agent:read', 'ai:execute']) {
  const key = generateApiKey();
  const keyHash = hashKey(key);
  const keyId = crypto.randomUUID();
  const keyPrefix = key.slice(0, PREFIX.length + 6);
  db.prepare(`INSERT INTO api_keys (id, agent_id, key_hash, key_prefix, scopes) VALUES (?, ?, ?, ?, ?)`)
    .run(keyId, agentId, keyHash, keyPrefix, JSON.stringify(scopes));
  return { keyId, key, keyPrefix, scopes };
}

export function revokeApiKey(keyId) {
  db.prepare(`UPDATE api_keys SET revoked_at = datetime('now') WHERE id = ?`).run(keyId);
}

export function findAgentByApiKey(rawKey) {
  const keyHash = hashKey(rawKey);
  const row = db.prepare(`
    SELECT k.id AS key_id, k.agent_id, k.key_hash, k.scopes, k.revoked_at,
           a.name, a.wallet_address, a.credit_balance
    FROM api_keys k JOIN agents a ON a.id = k.agent_id
    WHERE k.key_hash = ?
  `).get(keyHash);
  if (!row || row.revoked_at) return null;
  return { ...row, scopes: JSON.parse(row.scopes || '[]') };
}
