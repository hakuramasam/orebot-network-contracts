# OREBOT Sprint 4 — Base Integration

## Deployed Backend Functions

### 1. getTreasuryDashboard
- **GET** → full treasury stats
- Shows: ORE/TREND/ETH/Credits balances for treasury + operator + CreditManager
- Token supply stats with treasury ownership percentage
- Credit system stats: minted, spent, outstanding, ORE deposited

### 2. getWalletPortfolio
- **GET** `?address=0x...` or **POST** `{ address }`
- Shows: ORE, TREND, ETH, Credits balance for any wallet
- OREBOT registration status
- Estimated credit value if ORE converted

### 3. getSwapRate
- **GET** `?amount=100&from=TREND&to=ORE`
- Shows conversion rates: TREND↔ORE, ORE↔Credits, TREND↔Credits
- Token supply stats
- Conversion flow: TREND → ORE → Credits → AI Services
- Note: TREND→ORE swap contract planned for Sprint 9 (DAO phase)

### 4. generateNFT
- **POST** `{ user, prompt, style? }`
- Generates NFT metadata via OpenRouter AI (name, description, attributes, image prompt, rarity)
- Uses free models (google/gemma-4-31b-it:free, nvidia/nemotron, openai/gpt-oss-20b:free)
- Auto-fallback across models
- Returns JSON metadata ready for minting

### 5. depositOreCredits
- **POST** `{ oreAmount }`
- Operator wallet approves + deposits ORE → mints OREBOT Credits
- 1 ORE = 10 Credits (configurable)
- Used for credit top-ups when balance runs low

## On-Chain State (2026-07-28)

| Metric | Value |
|--------|-------|
| ORE Total Supply | 250,000,012 |
| TREND Total Supply | 100,000,000,000 |
| Treasury ORE | 229,861,001 (91.9%) |
| Treasury TREND | 2,065,642,954 (2.1%) |
| Operator ORE | 9,999,010 |
| Operator Credits | 10,002 |
| CreditManager ORE | 10,001,000 |
| Credits Minted | 10,010 |
| Credits Spent | 8 |
| Credits Outstanding | 10,002 |

## Contracts
- ORE Token: 0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD
- TREND Token: 0xbf981cff5040f9652d4721c85c3e05f6d79f9b07
- CreditManager: 0x35cDfA7eC43Cb7BCa082354981F2D066109F0beE
- Registry: 0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2
- Marketplace: 0x83358421B952eCe0Fc84529E81A1bC98a1001B7d

## NFT Demo
- Generated "Neon Ore Sentinel" — Legendary rarity, 85 credits value
- 5 traits: Network(Base), Bot Model(ORE-Miner X7), Chassis(Cybersteel), Ore Crystal(Luminite Signal Core), Power Source(Plasma Fusion Core)
- Image generated via AI image generation
