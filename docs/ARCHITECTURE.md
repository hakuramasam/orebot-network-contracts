# OREBOT Network v2.0 — Architecture & System Design

> **The AI Operating System for Base Blockchain.**

Welcome to the comprehensive system architecture and technical design document for **OREBOT Network v2.0**. This document details the transition of OREBOT from a specialized on-chain signal mining workforce into a robust, general-purpose **AI Operating System on the Base Blockchain**.

---

## 1. Vision

OREBOT Network v2.0 is **The AI Operating System for Base Blockchain**. 

The web3 landscape is cluttered with isolated AI agents and speculative wrapper tokens. OREBOT v2.0 redefines this paradigm by establishing a decentralized, interoperable, and standardized machine-to-machine economy. 

* **Developers Publish Skills**: Anyone can write, package, and deploy specialized AI capabilities (Skills) to the network.
* **Users Buy AI Using Credits**: Non-crypto and crypto users alike access cutting-edge AI utilities by spending OREBOT Credits.
* **Agents Earn TREND**: Operating agents are incentivized through the staking, pooling, and distribution of $TREND, the network’s deflationary asset.
* **Skills Earn ORE**: Creators of AI tools and skills are rewarded directly in $ORE utility tokens upon usage.
* **Everything Interoperates Through x402**: All assets, agent identities, skills, and licenses are tokenized via the experimental, dual-state **x402 protocol** (combining ERC-20 utility properties with ERC-721 non-fungible ownership), allowing native composition across the entire ecosystem.

---

## 2. System Overview

OREBOT Network is engineered as a highly scalable, modular **4-Layer Architecture** that bridges off-chain AI processing with on-chain cryptographic execution and validation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      LAYER 4: APPLICATION LAYER                       │
│  ┌─────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────┐  │
│  │   Web Portal    │ │   Marketplace │ │ Developer SDK │ │Dashboard │  │
│  └─────────────────┘ └───────────────┘ └───────────────┘ └──────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 3: SERVICE LAYER                          │
│  ┌─────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────┐  │
│  │   AI Gateway    │ │ Credit Engine │ │ Agent Runtime │ │ MCP Hub  │  │
│  ├─────────────────┴─┴───────────────┴─┴───────────────┴─┴──────────┤  │
│  │              Plugin Runtime & x402 Interop Engine                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 2: CONTRACT LAYER                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   Existing Deployed Contracts:                                   │  │
│  │   OREToken | Registry | PaymentRouter | Marketplace | Staking     │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │   New Planned Contracts:                                         │  │
│  │   CreditManager | SkillRegistry | Upgraded Treasury (Safe)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         LAYER 1: TOKEN LAYER                           │
│     $TREND (Staking/Burn) ──► $ORE (Utility) ──► OREBOT Credits (AI)    │
└────────────────────────────────────────────────────────────────────────┘
```

### Layer 1: Token Layer
The foundational economic bedrock. It regulates token supply, liquidity, and value flows. It drives deflationary pressure via $TREND burns while expanding network utility via $ORE-to-Credit conversions.

### Layer 2: Contract Layer
The on-chain core consisting of smart contracts running on the Base Blockchain. These govern identity (Registry), escrow payments (PaymentRouter), predictions and burns (SignalStaking), on-chain service listings (Marketplace), credit minting (CreditManager), and developer skill verification (SkillRegistry).

### Layer 3: Service Layer
The off-chain execution environment. It contains containerized runtimes for executing agents and developer skills, an optimized AI Gateway proxying calls to upstream LLMs, a real-time Credit Engine ledger, and the x402 interoperability engine managing cross-token asset logic.

### Layer 4: Application Layer
The client interface suite. It includes the React/Next.js Web Portal, the Skills Marketplace UI, public and private APIs, and the analytics dashboard showing real-time statistics of the ecosystem.

---

## 3. Token Economy

The OREBOT Network v2.0 economy runs on a tightly coupled **three-token conversion chain** designed to convert speculative liquidity into concrete computational utility.

```
  ┌──────────────────┐       100:1       ┌──────────────────┐
  │   User Wallet    ├──────────────────►│   $ORE Token     │
  │ ($TREND Token)   │  Governance Rate  │ (Agent Utility)  │
  └──────────────────┘                   └────────┬─────────┘
                                                  │
                                            100:10│ Governance Rate
                                                  ▼
  ┌──────────────────┐  Settles Invoice  ┌──────────────────┐
  │   AI Providers   │◄──────────────────┤  OREBOT Credits  │
  │ (OpenRouter/etc.)│  Treasury Fiat/Op │  (Off-chain AI)  │
  └──────────────────┘                   └──────────────────┘
```

### The Conversion Chain
1. **$TREND Acquisition**: Users hold or acquire $TREND, the pre-existing community-governed ERC-20 staking asset.
2. **$TREND to $ORE Conversion**:
   * Users lock/swap $TREND to receive $ORE.
   * **Conversion Rate**: $100\text{ TREND} = 1\text{ ORE}$ (subject to adjustments via on-chain governance).
   * Swapped $TREND tokens are routed to the `TrendBuybackBurner` and permanently burned to the dead address (`0x000000000000000000000000000000000000dEaD`), contracting circulating supply.
3. **$ORE to Credit Allotment**:
   * Users deposit $ORE into the `CreditManager` contract to generate OREBOT Credits.
   * **Conversion Rate**: $100\text{ ORE} = 10\text{ OREBOT Credits}$ (subject to adjustments via on-chain governance).
   * Deposited $ORE is either locked as system backing or burned during high-utilization cycles.
4. **AI Services Execution**:
   * Users spend OREBOT Credits to trigger agent workflows and query models.
   * Credits are depleted off-chain by the Credit Engine based on computational weight.
5. **Upstream API Settlement**:
   * The backend orchestrator processes LLM requests using API nodes.
   * The Treasury settles raw invoices with underlying AI providers (OpenRouter, OpenAI, Claude, etc.) using fiat or stablecoins funded by network operations and yield generation.

---

## 4. Core Modules

OREBOT Network v2.0 is composed of 13 modular subsystems:

1. **OREBOT Core**: The central system orchestrator that initializes agents, runs global configuration setups, and handles overall lifecycle management. It acts as the backbone coordinating communications and states between all system-level and user-level modules.
2. **AI Gateway**: An API routing hub that bridges internal agent requests with upstream large language model providers. It manages connection pooling, rate limits, automatic model fallback, and load balancing across providers like OpenAI, Anthropic, Gemini, and DeepSeek.
3. **Credit Engine**: A ledger and payment subsystem that handles off-chain Credit balance management. It processes conversions from $ORE, deducts credits based on request complexity, logs token usage, and triggers automated refills.
4. **Blockchain Engine**: The integration layer that interacts with the Base Blockchain and other EVM-compatible chains. It wraps low-level JSON-RPC clients, submits transactions, listens to contract events, and parses gas costs for agent execution.
5. **Marketplace**: A decentralized platform module allowing developers to list, license, and sell custom AI agent skills. It connects directly with the `OREBOTMarketplace` smart contract to facilitate trustless, secure ORE-denominated revenue distribution.
6. **Agent Runtime**: A secure, isolated container environment responsible for executing agent loops. It handles prompt engineering, conversational memory retention, and goal-directed task execution.
7. **Plugin Runtime**: An extensibility framework that loads and manages integration plugins. It provides plugins with permissioned hooks to access third-party APIs, read file paths, or execute system utilities.
8. **Skill Runtime**: A microservices runtime dedicated to executing developer-defined skills. It parses skill manifests, validates input payloads, enforces execution time limits, and outputs structured results.
9. **MCP Runtime**: A Model Context Protocol (MCP) server integration layer. It allows OREBOT agents to connect seamlessly with standard MCP servers, enabling rich tool access, document search, and database queries.
10. **x402 Runtime**: The execution module for the experimental x402 token standard. It manages tokenized agent ownership, fractional skill licensing, and asset interoperability across the network.
11. **Analytics**: A data aggregation and visualization module that feeds the web dashboard. It tracks and indexes system TVL, volume, credit spending, token burn rates, and individual agent performance metrics.
12. **Treasury**: The asset management hub that manages network-accrued fees, $TREND and $ORE reserves, and automated buyback/burn operations. It communicates with the Safe Multi-sig contract to execute programmatic financial strategies.
13. **Security**: The system monitoring and protection module. It audits runtime logs, secures environment variables, scans active containers for anomalies, and manages API keys and cryptographic secrets safely.

---

## 5. AI Agents

The v2.0 network operates with **11 specialized autonomous agents**, each assigned a distinct operational role.

* **Commander**: The ultimate coordinator of the network. It parses user intents, delegates tasks to appropriate sub-agents, aggregates their findings, and outputs unified results.
* **Architect**: The system's blueprint generator. It specializes in software design patterns, system architecture, database schema design, and technical planning, translating high-level requirements into structured specifications.
* **Developer**: The primary code author. It writes clean, standard, and highly optimized software across multiple languages (TypeScript, Python, Solidity) and formats files directly within workspaces.
* **Auditor**: The smart contract review specialist. It scans Solidity source code for common reentrancy, overflow, or logic bugs, validating against OpenZeppelin standards and outputting vulnerability reports.
* **Researcher**: The quantitative information harvester. It conducts deep web research, parses dense documents or specifications, scrapes market data, and compiles comprehensive reports on complex topics.
* **Trader**: The financial execution unit. It monitors market liquidity, evaluates trading signals, places on-chain swaps, and manages portfolio allocations autonomously based on risk parameters.
* **Creator**: The multimedia generator. It produces creative assets including high-quality images, NFTs, videos, logos, and marketing copy, tailoring them to community aesthetics.
* **Designer**: The user interface architect. It crafts beautiful, intuitive, and modern UI/UX layouts, wireframes, and CSS/React styles to ensure seamless web interfaces.
* **Treasury**: The financial record keeper. It tracks credit balances, computes conversion rates, initiates buyback-and-burn cycles, and ensures accurate payment routing.
* **Guardian**: The security sentinel. It monitors smart contract transactions, sweeps operator wallets, protects private keys, and alerts the team immediately upon detecting on-chain anomalies.
* **Learning**: The self-optimizing engine. It analyzes model response quality, user ratings, and API latency to continuously refine system prompts and model routing configurations.

---

## 6. Smart Contracts

The OREBOT Network smart contract suite consists of **six deployed mainnet contracts** and **three planned contracts** under the v2.0 upgrade.

### Existing Contracts (Deployed on Base Mainnet)

| Contract | Address | Purpose |
| :--- | :--- | :--- |
| **`OREToken`** | `0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD` | Native ERC-20 utility token with 1B cap and permit support. |
| **`OREBOTRegistry`** | `0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2` | Roster mapping agent callsigns to operator addresses, classes, and reputation. |
| **`AgentPaymentRouter`** | `0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e` | Escrow router managing cross-agent task assignment payments. |
| **`OREBOTMarketplace`** | `0x83358421B952eCe0Fc84529E81A1bC98a1001B7d` | Fixed-price decentralized listings of agent services. |
| **`SignalStaking`** | `0x9948378e9088979124184464d145ACF0E217C5a7` | $TREND-powered prediction markets that burn 50% of losing stakes. |
| **`TrendBuybackBurner`** | `0x02ae416b83dd3A572d98F78E523b3536127eac2d` | Programmatic contract that routes acquired $TREND to the `dead` address. |

### New Contracts (Planned for v2.0)
* **`CreditManager`**: Handles deposits of $ORE and $TREND on-chain and triggers corresponding off-chain credit allocations via event logs.
* **`SkillRegistry`**: Manages developer-submitted agent skills, licensing NFTs, and payment routing using the x402 interoperability framework.
* **`Treasury (Upgraded)`**: A Gnosis Safe multi-signature wallet equipped with custom automated execution modules for yield allocation and token buybacks.

---

## 7. Credit System

OREBOT Credits represent the standardized off-chain computational unit of the ecosystem. The execution of any agent request consumes credits according to its complexity:

| Task Type | Credit Cost | Description |
| :--- | :--- | :--- |
| **Basic Chat** | 2 Credits | Conversational queries with standard LLMs (e.g., GPT-4o-mini). |
| **Reasoning** | 5 Credits | Complex logic chain prompting using reasoning models. |
| **Deep Thinking** | 10 Credits | Advanced processing using deep thinking models (e.g., DeepSeek-R1, o1-pro). |
| **Research** | 20 Credits | Web scraping, data aggregation, and structured report compilation. |
| **Coding** | 5 - 25 Credits | Code generation, debugging, refactoring, and workspace file editing. |
| **Website** | 20 - 100 Credits | Full-stack landing page generation, including CSS styling and react routing. |
| **Smart Contract** | 20 - 50 Credits | Secure Solidity contract authoring, testing, and vulnerability auditing. |
| **NFT** | 15 - 30 Credits | Creative image asset generation and on-chain contract minting. |
| **Trading** | 10 - 30 Credits | Quantitative analysis, swap modeling, and automated asset deployment. |
| **Deployment** | 5 - 15 Credits | Containerized environment deployment, scripting, and pipeline testing. |

---

## 8. Plugin System

OREBOT v2.0 achieves infinite extensibility through its Plugin System. The following **27 production plugins** are supported:

1. **Coinbase Smart Wallet Integration**: Integrates directly with Coinbase Smart Wallets to manage on-chain assets via passkeys.
2. **Aerodrome Liquidity Optimizer**: Monitors and automatically rebalances liquidity positions on the Aerodrome DEX.
3. **Aave Borrow/Lend Automator**: Automates lending supply and borrowing thresholds based on on-chain utilization rates.
4. **Uniswap V3 Auto-Pool Manager**: Manages concentrated liquidity ranges dynamically for Uniswap V3 on Base.
5. **Base Name Service (BNS) Resolver**: Resolves and registers human-readable .base domains for agent-to-agent operations.
6. **Basescan Verifier**: Programmatically verifies and publishes deployed smart contract code on Basescan.
7. **Safe Multi-Sig Orchestrator**: Automates proposal creation, queueing, and execution within Gnosis Safe multi-signature wallets.
8. **OpenRouter AI Hub**: Connects agent workflows with dozens of LLMs via the centralized OpenRouter gateway.
9. **CoinGecko Market Sentinel**: Ingests real-time token prices, market caps, and trading volumes from CoinGecko.
10. **Chainlink Price Feed Oracle**: Reads tamper-proof, high-fidelity asset prices directly from Chainlink on-chain feeds.
11. **Pyth Network Real-Time Oracle**: Latency-optimized real-time price feeds for advanced trading agent routing.
12. **Morpho Blue Yield Aggregator**: Optimizes risk-adjusted yield across Morpho Vaults on Base.
13. **Superchain Interop Bridge**: Coordinates token transfers and messages across Optimism, Base, and other OP Stack chains.
14. **Base Paint Canvas Agent**: Programmatically reads and mints pixel contributions on the Base Paint collaborative canvas.
15. **Farcaster Social Broadcaster**: Publishes text updates, frames, and casts to Farcaster hubs and Neynar API.
16. **Neynar Farcaster Ingestor**: Monitors social signals from Farcaster to detect early-stage trending memecoins.
17. **Zora NFT Creator**: Automates the creation, metadata uploading, and minting of media collections on Zora.
18. **Thirdweb Smart Contract Deployer**: Deploys pre-built and custom smart contracts using Thirdweb SDK.
19. **DefiLlama TVL Monitor**: Reads TVL, protocol fees, and historical yields to inform treasury allocations.
20. **Telegram Notification Bot**: Sends automated security, trading, and system performance alerts directly to Telegram channels.
21. **Slack Webhook Integrator**: Posts operations reports, transaction links, and system heartbeats to Slack.
22. **Discord Sentinel**: Operates Discord bots to facilitate credit purchases and community-driven AI requests.
23. **Covalent Unified API Ingestor**: Fetches detailed historic wallet balances and transactional history on Base.
24. **The Graph Subgraph Indexer**: Queries decentralized indexing subgraphs to gather custom protocol events.
25. **Tenderly Simulation Engine**: Runs dry-run transaction simulations to detect gas failures before execution.
26. **QuickNode RPC Hub**: Handles failover RPC request routing across multiple node endpoints.
27. **Privy Embedded Wallet Connector**: Facilitates social logins and embedded web-app wallet creation for end-users.

---

## 9. Skills Marketplace

The **Skills Marketplace** is the decentralized application layer of OREBOT Network. It allows developers and users to build, monetize, and distribute AI capabilities.

```
 DEVELOPER                           MARKETPLACE                         OPERATOR
 ┌──────────────┐                     ┌───────────────┐                  ┌──────────────┐
 │ Author Skill ├────────────────────►│ Publish Skill │◄─────────────────┤ Buy License  │
 │ (Manifest)   │                     │ (x402 NFT)    │  Pay $ORE/$TREND │ (Credits/ORE)│
 └──────────────┘                     └───────┬───────┘                  └──────┬───────┘
                                              │                                 │
                                              ▼                                 ▼
                                      ┌───────────────┐                  ┌──────────────┐
                                      │ Audit & Code  │                  │ Mount & Run  │
                                      │ (Auditor Agent)                  │ (Skill Exec) │
                                      └───────────────┘                  └──────────────┘
```

* **Publish**: Developers write specialized scripts (Skills) along with a `manifest.json` describing input variables, schemas, and permissions. Deployed via the `SkillRegistry` contract, publishing mints a dual-state **x402 NFT** representing developer intellectual property.
* **Install**: System operators purchase licenses using ORE tokens. The license is minted as a fractional x402 sub-token, allowing the buyer's agent instance to mount and execute the skill.
* **Sell & Revenue Distribution**: Every skill run triggers a micropayment logic. 80% goes to the developer wallet, 10% is routed to the OREBOT Treasury, and 10% is converted to $TREND and burned.
* **Rate & Audit**: Users rate skills post-execution. Additionally, the network's **Auditor Agent** continuously scans registered skills for security risks, maintaining a public on-chain reputation score for each developer.
* **Update**: Developers can update skills permissionlessly. The system supports multi-versioning, ensuring legacy workflows do not break while allowing users to opt into upgraded capabilities.

---

## 10. AI Providers

OREBOT utilizes a fallback-resilient, latency-optimized gateway supporting the industry's leading AI foundation models:

* **OpenRouter**: Our primary gateway aggregator, routing requests dynamically across 100+ open and closed models.
* **OpenAI**: Powers the Commander and Architect agents via high-speed GPT-4o and o1 models.
* **Claude (Anthropic)**: The core model driving the Developer and Auditor agents due to its superior coding and structural parsing.
* **Gemini (Google)**: Used by the Researcher agent to process long contexts (up to 2M tokens) and multimodal files.
* **DeepSeek**: Handles cost-effective mathematical reasoning and logical deduction via DeepSeek-R1.
* **Mistral**: Offloads lightweight agent tasks and local embeddings using Mistral-Large.
* **Ollama**: Provides fully localized, private model executions in secure sandbox environments for enterprise operators.

---

## 11. Supported Chains

While OREBOT Network v2.0 is natively built and optimized for the L2 scaling capabilities of **Base**, its service layer is chain-agnostic.

* **Primary Chain**: 
  * **Base (Chain ID: `8453`)**: Settles all registry operations, prediction markets, credit purchases, and skill licensing.
* **Future/Secondary Chains (Cross-Chain Bridging via LayerZero & Chainlink CCIP)**:
  * **Ethereum Mainnet**: High-value asset settlement and registry backups.
  * **Arbitrum One / Optimism / Polygon PoS**: Low-cost execution and localized plugin operations.
  * **Solana**: High-throughput trading integrations and token launches.
  * **BNB Chain**: High-speed yield farming and liquidity integrations.

---

## 12. Database Schema

The system uses a highly available, horizontally scaled **MongoDB** database to log transactional state and off-chain execution data.

### Collection Layouts

#### `Users`
```jsonc
{
  "_id": "ObjectId",
  "username": "String",
  "email": "String",
  "created_at": "Date",
  "role": "String", // "admin", "developer", "user"
  "oauth": {
    "github_id": "String",
    "farcaster_fid": "Number",
    "discord_id": "String"
  }
}
```

#### `Wallets`
```jsonc
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "address": "String", // EVM Address
  "chain": "String", // "base", "ethereum", etc.
  "wallet_type": "String", // "smart_wallet", "eoa", "embedded"
  "status": "String" // "active", "disconnected"
}
```

#### `Credits`
```jsonc
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "balance": "Decimal128", // Active Credits
  "lifetime_purchased": "Decimal128",
  "lifetime_spent": "Decimal128",
  "last_updated": "Date"
}
```

#### `Transactions`
```jsonc
{
  "_id": "ObjectId",
  "tx_hash": "String", // On-chain Hash (null if off-chain credit purchase)
  "from_address": "String",
  "to_address": "String",
  "amount": "Decimal128",
  "token_symbol": "String", // "TREND", "ORE", "CREDIT"
  "status": "String", // "pending", "success", "failed"
  "created_date": "Date"
}
```

#### `AI_Usage`
```jsonc
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "agent_id": "String", // Call sign (e.g. "ORE-001")
  "model_name": "String", // e.g. "anthropic/claude-3.5-sonnet"
  "prompt_tokens": "Number",
  "completion_tokens": "Number",
  "credits_spent": "Decimal128",
  "created_date": "Date"
}
```

#### `Marketplace`
```jsonc
{
  "_id": "ObjectId",
  "skill_id": "ObjectId",
  "price_ore": "Decimal128",
  "total_installs": "Number",
  "average_rating": "Double",
  "status": "String" // "listed", "unlisted", "flagged"
}
```

#### `Skills`
```jsonc
{
  "_id": "ObjectId",
  "developer_id": "ObjectId",
  "name": "String",
  "version": "String",
  "manifest": {
    "description": "String",
    "permissions": ["String"],
    "inputs": "Object"
  },
  "ipfs_hash": "String",
  "github_repo": "String",
  "created_at": "Date"
}
```

#### `Agents`
```jsonc
{
  "_id": "ObjectId",
  "callsign": "String", // "ORE-001", etc.
  "owner_id": "ObjectId",
  "status": "String", // "running", "paused", "error"
  "config": {
    "temperature": "Double",
    "system_prompt": "String",
    "plugins_enabled": ["String"]
  },
  "reputation": "Number"
}
```

#### `Activity_Logs`
```jsonc
{
  "_id": "ObjectId",
  "actor_id": "String", // User ID or Agent ID
  "action": "String", // e.g. "execute_task"
  "details": "String",
  "level": "String", // "info", "warn", "error"
  "created_date": "Date"
}
```

#### `Treasury`
```jsonc
{
  "_id": "ObjectId",
  "balance_usdc": "Decimal128",
  "balance_trend": "Decimal128",
  "balance_ore": "Decimal128",
  "buyback_burn_log": [
    {
      "tx_hash": "String",
      "trend_amount": "Decimal128",
      "timestamp": "Date"
    }
  ],
  "last_rebalanced": "Date"
}
```

---

## 13. API Surface

The OREBOT Network API is modular, secure, and accessible via standard HTTP and WebSocket endpoints under the `/api/v2/` namespace.

* **Auth**:
  * `POST /auth/register` — Creates a new user profile.
  * `POST /auth/login` — Initiates secure wallet signature or social login.
  * `POST /auth/oauth/callback` — Connects third-party accounts (GitHub, Discord, Farcaster).
* **Wallet**:
  * `GET /wallets` — Retrieves linked custodial and non-custodial wallets.
  * `POST /wallets/register` — Adds a newly signed wallet address to the user account.
* **Credits**:
  * `GET /credits/balance` — Returns active OREBOT Credits balance.
  * `POST /credits/deposit` — Submits an on-chain transaction receipt for validation and credit allotment.
* **AI Gateway**:
  * `POST /ai/chat` — Streams conversational responses from standard models.
  * `POST /ai/reason` — Submits a complex query to the deep reasoning engine.
* **Marketplace**:
  * `GET /marketplace/listings` — Lists available developer-published skills.
  * `POST /marketplace/purchase` — Registers a license purchase transaction.
* **Skills**:
  * `POST /skills/register` — Uploads and registers a new developer skill manifest.
  * `POST /skills/execute` — Triggers execution of a purchased skill in a secure container.
* **Agents**:
  * `GET /agents/status` — Retrieves real-time state of active OREBOT agents.
  * `POST /agents/task` — Dispatches a multi-step workflow task to the Commander agent.
* **Trading**:
  * `GET /trading/signals` — Fetches verified signal streams.
  * `POST /trading/execute` — Dispatches execution parameters to the on-chain Trader agent.
* **NFT**:
  * `POST /nft/generate` — Requests Creator agent asset generation and Zora contract deployment.
* **Portfolio**:
  * `GET /portfolio/holdings` — Tracks cumulative asset growth and yields on Base.
* **Treasury**:
  * `GET /treasury/stats` — Reports treasury reserves and active buyback-burn transaction metrics.
* **Analytics**:
  * `GET /analytics/global` — Streams global KPI metrics (credits spent, tokens burned, active containers).

---

## 14. Roadmap

The v2.0 development roadmap is structured across **10 progressive sprints**:

```
 Sprints 1-3          Sprints 4-6          Sprints 7-9          Sprint 10
 ┌───────────┐        ┌───────────┐        ┌───────────┐        ┌───────────┐
 │ Core      │───────►│ Agentic   │───────►│ Marketplace│───────►│ Fully     │
 │ Foundation│        │ Expansion │        │ & OS Launch│        │ Decent.   │
 └───────────┘        └───────────┘        └───────────┘        └───────────┘
```

* **Sprint 1: Genesis Deployment & Core Bridging**
  * Deliverables: Secure audited contract deployment on Base; setup Multi-sig Treasury; establish $TREND buyback and burn contracts; baseline OREToken ERC-20 utility.
* **Sprint 2: Credit Engine & AI Gateway**
  * Deliverables: Launch backend Credit Engine; introduce TREND → ORE → Credits conversion API; establish secure OpenRouter gateway; enable credit tracking for standard LLMs.
* **Sprint 3: OREBOT Registry & Identity**
  * Deliverables: Deploy updated `OREBOTRegistry` with callsign registration; operator wallet mappings; baseline reputations; reputation-weighted on-chain mining mechanics.
* **Sprint 4: Agent Core Runtimes (Commander, Architect, Developer)**
  * Deliverables: Launch containerized Agent Runtime; complete multi-agent orchestration via Commander; implement code generation loops with Developer and Architect agents.
* **Sprint 5: Security & Guardian Watch**
  * Deliverables: Deploy the Guardian agent; implement real-time operator wallet sweeps; integrate contract validation tools with the Auditor agent.
* **Sprint 6: Plugin Runtime & Core Connectors**
  * Deliverables: Release Plugin Runtime; implement the first 10 core integration plugins (Coinbase Wallet, Aerodrome, Safe, Neynar, etc.); enable direct on-chain contract interactions from agent containers.
* **Sprint 7: Skills Registry & Marketplace**
  * Deliverables: Deploy `SkillRegistry` contract; launch the OREBOT Web Marketplace UI; enable developer skill uploads, licensing, and ORE-denominated pricing structures.
* **Sprint 8: x402 Interoperability Standard**
  * Deliverables: Implement the x402 token standard for agent-owned assets; introduce skill licensing NFTs; enable multi-chain agent-to-agent contract calls.
* **Sprint 9: Analytics Dashboard & Advanced Trading Agent**
  * Deliverables: Launch complete web analytics dashboard; deploy the quantitative Trading agent; implement live TVL, credit consumption, and system revenue monitoring.
* **Sprint 10: Full Decentralization & Governance Handover**
  * Deliverables: Deploy governance-controlled parameter tuning for TREND/ORE/Credit conversion rates; transfer OREToken admin roles to treasury multi-sig; finalize self-improving Learning Agent.

---

## 15. Monorepo Structure

OREBOT Network v2.0 is managed inside a single, highly integrated monorepo workspace:

```
orebot-network-v2/
├── .agents/                    # Subagent memory, rules, and skills configurations
│   ├── .memory/                # Runtime conversation and persistent storage files
│   └── skills/                 # Custom local agent skill specifications
├── base44/                     # Platform Orchestrator configuration templates
│   ├── agents/                 # Default agent operational manifests
│   ├── connectors/             # Integrations for social networks and external APIs
│   ├── entities/               # Low-level DB structures and platform models
│   └── workflows/              # Orchestrated automation blueprints (loops, cron tasks)
├── contracts/                  # Solidity smart contract suite
│   ├── broadcast/              # Transaction logs and deployed addresses on Base
│   ├── cache/                  # Compiled Solidity artifacts
│   ├── contracts/              # Production Smart Contracts
│   │   ├── OREToken.sol        # $ORE utility token standard
│   │   ├── OREBOTRegistry.sol  # On-chain workforce registry
│   │   ├── AgentPaymentRouter.sol # Task payment escrow contract
│   │   ├── OREBOTMarketplace.sol # On-chain services listings
│   │   ├── SignalStaking.sol   # $TREND-powered prediction market
│   │   └── TrendBuybackBurner.sol # Programmatic buyback/burn sink
│   ├── docs/                   # Contract-specific documentation
│   │   └── ARCHITECTURE.md     # [THIS FILE] System Design & Specifications
│   ├── lib/                    # Core imports (OpenZeppelin, safe-contracts)
│   ├── out/                    # Forge compilation outputs
│   ├── safe-scripts/           # multisig management scripts
│   ├── scripts/                # Deployment and environment hardening scripts
│   ├── test/                   # Smart contract unit and integration tests
│   └── web/                    # Next.js web application frontend
│       ├── public/             # Static web assets
│       ├── src/                # UI source files (React, Tailwind, Lucide Icons)
│       ├── package.json        # Next.js frontend dependencies
│       └── tsconfig.json       # TypeScript frontend configuration
├── docs/                       # Global project documentation
│   └── DEPLOY.md               # Mainnet smart contract deployment instructions
├── entities/                   # Local database entity mocks
├── functions/                  # Serverless background functions (TypeScript)
│   ├── postTelegram/           # Programmatic Telegram broadcaster
│   ├── readTrendBalance/       # Real-time on-chain token scanner
│   ├── guardianSweep/          # Security-sweeping wallet monitor
│   └── snapshotTrendState/     # Staking epoch logger
├── scripts/                    # General repository automation scripts
├── package.json                # Root package configuration (Yarn/PNPM Workspaces)
└── README.md                   # Global project intro and developer quickstart
```

---

## 16. Developer Quickstart & Setup

### Prerequisites
* **NodeJS** >= v18
* **Foundry**: Solidity testing and deployment environment
* **Docker**: Local containerized agent executions

### Local Installation
```bash
# Clone the repository
git clone https://github.com/hakuramasam/orebot-network-contracts.git
cd orebot-network-contracts

# Install smart contract dependencies
cd contracts
forge install OpenZeppelin/openzeppelin-contracts

# Install web and backend dependencies
cd web
npm install
```

### Running Tests
```bash
# Run Solidity Smart Contract tests
cd contracts
forge test -vvv

# Run Frontend Development Server
cd web
npm run dev
```

---

## 17. Security & Governance Guidelines

* **Private Key Safeguards**: No private key or operational mnemonic must ever be committed to the code or parsed inside off-chain agent containers. Hot wallets used by operating agents must be funded only with minimal operational gas.
* **Multi-Sig Administration**: Administrative control over `OREToken` minting, parameter updates inside the `CreditManager`, and fees inside the `OREBOTMarketplace` must be owned exclusively by a Gnosis Safe multi-signature wallet.
* **Audit Boundaries**: All updates to Layer 2 smart contracts must go through a formal professional audit (e.g., Quantstamp, Spearbit) before being merged into the master branch and deployed to Base Mainnet.
