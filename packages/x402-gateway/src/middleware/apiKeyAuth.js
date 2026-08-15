import { findAgentByApiKey } from '../apiKeys.js';
import { debitCredits } from '../orebot-adapter.js';

export function apiKeyAuth({ credits = 0, serviceType = null, requiredScope = null } = {}) {
  return (req, res, next) => {
    const rawKey = req.header('x-api-key');
    if (!rawKey) return res.status(401).json({ error: 'missing_api_key' });

    const agent = findAgentByApiKey(rawKey);
    if (!agent) return res.status(401).json({ error: 'invalid_api_key' });

    if (requiredScope && !agent.scopes.includes('*') && !agent.scopes.includes(requiredScope)) {
      return res.status(403).json({ error: 'insufficient_scope', required_scope: requiredScope });
    }

    req.agent = agent;

    if (credits > 0) {
      try {
        const balanceAfter = debitCredits(agent.agent_id, credits, serviceType ?? req.path);
        req.billing = { credits, balanceAfter, serviceType };
      } catch (err) {
        if (err.code === 'INSUFFICIENT_CREDITS') {
          return res.status(402).json({
            error: 'insufficient_credits',
            message: 'Top up OREBOT Credits at POST /v1/credits/topup/:tier',
            balance_credits: err.balance,
            required_credits: credits,
            topup_url: '/v1/credits/topup'
          });
        }
        return res.status(500).json({ error: 'internal_error' });
      }
    }
    next();
  };
}
