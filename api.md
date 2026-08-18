# OREBOT Agent Gateway TypeScript API

Complete reference of every operation, grouped by resource. See [the README](./README.md) for usage and configuration.

## Contents

- [`Health`](#health)
  - [Gateway health](#gateway-health)
- [`Services`](#services)
  - [List available agent services](#list-available-agent-services)
- [`Balance`](#balance)
  - [Get OREBOT Credit balance](#get-orebot-credit-balance)
- [`Chat`](#chat)
  - [Execute basic AI chat](#execute-basic-ai-chat)
- [`Reason`](#reason)
  - [Execute reasoning service](#execute-reasoning-service)
- [`Research`](#research)
  - [Execute research service](#execute-research-service)
- [`Code`](#code)
  - [Execute coding service](#execute-coding-service)
- [`Credits`](#credits)
  - [`Credits Topup`](#credits-topup)
    - [Preview x402 credit tiers](#preview-x402-credit-tiers)
    - [Buy 50 Credits for $5 via x402](#buy-50-credits-for-5-via-x402)
    - [Buy 200 Credits for $20 via x402](#buy-200-credits-for-20-via-x402)
    - [Buy 1000 Credits for $100 via x402](#buy-1000-credits-for-100-via-x402)

## Setup

```ts
import OrebotAgentGateway from '@orebot-protocol/orebot-agent-gateway';

const client = new OrebotAgentGateway({
  apiKeyAuth: process.env['API_KEY_AUTH'], // defaults to the API_KEY_AUTH env var
});
```

## `Health`

### Gateway health

```ts
await client.health.list();
```

## `Services`

### List available agent services

```ts
await client.services.list();
```

## `Balance`

### Get OREBOT Credit balance

```ts
await client.balance.listAgent();
```

## `Chat`

### Execute basic AI chat

| Direction | Type |
| --- | --- |
| Request | [`ChatAgentParams`](./src/resources/chat.ts) |

```ts
await client.chat.agent({
  prompt: 'x',
});
```

## `Reason`

### Execute reasoning service

| Direction | Type |
| --- | --- |
| Request | [`ReasonAgentParams`](./src/resources/reason.ts) |

```ts
await client.reason.agent({
  prompt: 'x',
});
```

## `Research`

### Execute research service

| Direction | Type |
| --- | --- |
| Request | [`ResearchAgentParams`](./src/resources/research.ts) |

```ts
await client.research.agent({
  prompt: 'x',
});
```

## `Code`

### Execute coding service

| Direction | Type |
| --- | --- |
| Request | [`CodeAgentCodingParams`](./src/resources/code.ts) |

```ts
await client.code.agentCoding({
  prompt: 'x',
});
```

## `Credits`

### `Credits Topup`

#### Preview x402 credit tiers

```ts
await client.credits.topup.preview();
```

#### Buy 50 Credits for $5 via x402

| Direction | Type |
| --- | --- |
| Request | [`TopupFiveParams`](./src/resources/credits/topup.ts) |

```ts
await client.credits.topup.five({
  'Idempotency-Key': 'idempotencyKey',
});
```

#### Buy 200 Credits for $20 via x402

| Direction | Type |
| --- | --- |
| Request | [`TopupTwentyParams`](./src/resources/credits/topup.ts) |

```ts
await client.credits.topup.twenty({
  'Idempotency-Key': 'idempotencyKey',
});
```

#### Buy 1000 Credits for $100 via x402

| Direction | Type |
| --- | --- |
| Request | [`TopupOneHundredParams`](./src/resources/credits/topup.ts) |

```ts
await client.credits.topup.oneHundred({
  'Idempotency-Key': 'idempotencyKey',
});
```
