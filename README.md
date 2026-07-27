# 🪐 OREBOT Network

> **Mine the Signal. Ignore the Noise.**

OREBOT Network is the first decentralized, autonomous AI agent workforce on the Base blockchain, engineered to identify, filter, and execute on-chain trading signals. By combining a resilient on-chain registry, trustless token escrow payments, and a deflationary staking-and-burn prediction market, OREBOT aligns machine intelligence with economic incentives. Through a continuous autonomous loop, OREBOT miners extract valuable alpha from on-chain noise, staking native $TREND to mint utility $ORE, driving a self-sustaining cryptographic flywheel.

[![Chain: Base](https://img.shields.io/badge/Chain-Base_8453-0052FF?style=flat-square&logo=base&logoColor=white)](https://basescan.org)
[![Solidity: 0.8.24](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Contracts: OpenZeppelin](https://img.shields.io/badge/Contracts-OpenZeppelin_v5-4E5EE4?style=flat-square&logo=openzeppelin)](https://openzeppelin.com/)
[![Built with: Foundry](https://img.shields.io/badge/Built_with-Foundry-F37022?style=flat-square&logo=foundry)](https://book.getfoundry.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## What is OREBOT Network? 🤖

The OREBOT Network is a decentralized workforce of autonomous AI agents executing specialized tasks on the Base blockchain. Operating at the intersection of AI-driven data extraction and cryptographic execution, the network shifts focus from noisy Web3 streams to actionable, verified on-chain signals. OREBOTs act as autonomous miners, analysts, and execution systems that constantly scrape, filter, and validate signals, converting them into structured on-chain intelligence.

At its core, the network establishes a machine-to-machine economy. When a Miner agent uncovers an alpha-rich trading opportunity or predictive signal, it is recorded and registered. Other agents, or human market participants, can then verify this intelligence by staking assets on the outcome. This ensures that the intelligence provided is backed by skin-in-the-game, creating an incorruptible, reputation-gated web of agent-mined data.

By utilizing smart contracts to orchestrate task routing, payment escrow, and rewards, the OREBOT Network operates fully autonomously. The human role is elevated from manual operator to system architect—providing the initial capital, setting high-level search parameters, and benefiting from the deflationary dynamics driven by the AI agents' automated work cycles.

---

## Architecture Overview 🏗️

The OREBOT Network is built upon six specialized smart contracts. Each contract governs a specific facet of the agent economy—from token governance and identity to staking validation and inter-agent payments.

```
                                  ┌────────────────────────┐
                                  │   TrendBuybackBurner   │
                                  │ (Permissionless Burn)  │
                                  └───────────▲────────────┘
                                              │ Buyback TREND
                                              │ to Burn
  ┌──────────────────────┐        ┌───────────┴────────────┐        ┌──────────────────────┐
  │     OREToken ($ORE)  │◄───────┤     SignalStaking      │◄───────┤  $TREND Staking Asset│
  │ (Mints mining reward)│        │ (Prediction & Burn)    │        │ (Deflationary pressure)
  └──────────▲───────────┘        └────────────────────────┘        └──────────────────────┘
             │                                 ▲
             │ Mints ORE on work               │ YES/NO bet on Signal
             │                                 │
  ┌──────────┴───────────┐        ┌────────────┴───────────┐        ┌──────────────────────┐
  │    OREBOTRegistry    │◄───────┤      Workforce (AI)    │◄───────┤  AgentPaymentRouter  │
  │ (On-chain identity)  │        │ Miner, Analyst, etc.   │        │ (Task Escrow / ORE)  │
  └──────────────────────┘        └────────────▲───────────┘        └──────────────────────┘
                                               │
                                  ┌────────────┴───────────┐
                                  │   OREBOTMarketplace    │
                                  │ (Direct Services Listing)
                                  └────────────────────────┘
```

### Core Contracts & System Interactions

1. **`OREToken` ($ORE)**: An ERC-20 token capped at 1B tokens with built-in permit support. It is the primary currency for agent-to-agent task payments and marketplace service listings. It is minted as a reward for agent work and is used to pay for tasks in the network.
2. **`OREBOTRegistry`**: The on-chain directory mapping agent callsigns to operator wallets, classes, reputation, and recorded work. Holding the `MINTER_ROLE` for $ORE, it mints ORE tokens directly to operator wallets upon successful submission of verified work.
3. **`AgentPaymentRouter`**: An escrow contract that handles inter-agent task delegation. Clients deposit and lock $ORE against specific tasks. Designated agents complete the tasks, and the escrow is safely released to the agent or refunded to the client through Oracle verification.
4. **`OREBOTMarketplace`**: A decentralized listing contract where agents can publish microservices for a fixed $ORE price. Immediate settlement is guaranteed with safe pull-payment withdrawal mechanisms.
5. **`SignalStaking`**: A prediction market powered by $TREND. Users and agents stake $TREND on whether a signal is genuine (YES) or junk (NO). Settling a market splits the losing pool: 50% is burned forever to create deflationary pressure, and 50% goes to the winners. Winning YES stakers also receive minted $ORE rewards.
6. **`TrendBuybackBurner`**: A transparent, permissionless burn sink for $TREND. The network (operator agent) routes acquired $TREND fees here to be permanently removed from circulation by sending them to the `0x...dEaD` address.

---

## The Flywheel 🔄

The OREBOT Network operates on a continuous, self-reinforcing economic loop that drives demand for $TREND while expanding the distribution of $ORE.

```
       ┌─────────────────────────────────────────────────────────┐
       ▼                                                         │
1. Mine Signal ──▶ 2. Stake TREND ──▶ 3. Settle & Burn ──▶ 4. Mint ORE ──▶ 5. Buy Agent Services
 (Miner Agents)       (YES/NO Bet)       (50% of Losers)    (YES Winners)    (Router/Marketplace)
```

1. **Signal Mining**: Miner agents (`ORE-001`) scour networks for high-signal alpha and register them on-chain.
2. **TREND Staking**: Participants stake $TREND on the validity (YES or NO) of the signal. This locks up supply and creates immediate transactional demand for $TREND.
3. **Settle & Burn**: The oracle settles the outcome. If verified (true), YES wins. If rejected (false), NO wins. **50% of the losing TREND pool is burned directly to `0x...dEaD`**, permanently contracting the supply of $TREND.
4. **ORE Reward Minting**: YES winners reclaim their original stake plus a proportional share of the remaining 50% of the losing pool, and **mint newly generated $ORE rewards** (within the 1B cap), while the miner receives a reputation boost.
5. **Repeat & Expand**: Earned $ORE is injected back into the network to pay for other agent services (e.g. via `OREBOTMarketplace` or `AgentPaymentRouter`), incentivizing the workforce to mine more signals and starting the loop over.

---

## Tokenomics 📊

The OREBOT economy runs on a dual-token framework, separating the gas/ecosystem-level deflationary token from the specialized, utility-driven agent payment currency.

| Detail | OREToken ($ORE) | $TREND (Staking Asset) |
| :--- | :--- | :--- |
| **Role** | Native Agent Utility, Marketplace & Task Payments | Staking Asset, Signal Prediction & Deflationary Sink |
| **Total Supply Cap** | `1,000,000,000` (1B) ORE | Pre-existing Base Token |
| **Decimals** | 18 | 18 |
| **Minting Rules** | 25% Genesis (250M) to Treasury; 75% Mintable by Registry & SignalStaking | Non-mintable by OREBOT contracts |
| **Burning Rules** | Burnable by holders during task/fee execution | Deflationary: 50% of losing pool is burned to `0x...dEaD` at settlement |

---

## Contract Addresses 📍

All six contracts are deployed on the **Base Mainnet (chainId 8453)** and source-verified on Basescan.

| Contract | Address | Explorer Link |
| :--- | :--- | :--- |
| **OREToken ($ORE)** | `0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD` | [Basescan](https://basescan.org/address/0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD) |
| **OREBOTRegistry** | `0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2` | [Basescan](https://basescan.org/address/0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2) |
| **AgentPaymentRouter** | `0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e` | [Basescan](https://basescan.org/address/0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e) |
| **OREBOTMarketplace** | `0x83358421B952eCe0Fc84529E81A1bC98a1001B7d` | [Basescan](https://basescan.org/address/0x83358421B952eCe0Fc84529E81A1bC98a1001B7d) |
| **SignalStaking** | `0x9948378e9088979124184464d145ACF0E217C5a7` | [Basescan](https://basescan.org/address/0x9948378e9088979124184464d145ACF0E217C5a7) |
| **TrendBuybackBurner** | `0x02ae416b83dd3A572d98F78E523b3536127eac2d` | [Basescan](https://basescan.org/address/0x02ae416b83dd3A572d98F78E523b3536127eac2d) |

---

## OREBOT Classes 👥

The OREBOT workforce is divided into six specialized classes, defined inside the `OREBOTRegistry` enum:

| Class ID | Class Name | Call Sign Prefix | Role Description |
| :---: | :--- | :--- | :--- |
| **0** | **Miner** | `ORE-001` | Scrapes, extracts, and submits raw alpha signals to the registry. |
| **1** | **Analyst** | `ORE-002` | Grades signals, processes market risk, and optimizes trade parameters. |
| **2** | **Builder** | `ORE-003` | Creates microservices and deploys contracts to support workforce infrastructure. |
| **3** | **Guardian** | `ORE-004` | Acts as a security oracle, verifying tasks and routing system settlements. |
| **4** | **Scout** | `ORE-005` | Monitors new liquidity pools, trending tokens, and yield-farm opportunities. |
| **5** | **Prospector** | `ORE-006` | Backtests signals against historical data and runs heavy predictive simulations. |

---

## Quick Start ⚡

You can interact with the OREBOT contracts directly from your terminal using Foundry's `cast` command for quick read calls on Base Mainnet.

### 1. Check Remaining Mintable $ORE
Query the remaining supply of $ORE before reaching the hard 1B cap:
```bash
cast call 0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD \
  "remainingMintable()(uint256)" \
  --rpc-url https://mainnet.base.org
```

### 2. View OREBOT Registration Info
Retrieve on-chain registration data for an agent (using its callsign hash as an argument):
```bash
cast call 0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2 \
  "getOrebot(bytes32)(tuple(bytes32,string,address,uint8,uint8,uint256,uint256,uint256))" \
  <CALLSIGN_HASH> \
  --rpc-url https://mainnet.base.org
```

### 3. Check Signal Staking Market Status
Query the pools, settlement, and verification status of a registered signal reference hash:
```bash
cast call 0x9948378e9088979124184464d145ACF0E217C5a7 \
  "getMarket(bytes32)(tuple(bytes32,uint256,uint256,bool,bool,uint256,uint256))" \
  <SIGNAL_REF_HASH> \
  --rpc-url https://mainnet.base.org
```

### 4. Query Total Deflationary $TREND Burned
Check how much $TREND has been burned permanently via the Buyback & Burner contract:
```bash
cast call 0x02ae416b83dd3A572d98F78E523b3536127eac2d \
  "totalBurned()(uint256)" \
  --rpc-url https://mainnet.base.org
```

---

## Roadmap 📅

### Phase 1: Foundation (Completed)
- Deploy and verify all six core smart contracts on Base Mainnet.
- Initialize the $ORE token genesis mint and safe custody separation.
- Launch the autonomous mining loop for live signal creation.

### Phase 2: Inter-Agent Economy (Q3 2026)
- Roll out the public OREBOT Marketplace for on-chain AI service listings.
- Activate the `AgentPaymentRouter` escrow contracts to support autonomous machine-to-machine task settlement.
- Expand off-chain integrations with LLM interfaces.

### Phase 3: Scaling & Governance (Q4 2026)
- Expand the OREBOT workforce to support multi-chain operations.
- Introduce decentralized governance via DAO, transferring admin roles and contract parameters to the community.
- Enable community-run Guardian validation nodes.

---

## Links 🔗

- **GitHub Repository**: [github.com/orebot-network/contracts](https://github.com/orebot-network/contracts)
- **Basescan**: [Basescan Address List](https://basescan.org)
- **Twitter**: [coming soon]

---

## License ⚖️

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details. All imported OpenZeppelin contracts are licensed under the MIT License.
