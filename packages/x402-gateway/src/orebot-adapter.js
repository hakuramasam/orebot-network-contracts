import crypto from 'crypto';
import db from './db.js';
import { mintCreditsOnChain } from './contracts.js';

const CREDITS_PER_USD = Number(process.env.CREDITS_PER_USD || 10);

export function usdToCredits(usdAmount) {
  return Math.floor(usdAmount * CREDITS_PER_USD);
}

export function creditFromPayment(agentId, walletAddress, usdAmount, x402TxHash = null) {
  const credits = usdToCredits(usdAmount);
  const result = db.transaction(() => {
    const agent = db.prepare(`SELECT credit_balance FROM agents WHERE id = ?`).get(agentId);
    if (!agent) throw new Error('Agent not found');
    const balanceAfter = agent.credit_balance + credits;
    db.prepare(`UPDATE agents SET credit_balance = ? WHERE id = ?`).run(balanceAfter, agentId);
    const ledgerId = crypto.randomUUID();
    db.prepare(`INSERT INTO ledger (id, agent_id, type, credits, balance_after, x402_tx_hash) VALUES (?, ?, 'topup', ?, ?, ?)`)
      .run(ledgerId, agentId, credits, balanceAfter, x402TxHash);
    return { credits, balance_after: balanceAfter, ledger_id: ledgerId };
  })();

  if (walletAddress && process.env.GATEWAY_PRIVATE_KEY) {
    mintCreditsOnChain(walletAddress, credits)
      .then(receipt => {
        db.prepare(`UPDATE ledger SET on_chain_tx = ? WHERE id = ?`).run(receipt.hash, result.ledger_id);
        db.prepare(`UPDATE agents SET on_chain_synced = 1 WHERE id = ?`).run(agentId);
      })
      .catch(err => console.error(`[orebot-adapter] settlement failed for ${agentId}:`, err.message));
  }
  return result;
}

export function debitCredits(agentId, credits, serviceType = null) {
  return db.transaction(() => {
    const agent = db.prepare(`SELECT credit_balance FROM agents WHERE id = ?`).get(agentId);
    if (!agent) throw new Error('Agent not found');
    if (agent.credit_balance < credits) {
      const err = new Error('Insufficient OREBOT Credits');
      err.code = 'INSUFFICIENT_CREDITS';
      err.balance = agent.credit_balance;
      throw err;
    }
    const balanceAfter = agent.credit_balance - credits;
    db.prepare(`UPDATE agents SET credit_balance = ? WHERE id = ?`).run(balanceAfter, agentId);
    db.prepare(`INSERT INTO ledger (id, agent_id, type, credits, balance_after, service_type) VALUES (?, ?, 'debit', ?, ?, ?)`)
      .run(crypto.randomUUID(), agentId, credits, balanceAfter, serviceType);
    return balanceAfter;
  })();
}
