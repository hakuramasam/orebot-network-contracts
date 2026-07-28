# ⛏️ OREBOT Network

> **The AI Operating System for Base Blockchain.**

**Version:** v2.0 | **Chain:** Base Mainnet | **Status:** Development

OREBOT Network is an AI operating system for Web3. Developers publish skills, users buy AI services with OREBOT Credits, agents earn TREND — everything interoperates through x402 micropayments.

OREBOT becomes the App Store for autonomous AI agents on Base.

---

## Token Economy

```
User Wallet
    │
    ▼
  TREND  (governance / community)
    │  100 TREND = 1 ORE (governance configurable)
    ▼
   ORE   (utility / AI payments)
    │  1 ORE = 10 OREBOT Credits (governance configurable)
    ▼
 OREBOT Credits  (internal AI usage)
    │
    ▼
 AI Services  (OpenRouter, OpenAI, Claude, Gemini, DeepSeek, Mistral)
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
| OREToken | [`0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD`](https://basescan.org/address/0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD) |
| OREBOTRegistry | [`0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2`](https://basescan.org/address/0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2) |
| AgentPaymentRouter | [`0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e`](https://basescan.org/address/0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e) |
| OREBOTMarketplace | [`0x83358421B952eCe0Fc84529E81A1bC98a1001B7d`](https://basescan.org/address/0x83358421B952eCe0Fc84529E81A1bC98a1001B7d) |
| SignalStaking | [`0x9948378e9088979124184464d145ACF0E217C5a7`](https://basescan.org/address/0x9948378e9088979124184464d145ACF0E217C5a7) |
| TrendBuybackBurner | [`0x02ae416b83dd3A572d98F78E523b3536127eac2d`](https://basescan.org/address/0x02ae416b83dd3A572d98F78E523b3536127eac2d) |

**New contracts (planned):** CreditManager, SkillRegistry, Treasury (upgraded)

---

## OREBOT Agents

| Agent | Role |
|-------|------|
| Commander | Coordinates all AI agents |
| Architect | System architecture |
| Developer | Writes software |
| Auditor | Reviews smart contracts |
| Researcher | Research and reports |
| Trader | Trading AI |
| Creator | Images, NFTs, videos, logos |
| Designer | UI/UX design |
| Treasury | Payments, credits, revenue |
| Guardian | Security, wallet protection, secrets |
| Learning | Learns from usage, improves routing |

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
| NFT | 15–30 |
| Trading | 10–30 |
| Deployment | 5–15 |

---

## Monorepo Structure

```
orebot-network-contracts/
├── apps/
│   ├── web/          # Next.js 16 frontend (dashboard, wallet, marketplace)
│   ├── api/          # API server (auth, credits, AI gateway)
│   └── docs/         # Documentation site
├── packages/
│   ├── agent-sdk/    # AI provider routing, agent definitions
│   ├── credit-engine/ # ORE→Credits conversion, billing
│   ├── blockchain/  # Contract interactions, RPC helpers
│   ├── telemetry/   # Analytics, monitoring
│   ├── skills/       # Skill runtime
│   ├── ui/           # Shared UI components
│   ├── shared/       # Shared utilities
│   └── types/        # TypeScript type definitions
├── contracts/        # Solidity smart contracts (Foundry)
│   ├── src/          # OREToken, Registry, CreditManager, SkillRegistry...
│   └── test/         # Foundry tests
├── infra/
│   ├── docker/
│   └── scripts/
├── docs/
│   └── ARCHITECTURE.md
└── .github/
    └── workflows/
```

---

## AI Providers

OpenRouter · OpenAI · Claude · Gemini · DeepSeek · Mistral · Ollama

---

## Roadmap

| Sprint | Deliverable |
|--------|-------------|
| 1 | Repository, CI/CD, Landing, Dashboard, Wallet, Credits |
| 2 | Credit Engine, TREND/ORE, Deposit, Usage |
| 3 | AI Gateway, OpenRouter, Claude, GPT, Gemini, DeepSeek |
| 4 | Base Integration, Wallet, Swap, NFT, Contracts, Treasury |
| 5 | Marketplace, Skills, Plugins, Agent Registry |
| 6 | Multi-Agent Runtime (Commander, Developer, Trader, Researcher, Guardian) |
| 7 | x402 Payments, Agent-to-Agent, Subscriptions, Streaming |
| 8 | Public Beta |
| 9 | DAO, Governance, Staking, Treasury |
| 10 | Mainnet Launch |

---

## Links

- **GitHub:** [github.com/hakuramasam/orebot-network-contracts](https://github.com/hakuramasam/orebot-network-contracts)
- **Telegram:** [t.me/orebot_network](https://t.me/orebot_network)
- **Chain:** Base Mainnet (chainId 8453)

---

## License

MIT
