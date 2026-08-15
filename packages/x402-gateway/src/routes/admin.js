import { Router } from 'express';
import { createAgent, issueApiKey, revokeApiKey } from '../apiKeys.js';

const router = Router();
const adminToken = () => process.env.ADMIN_TOKEN;
function guard(req, res, next) {
  if (!adminToken() || req.header('authorization') !== `Bearer ${adminToken()}`) return res.status(401).json({ error: 'admin_auth_required' });
  next();
}

router.post('/agents', guard, (req, res) => {
  const { name, wallet_address, scopes } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name_required' });
  const agentId = createAgent({ name, walletAddress: wallet_address });
  const key = issueApiKey(agentId, scopes || ['agent:read', 'ai:execute']);
  res.status(201).json({ agent_id: agentId, ...key });
});

router.post('/keys/:keyId/revoke', guard, (req, res) => {
  revokeApiKey(req.params.keyId);
  res.json({ ok: true });
});

export default router;
