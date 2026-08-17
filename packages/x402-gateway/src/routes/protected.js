import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { costFor } from '../costs.js';

const router = Router();
const protect = (serviceType) => [
  apiKeyAuth({ requiredScope: 'ai:execute' }),
  rateLimiter({ limit: 60 }),
  apiKeyAuth({ credits: costFor(serviceType), serviceType, requiredScope: 'ai:execute' })
];

router.post('/chat', protect('basic_chat'), (req, res) => res.json({ ok: true, service: 'basic_chat', billed_credits: req.billing.credits, balance_credits: req.billing.balanceAfter, response: '[stub] chat response' }));
router.post('/reason', protect('reasoning'), (req, res) => res.json({ ok: true, service: 'reasoning', billed_credits: req.billing.credits, balance_credits: req.billing.balanceAfter, response: '[stub] reasoning response' }));
router.post('/research', protect('research'), (req, res) => res.json({ ok: true, service: 'research', billed_credits: req.billing.credits, balance_credits: req.billing.balanceAfter, response: '[stub] research response' }));
router.post('/code', protect('coding'), (req, res) => res.json({ ok: true, service: 'coding', billed_credits: req.billing.credits, balance_credits: req.billing.balanceAfter, response: '[stub] coding response' }));

router.get('/balance', apiKeyAuth({ requiredScope: 'agent:read' }), (req, res) => res.json({ agent: req.agent.name, wallet: req.agent.wallet_address, balance_credits: req.agent.credit_balance }));

router.get('/services', apiKeyAuth({ requiredScope: 'agent:read' }), (_req, res) => res.json({
  services: [
    { name: 'basic_chat', endpoint: '/v1/chat', credits: 2, risk: 'low' },
    { name: 'reasoning', endpoint: '/v1/reason', credits: 5, risk: 'low' },
    { name: 'research', endpoint: '/v1/research', credits: 20, risk: 'low' },
    { name: 'coding', endpoint: '/v1/code', credits: 5, risk: 'low' }
  ],
  execution_policy: 'AI execution is scoped by agent API-key permissions; trading/blockchain execution is intentionally not exposed by this gateway.'
}));

export default router;
