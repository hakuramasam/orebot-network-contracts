import db from '../db.js';

const WINDOW_SIZE_S = 10;
const WINDOW_COUNT = 6;
const DEFAULT_LIMIT = 60;

export function rateLimiter({ limit = DEFAULT_LIMIT } = {}) {
  return (req, res, next) => {
    if (!req.agent) return next();
    const keyHash = req.agent.key_hash;
    const nowS = Math.floor(Date.now() / 1000);
    const currentBucket = Math.floor(nowS / WINDOW_SIZE_S);
    const oldestBucket = currentBucket - WINDOW_COUNT + 1;

    db.transaction(() => {
      db.prepare(`DELETE FROM rate_limit_windows WHERE key_hash = ? AND window_start < ?`).run(keyHash, oldestBucket);
      db.prepare(`INSERT INTO rate_limit_windows (key_hash, window_start, count) VALUES (?, ?, 1)
        ON CONFLICT (key_hash, window_start) DO UPDATE SET count = count + 1`)
        .run(keyHash, currentBucket);
    })();

    const { total } = db.prepare(`SELECT COALESCE(SUM(count), 0) total FROM rate_limit_windows
      WHERE key_hash = ? AND window_start >= ?`).get(keyHash, oldestBucket);
    const resetAt = (oldestBucket + WINDOW_COUNT) * WINDOW_SIZE_S;
    res.set({ 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': Math.max(0, limit - total), 'X-RateLimit-Reset': resetAt });

    if (total > limit) return res.status(429).json({ error: 'rate_limit_exceeded', retry_after: resetAt - nowS });
    next();
  };
}
