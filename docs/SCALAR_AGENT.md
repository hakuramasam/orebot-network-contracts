# Scalar Agent integration

OREBOT uses Scalar as the API-to-agent/MCP layer, while the OREBOT x402 gateway remains the identity, credit-metering and payment layer.

## Architecture

```text
AI Mind / Agent
      |
      | MCP / @scalar/agent
      v
Scalar Installation MCP
      |
      | authenticated HTTPS
      v
OREBOT x402 Gateway
      |-- X-API-Key + scopes
      |-- rate limiting
      |-- OREBOT Credits ledger
      |-- x402 USDC top-ups
      v
Base Mainnet CreditManager
```

Scalar supports OpenAPI-to-MCP conversion, scoped endpoint selection and per-installation API authentication. Its Agent SDK provides integrations for Vercel AI SDK, OpenAI Agents SDK and Anthropic Claude Agent SDK. See the current Scalar docs: https://scalar.com/products/agent/getting-started

## 1. Publish the OpenAPI document

Use `docs/openapi/orebot-gateway.yaml` in the Scalar Dashboard as the API definition.

Expose only:

- `GET /v1/services` — Search/Execute
- `GET /v1/balance` — Execute
- `POST /v1/chat` — Execute
- `POST /v1/reason` — Execute
- `POST /v1/research` — Execute
- `POST /v1/code` — Execute
- `GET /v1/credits/topup/preview` — Execute
- x402 top-up routes — Execute only for installations explicitly granted `credits:topup`

Do **not** expose `/admin/*` through Scalar.

Do not expose trading, swaps, bridges or arbitrary blockchain transaction execution until a dedicated risk/policy layer exists.

## 2. Installation credentials

Create one Scalar installation per agent or trust domain. Configure the installation with an OREBOT API key. Keep the OREBOT key on Scalar's execution layer rather than placing it in the model prompt.

Recommended scopes:

- `agent:read`
- `ai:execute`
- `credits:topup` only when autonomous payment is explicitly allowed

Never give a general-purpose agent `*` scope in production.

## 3. Agent SDK

Set:

```bash
SCALAR_PERSONAL_ACCESS_TOKEN=...
SCALAR_INSTALLATION_ID=...
```

Then use the helpers exported by `@orebot/agent-sdk`:

```ts
import { createScalarVercelAITools } from '@orebot/agent-sdk';
import { generateText, stepCountIs } from 'ai';

const tools = await createScalarVercelAITools();
const result = await generateText({
  model,
  tools,
  stopWhen: stepCountIs(5),
  prompt: 'Research the Base ecosystem using OREBOT services.'
});
```

Scalar's current SDK also supports OpenAI Agents SDK and Anthropic Claude Agent SDK through its MCP adapters.

## 4. Credit and x402 flow

1. Agent calls an AI service through Scalar.
2. Gateway authenticates the OREBOT API key.
3. Scope and rate limit are checked.
4. Credits are debited atomically.
5. Service executes.
6. If balance is low, the gateway returns HTTP 402 with a top-up hint.
7. An installation with `credits:topup` can use an x402 tier.
8. x402 settles USDC on Base.
9. Gateway records the payment and credits the local ledger.
10. `CreditManager.creditAgent()` performs asynchronous on-chain settlement.

## Security boundary

Scalar is the agent-facing API/MCP layer. It is not the authority for blockchain execution. The gateway and future policy engine must remain authoritative for permissions, spending limits, risk checks, replay protection and audit logging.

For trading, use a separate execution surface with explicit scopes such as `trade:simulate` and `trade:execute`, spending limits, slippage limits, nonce/idempotency controls and a policy engine between the agent and wallet.
