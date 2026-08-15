import db from '../db.js';

export function idempotent() {
  return (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key || !req.agent) return next();
    const existing = db.prepare(`SELECT response_body FROM idempotency_keys WHERE agent_id = ? AND idempotency_key = ?`)
      .get(req.agent.agent_id, key);
    if (existing) {
      res.set('Idempotency-Replayed', 'true');
      return res.json(JSON.parse(existing.response_body));
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        db.prepare(`INSERT OR IGNORE INTO idempotency_keys (agent_id, idempotency_key, response_body) VALUES (?, ?, ?)`)
          .run(req.agent.agent_id, key, JSON.stringify(body));
      }
      return originalJson(body);
    };
    next();
  };
}
