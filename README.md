# ⛏️ OREBOT Network

> **The AI Operating System for Base Blockchain.**

**Version:** v2.0 | **Chain:** Base Mainnet | **Status:** Development

OREBOT Network is an AI operating system for Web3. Developers publish skills, users buy AI services with OREBOT Credits, agents earn TREND — everything interoperates through x402 micropayments.

OREBOT becomes the App Store for autonomous AI agents on Base.

---

## Token Economy

```
User Wallet → TREND → ORE → OREBOT Credits → AI Services
```

| Token | Role |
|-------|------|
| **TREND** | Governance, community, farming, rewards, staking, DAO |
| **ORE** | Utility, AI payments, marketplace, skill purchases, treasury |
| **Credits** | Internal usage, AI consumption, marketplace, premium features |

---

## Deployed Contracts (Base Mainnet, chainId 8453)

| Contract | Address |
|----------|---------|
| OREToken | `0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD` |
| OREBOTRegistry | `0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2` |
| AgentPaymentRouter | `0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e` |
| OREBOTMarketplace | `0x83358421B952eCe0Fc84529E81A1bC98a1001B7d` |
| SignalStaking | `0x9948378e9088979124184464d145ACF0E217C5a7` |
| TrendBuybackBurner | `0x02ae416b83dd3A572d98F78E523b3536127eac2d` |
| CreditManager | `0x35cDfA7eC43Cb7BCa082354981F2D066109F0beE` |
| SkillRegistry | `0x807C2CaB504695037Bef875232b769130009877A` |

**Treasury:** `0x4e26fc6eb05a1cdbd762609fde9958e5b8cc754d`

---

## Agent + API Architecture

OREBOT now separates the agent-facing protocol layer from economic and blockchain settlement:

```text
AI Mind / Agent
      │ MCP / @scalar/agent
      ▼
Scalar Installation MCP
      │ authenticated OpenAPI execution
      ▼
OREBOT x402 Gateway
      ├── per-agent API keys + scopes
      ├── rate limits
      ├── OREBOT Credit ledger
      ├── x402 USDC top-ups
      ▼
Base Mainnet CreditManager
```

Scalar converts the OpenAPI contract into a compact MCP surface with just-in-time operation discovery. The gateway remains authoritative for API identity, credits, payments and blockchain settlement.

See [`docs/SCALAR_AGENT.md`](docs/SCALAR_AGENT.md) and [`docs/openapi/orebot-gateway.yaml`](docs/openapi/orebot-gateway.yaml).

---

## OREBOT Agents

Commander · Architect · Developer · Auditor · Researcher · Trader · Creator · Designer · Treasury · Guardian · Learning

---

## Credit Costs

| Service | Credits |
|---------|---------|
| Basic Chat | 2 |
| Reasoning | 5 |
| Deep Thinking | 10 |
| Research | 20 |
| Coding | 5–25 |
| Website | 20–100 |
| Smart Contract | 20–50 |
| Trading | 10–30 |
| Deployment | 5–15 |

---

## Monorepo Structure

```text
orebot-network-contracts/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── api/                 # API application
│   └── docs/                # Documentation
├── packages/
│   ├── agent-sdk/           # OREBOT agent runtime + Scalar adapters
│   ├── x402-gateway/        # API keys, credits, x402, Base settlement
│   ├── credit-engine/       # ORE → Credits conversion and billing
│   ├── blockchain/          # Contract/RPC helpers
│   ├── telemetry/           # Monitoring
│   ├── skills/              # Skill runtime
│   └── ...
├── src/                     # Solidity contracts
├── test/                    # Foundry tests
├── scripts/                 # Deployment/compile scripts
└── docs/
    ├── ARCHITECTURE.md
    ├── SCALAR_AGENT.md
    └── openapi/orebot-gateway.yaml
```

---

## Security Model

- Scalar installations are scoped to selected OpenAPI operations.
- OREBOT API keys are per-agent and stored hashed.
- Production agents should use explicit scopes such as `agent:read`, `ai:execute`, and optional `credits:topup`.
- `/admin/*` is never exposed through Scalar.
- Trading, swaps, bridges and arbitrary wallet execution are not exposed by the current gateway.
- x402 top-ups use idempotency keys to prevent replayed payments from double-crediting an agent.
- On-chain credit settlement uses the Base `CreditManager` contract.

For autonomous trading, add a separate policy/risk layer before enabling `trade:execute`.

---

## AI Providers

OpenRouter · OpenAI · Claude · Gemini · DeepSeek · Mistral · Ollama

---

## Roadmap

| Sprint | Deliverable | Status |
|--------|-------------|--------|
| 1 | Repository, CI/CD, Landing, Dashboard, Wallet, Credits | ✅ Done |
| 2 | Credit Engine, TREND/ORE, Deposit, Usage | In Progress |
| 3 | AI Gateway, OpenRouter, Claude, GPT, Gemini, DeepSeek | Planned |
| 4 | Base Integration, Wallet, Swap, NFT, Contracts, Treasury | Planned |
| 5 | Marketplace, Skills, Plugins, Agent Registry | Planned |
| 6 | Multi-Agent Runtime | Planned |
| 7 | x402 Payments, Agent-to-Agent, Subscriptions, Streaming | In Progress |
| 8 | Scalar Agent + OpenAPI/MCP integration | **Added** |
| 9 | Policy-controlled Web3/trading execution | Planned |
| 10 | Public Beta / Mainnet expansion | Planned |

---

## Links

- **GitHub:** https://github.com/hakuramasam/orebot-network-contracts
- **Chain:** Base Mainnet (chainId 8453)
- **Scalar:** https://scalar.com/products/agent

---

## License

MIT
