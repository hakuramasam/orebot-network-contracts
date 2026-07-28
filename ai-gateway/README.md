# OREBOT AI Gateway — Sprint 3

The OREBOT AI Gateway routes prompts to AI providers via OpenRouter and bills OREBOT Credits on-chain per call.

## Architecture

```
User → aiGateway function
         ↓
    1. Check credit balance (CreditManager on Base)
    2. If sufficient → Call OpenRouter API
    3. If AI succeeds → spendCredits on-chain (operator wallet)
    4. Return response + billing receipt
    5. If AI fails → No charge, return error
```

## Backend Function: `aiGateway`

### POST Request
```json
{
  "user": "0x9ad133aDDba94A95320126d8784d484943130115",
  "prompt": "Write a Solidity ERC20 token",
  "service": "coding",
  "model": "anthropic/claude-3.5-sonnet",
  "system": "Optional custom system prompt",
  "maxTokens": 4096,
  "temperature": 0.2
}
```

### Response (success)
```json
{
  "ok": true,
  "response": "AI-generated content...",
  "model": "openai/gpt-oss-20b:free",
  "service": "chat",
  "fallback": false,
  "usage": { "promptTokens": 101, "completionTokens": 134, "totalTokens": 235 },
  "billing": {
    "status": "success",
    "creditsSpent": "2",
    "txHash": "0xf5cbd002...",
    "blockNumber": 49211280,
    "gasUsed": "39135",
    "basescan": "https://basescan.org/tx/0xf5cbd002..."
  },
  "userBalanceBefore": "9",
  "userBalanceAfter": "7"
}
```

## Services & Credit Costs

| Service | Credits | Default Model (Free) |
|---------|---------|---------------------|
| chat | 2 | openai/gpt-oss-20b:free |
| reasoning | 5 | nvidia/nemotron-3-ultra-550b-a55b:free |
| deep-thinking | 10 | nvidia/nemotron-3-ultra-550b-a55b:free |
| research | 20 | nvidia/nemotron-3-super-120b-a12b:free |
| coding | 10 | cohere/north-mini-code:free |
| website | 50 | cohere/north-mini-code:free |
| smart-contract | 30 | cohere/north-mini-code:free |
| nft | 20 | google/gemma-4-31b-it:free |
| trading | 15 | nvidia/nemotron-3-super-120b-a12b:free |
| deployment | 10 | openai/gpt-oss-20b:free |

## Features
- **Auto-fallback**: If primary model returns 402 (no credits) or 404 (unavailable), automatically retries with `openai/gpt-oss-20b:free`
- **Post-billing**: Credits only deducted after AI call succeeds (no charge for failed calls)
- **On-chain receipt**: Every successful billing returns a Basescan transaction link
- **Custom models**: User can override default model per request via `model` parameter
- **Custom system prompts**: Override default via `system` parameter

## On-Chain Verification (2026-07-28)

| Test | Service | Credits | TX Hash | Balance |
|------|---------|---------|---------|---------|
| Chat test | chat | 2 | 0xf5cbd002... | 9→7 |
| Reasoning test | reasoning | 5 | (on-chain) | 7→2 |

## Contract
CreditManager: `0x35cDfA7eC43Cb7BCa082354981F2D066109F0beE` (Base Mainnet, chainId 8453)

## OpenRouter
- 15 free models available (0 credits required)
- 341 total models (paid credits needed for Claude, GPT-4o, etc.)
- API: https://openrouter.ai/api/v1/chat/completions
