---
name: orebot-agent-gateway-typescript-sdk
description: "TypeScript SDK for OREBOT Agent Gateway API. Use when writing TypeScript code that calls OREBOT Agent Gateway API with the @orebot-protocol/orebot-agent-gateway package: installing it, constructing and authenticating the client, and calling API operations."
---

# OREBOT Agent Gateway TypeScript SDK

Generated TypeScript client for OREBOT Agent Gateway API, published as `@orebot-protocol/orebot-agent-gateway`. Use the generated client instead of hand-writing HTTP requests.

## Install

```sh
npm install @orebot-protocol/orebot-agent-gateway
```

## Client setup and authentication

```ts
import OrebotAgentGateway from '@orebot-protocol/orebot-agent-gateway';

const client = new OrebotAgentGateway({
  apiKeyAuth: process.env['API_KEY_AUTH'], // defaults to the API_KEY_AUTH env var
});
```

Provide credentials using the options below. Environment variables are read automatically when the target runtime supports them:

- `apiKeyAuth` (env: `API_KEY_AUTH`) — Credential for the ApiKeyAuth scheme.

## Calling operations

```ts
import OrebotAgentGateway from '@orebot-protocol/orebot-agent-gateway';

const client = new OrebotAgentGateway({
  apiKeyAuth: process.env['API_KEY_AUTH'], // defaults to the API_KEY_AUTH env var
});

await client.health.list();
```

Method names, parameter shapes, and response types are generated from the API description — do not guess them. Look up the exact call signature in [api.md](./api.md) before writing a call.

## Error handling

Non-success responses throw generated API errors. Error objects expose status, headers, response body, and request metadata where the target runtime supports it.

```ts
import { APIError } from '@orebot-protocol/orebot-agent-gateway';

try {
  await client.health.list();
} catch (err) {
  if (err instanceof APIError) {
    console.log(err.status, err.name, err.headers);
  }
  throw err;
}
```

## Requirements

- Node.js 20+, a modern browser, or any runtime with `fetch` support

## Reference files

- [README.md](./README.md) — full feature tour: client options, request options, retries and timeouts, logging.
- [api.md](./api.md) — complete catalogue of every operation with request and response types.
