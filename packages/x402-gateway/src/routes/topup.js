import { Router } from 'express';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import { idempotent } from '../middleware/idempotency.js';
import { creditFromPayment, usdToCredits } from '../orebot-adapter.js';

const router = Router();
const PAY_TO = process.env.PAYOUT_WALLET_ADDRESS;
const NETWORK = process.env.X402_NETWORK || 'eip155:8453';
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator';
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitatorClient).register(NETWORK, new ExactEvmScheme());
const TIERS = { 5: { price: '$5.00', label: '50 Credits' }, 20: { price: '$20.00', label: '200 Credits' }, 100: { price: '$100.00', label: '1000 Credits' } };
const x402Routes = {};
for (const [tier, { price, label }] of Object.entries(TIERS)) {
  x402Routes[`POST /v1/credits/topup/${tier}`] = { accepts: { scheme: 'exact', price, network: NETWORK, payTo: PAY_TO }, description: `OREBOT Credits top-up: $${tier} → ${label}` };
}

router.use('/topup/:tier', apiKeyAuth({ requiredScope: 'credits:topup' }));
router.use('/topup/:tier', idempotent());
router.use(paymentMiddleware(x402Routes, resourceServer));

for (const tier of Object.keys(TIERS)) {
  router.post(`/topup/${tier}`, (req, res) => {
    const usdAmount = Number(tier);
    const x402TxHash = req.x402?.settlement?.txHash ?? req.x402?.payment?.txHash ?? null;
    const result = creditFromPayment(req.agent.agent_id, req.agent.wallet_address, usdAmount, x402TxHash);
    res.json({ ok: true, paid_usd: usdAmount, credited: result.credits, balance_credits: result.balance_after, wallet: req.agent.wallet_address, x402_tx: x402TxHash, note: 'On-chain CreditManager settlement is asynchronous.' });
  });
}

router.get('/topup/preview', apiKeyAuth({ requiredScope: 'agent:read' }), (_req, res) => res.json(Object.entries(TIERS).map(([tier, { label }]) => ({ tier_usd: Number(tier), credits: usdToCredits(Number(tier)), label }))));

export default router;
