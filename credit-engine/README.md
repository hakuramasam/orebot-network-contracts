# OREBOT Credit Engine — Sprint 2

## Deployed Backend Functions

### 1. getCreditBalance
- **GET** `?address=0x...` or **POST** `{ address }`
- Returns credit balance for any wallet address from CreditManager contract
- Contract: `0x35cDfA7eC43Cb7BCa082354981F2D066109F0beE`

### 2. getCreditStats
- **GET**
- Returns global credit system stats: total minted, spent, ORE deposited, credits per ORE
- Contract: `0x35cDfA7eC43Cb7BCa082354981F2D066109F0beE`

### 3. spendCredits
- **POST** `{ user, creditsAmount, service, provider }`
- Operator wallet (CREDIT_OPERATOR_ROLE) deducts credits for AI service consumption
- Pre-checks balance, sends on-chain tx, returns before/after balances + tx hash

### 4. refundCredits
- **POST** `{ user, creditsAmount, reason }`
- Operator wallet refunds credits (e.g. for failed AI calls)
- Sends on-chain tx, returns before/after balances + tx hash

## On-Chain Verification (2026-07-28)

| Function | TX Hash | Result |
|----------|---------|--------|
| depositOre | 0xd1580c07d21608926dd4c85bd34b6d4cbe0e5099149f5ffb7d0cb6b3113cdb03 | 1 ORE → 10 credits |
| spendCredits | 0x3968a602781ece8a1f542c794d567392b478eedf061ca0b94af4f6c506e529ee | 9 → 8 credits |
| refundCredits | 0x027ca8b59b96f9197fe2015a3b45a55dc0e497edabcbac00c194b7b45c995689 | 8 → 9 credits |

## Architecture
- Reads: raw `fetch()` with multi-RPC fallback (mainnet.base.org → base.publicnode.com → base.llamarpc.com)
- Writes: ethers v6 with explicit gasLimit + chainId, `getWorkingProvider()` tries each RPC
- Operator wallet: 0x9ad133aDDba94A95320126d8784d484943130115 (CREDIT_OPERATOR_ROLE)
- Treasury: 0x4e26fc6eb05a1cdbd762609fde9958e5b8cc754d (DEFAULT_ADMIN_ROLE)
