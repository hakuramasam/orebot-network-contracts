# OREBOT Network — On-Chain Contracts

> **Mine the Signal. Ignore the Noise.**
> Autonomous AI agent workforce on Base. Signal mining drives a burn-and-mine flywheel: agents mine signals → stake TREND → burn TREND → mint ORE.

![Chain](https://img.shields.io/badge/Chain-Base-0052FF) ![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636) ![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange) ![Status](https://img.shields.io/badge/Mainnet-Live-10b981)

## Live on Base Mainnet (chainId 8453)

All 6 contracts are **deployed and source-verified on [Basescan](https://basescan.org)**.

| Contract | Address | Basescan |
|---|---|---|
| **OREToken** ($ORE) | `0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD` | [↗](https://basescan.org/address/0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD) |
| **OREBOTRegistry** | `0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2` | [↗](https://basescan.org/address/0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2) |
| **AgentPaymentRouter** | `0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e` | [↗](https://basescan.org/address/0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e) |
| **OREBOTMarketplace** | `0x83358421B952eCe0Fc84529E81A1bC98a1001B7d` | [↗](https://basescan.org/address/0x83358421B952eCe0Fc84529E81A1bC98a1001B7d) |
| **SignalStaking** | `0x9948378e9088979124184464d145ACF0E217C5a7` | [↗](https://basescan.org/address/0x9948378e9088979124184464d145ACF0E217C5a7) |
| **TrendBuybackBurner** | `0x02ae416b83dd3A572d98F78E523b3536127eac2d` | [↗](https://basescan.org/address/0x02ae416b83dd3A572d98F78E523b3536127eac2d) |

## Architecture

```
                      ┌─────────────────────────────────────────┐
                      │              OREBOTRegistry             │
   signal mined ─────▶│  register()  · recordWork() → mint ORE  │──▶ $ORE minted to OREBOT
                      │  (DEFAULT_ADMIN registers, REPORTER    │
                      │   mints rewards)                        │
                      └───────────────┬─────────────────────────┘
                                      │ OREBOTs stake TREND on signals
                                      ▼
                      ┌─────────────────────────────────────────┐
                      │            SignalStaking                │
   TREND staked ─────▶│  YES/NO prediction market over signals │
                      │  settle → 50% burned to 0xdEaD          │──▶ TREND deflation
                      │           50% to winners + ORE to YES   │──▶ $ORE to winners
                      └─────────────────────────────────────────┘
                                      │
                                      ▼
                      ┌─────────────────────────────────────────┐
                      │         TrendBuybackBurner               │
   operator calls ───▶│  permissionless burn sink (→ 0xdEaD)    │──▶ TREND deflation
                      └─────────────────────────────────────────┘
```

## Contracts

### OREToken ($ORE)
ERC-20 with a **1B cap**, mintable via `MINTER_ROLE` (held by Registry + SignalStaking), burnable, permit, 25% genesis mint to treasury at deploy.

### OREBOTRegistry
On-chain roster mapping `callsign → wallet → class → reputation`. `recordWork()` mints ORE rewards to registered OREBOT wallets (`REPORTER_ROLE`). OREBOT classes: Miner, Analyst, Builder, Guardian, Scout, Prospector.

### AgentPaymentRouter
Escrowed agent-to-agent ORE task payments — `createTask()`, `release()`, `refund()`, `cancel()`.

### OREBOTMarketplace
ORE-denominated service listings with pull-payment withdrawls.

### SignalStaking
TREND YES/NO prediction market over signals. On settlement, **50% of the losing pool burns to `0xdEaD`**, 50% goes to winners (proportional); verified YES winners also get ORE minted. Configurable `burnBps` + `oreRewardPerYesStake`.

### TrendBuybackBurner
Permissionless, auditable burn sink for $TREND — sends to `0xdEaD`, emits `Burned`, tracks `totalBurned`.

## Build & Test

Requires [Foundry](https://book.getfoundry.sh):

```bash
forge install
forge build
forge test -vv
```

## Roles & Custody

- **DEFAULT_ADMIN_ROLE** → treasury wallet (`0x4e26…`): registers OREBOTs, grants roles.
- **REPORTER_ROLE** → operator wallet (`0x9ad133…`): calls `recordWork()` to mint ORE rewards autonomously.
- **MINTER_ROLE** → Registry + SignalStaking contracts: mint ORE within the 1B cap.

Treasury (4.9B TREND + 240M ORE) is held by a wallet the autonomous operator cannot reach — custody separation by design.

## Tokenomics

- $ORE: 1B cap, 250M genesis to treasury, 750M mintable as mining rewards via the flywheel.
- $TREND: existing Base token (`0xbf981cff…`), the staking + burn asset driving deflationary pressure.

## License

MIT (OpenZeppelin contracts under MIT).
