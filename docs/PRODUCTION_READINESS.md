# OREBOT Stage 1 — Production Readiness

This document is the release gate for the Scalar Agent + x402 gateway integration.

## Stage 1 scope

Stage 1 does **not** authorize production USDC, autonomous payments, trading, swaps, bridges, or arbitrary wallet execution. It verifies that the repository is structurally ready for staging.

### Automated gates

- [ ] OpenAPI contract passes Redocly validation.
- [ ] Solidity contracts build successfully with Foundry.
- [ ] Foundry unit tests pass.
- [ ] `@orebot/agent-sdk` builds on Node.js 22.
- [ ] x402 gateway dependencies install successfully.
- [ ] Root production dependencies pass `npm audit --omit=dev --audit-level=high`.
- [ ] Gateway production dependencies pass the same audit.
- [ ] GitHub Actions Stage 1 workflow is green.

### Manual security gates

- [ ] No private keys, API keys, mnemonics, facilitator secrets, database credentials, or Scalar tokens are committed.
- [ ] `GATEWAY_PRIVATE_KEY` is server-only and never exposed to Scalar prompts, browser code, or frontend bundles.
- [ ] `/admin/*` is excluded from the Scalar OpenAPI/MCP surface.
- [ ] Trading, swap, bridge, and arbitrary wallet execution are excluded from the initial Scalar surface.
- [ ] Production API keys are unique per agent/trust domain and have explicit scopes.
- [ ] `credits:topup` is opt-in and disabled for general-purpose agents.
- [ ] x402 payment processing is idempotent and cannot double-credit an agent after retries.
- [ ] On-chain settlement failures are observable and reconcilable with the local credit ledger.

## Required staging evidence before merge

Record the following in the PR before merging to `master`:

1. CI run URL and green status.
2. OpenAPI validation result.
3. Foundry build/test result.
4. Agent SDK build result.
5. Dependency audit result with no unresolved high/critical production vulnerabilities.
6. Confirmation that no production secrets are present in Git history for the feature branch.
7. Review of Scalar installation scopes.

## Release decision

**GO** only when every automated gate is green and every manual security gate is checked.

**NO-GO** if any payment, credit, key-management, authorization, or blockchain-settlement control is unverified.

## Next stage

After Stage 1 passes, proceed to Stage 2 staging deployment:

`Scalar Installation → OREBOT Gateway → x402 facilitator → Base CreditManager`

Do not enable autonomous trading execution as part of Stage 2.
