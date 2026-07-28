# OREBOT Sprint 5 — Marketplace + Skills

## Backend Functions Deployed

### 1. listSkills (GET)
- Lists all published skills from SkillRegistry contract
- Returns: id, author, name, description, category, version, ipfsHash, price (ORE), active, totalPurchases, rating
- GET ?skillId=N → single skill detail + rating

### 2. publishSkill (POST)
- Operator wallet publishes a skill to SkillRegistry on-chain
- POST { name, description, category, version, ipfsHash, priceOre }
- Revenue split: 90% author, 10% treasury (on purchase)
- priceOre=0 for free skills

### 3. skillMarketOps (POST)
- Multi-action handler for skill + marketplace operations:
  - rate: Rate a skill 1-5 stars on-chain
  - listMarket: List a service on OREBOTMarketplace
  - buyMarket: Buy a marketplace service (ORE payment)
  - withdrawMarket: Withdraw pending marketplace proceeds
  - deactivateSkill: Deactivate a published skill
  - delistMarket: Delist a marketplace service

## On-Chain State (2026-07-28)

### Skills Published (5 total, all active)
| ID | Name | Category | Price (ORE) | Rating |
|----|------|----------|-------------|--------|
| 1 | ERC20 Token Builder | coding | 10.0 | ★5.0 |
| 2 | Signal Scanner | trading | 5.0 | ★4.0 |
| 3 | Smart Contract Auditor | coding | 20.0 | unrated |
| 4 | NFT Concept Generator | nft | FREE | ★5.0 |
| 5 | Portfolio Analyzer | trading | 5.0 | unrated |

### Marketplace Services (2 listed)
| ID | Title | Price (ORE) |
|----|-------|-------------|
| 1 | AI Coding Service - Smart Contract Generation | 15.0 |
| 2 | Trading Signal Analysis - 24h Report | 8.0 |

## Contracts
- SkillRegistry: 0x807C2CaB504695037Bef875232b769130009877A
- OREBOTMarketplace: 0x83358421B952eCe0Fc84529E81A1bC98a1001B7d
- ORE Token: 0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD
