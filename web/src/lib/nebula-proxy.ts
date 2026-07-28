// Server-only helpers for Nebula sandbox proxy endpoints.
//
// Use these from Next.js Route Handlers (`src/app/api/<name>/route.ts`) and
// Server Actions. They read `SANDBOX_AUTH_TOKEN` / `NEBULA_PROXY_URL` from
// `process.env`, so importing them into a Client Component will throw at
// runtime. Browsers must call your own `/api/...` route, which then calls
// these helpers.
//
// Why this exists: miniapps run in an untrusted sandbox and must NEVER ship
// third-party API keys or tokens. The Nebula backend injects the right
// credentials server-side. Use these helpers any time the miniapp needs
// dynamic data from a user-connected service (GitHub repos, Gmail threads,
// Linear issues, etc.) - hard-coding that data is what you would do without
// the proxy. With the proxy, fetch it at request time. For named Nebula tools
// such as GMAIL_FETCH_EMAILS, use callTool from a server route; do not have the
// agent call the tool in chat and paste/cache the result into source files. If
// the tool lives on a helper agent, pass that helper id as callTool({ agentId }).
// That helper id is not permission to use a chat-side agent turn or the message proxy to
// fetch data into files; the miniapp route itself must keep calling callTool.
// If a proxy request fails, return a visible error and fix the route/env/account
// wiring; do not add a cache fallback for live user data.

export type ConnectedAccount = { account_id: string; display_name: string };

export type ConnectedApp = {
  base_url?: string;
  headers?: Record<string, string>;
  accounts: ConnectedAccount[];
};

export type ConnectedApps = Record<string, ConnectedApp>;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ConnectedAppCallArgs = {
  app: string;
  method?: HttpMethod;
  url: string;
  accountId: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
};

export type ProxyResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AgentMessageArgs = {
  content: string;
  threadId?: string;
};

export type AgentMessageResponse = {
  thread_id: string;
  message_id: string;
  status: "queued" | "cleared";
};

export type NebulaApiArgs = {
  // Path under /internal/proxy/nebula, e.g. "me", "workspace", "agents", or `agents/${id}`.
  path: string;
  method?: HttpMethod;
  body?: unknown;
  // Query params; null/undefined values are dropped.
  params?: Record<string, unknown>;
};

export type ToolCallArgs = {
  toolName: string;
  arguments?: Record<string, unknown>;
  // Defaults to AGENT_ID when omitted.
  agentId?: string;
  // Omit to create a new miniapp-sourced thread for this call.
  threadId?: string;
};

export type ToolCallResponse<T = unknown> = {
  success: boolean;
  tool_name: string;
  thread_id: string;
  message_id: string;
  // Full tool result envelope. Connected-app actions wrap their payload as
  // { success, message, exports, ... }; built-in tools return their own shape.
  result?: unknown;
  // The tool's data payload: `result.exports` when the envelope wraps one,
  // otherwise `result` itself. Read your data from here.
  data?: T;
  error?: string;
};

export type ToolDefinition = {
  name: string;
  description: string;
  parameters_json_schema: Record<string, unknown>;
};

export type ToolListResponse = {
  agent_id: string;
  thread_id: string;
  tools: ToolDefinition[];
};

function assertServer(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "nebula-proxy helpers are server-only. Call them from a Next.js Route Handler or Server Action, never from a Client Component.",
    );
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var ${name}. The Nebula runtime sets it on every miniapp; do not run this outside the sandbox.`);
  }
  return value;
}

/** Parse $CONNECTED_APPS into a typed map. */
export function listConnectedApps(): ConnectedApps {
  assertServer();
  const raw = process.env.CONNECTED_APPS;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ConnectedApps;
  } catch {
    return {};
  }
}

/**
 * Pick a connected account for `app`. Defaults to the first account when
 * `preferredAccountId` is omitted; returns `null` when the app is not
 * connected. Use the return value's `account_id` as the `accountId` arg to
 * `callAppProxy`.
 */
export function pickConnectedAccount(app: string, preferredAccountId?: string): ConnectedAccount | null {
  const apps = listConnectedApps();
  const entry = apps[app];
  if (!entry || entry.accounts.length === 0) return null;
  if (preferredAccountId) {
    const match = entry.accounts.find((a) => a.account_id === preferredAccountId);
    if (match) return match;
  }
  return entry.accounts[0];
}

function queryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const query = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      value == null ? [] : ([[key, String(value)]] as [string, string][]),
    ),
  ).toString();
  return query ? `?${query}` : "";
}

/**
 * Call a raw user-connected app/custom-API HTTP endpoint via
 * `POST /internal/proxy/app`. Tokens and API keys never leave the backend.
 * Prefer callTool for named Nebula tool actions such as GMAIL_FETCH_EMAILS.
 * Gmail inbox/email dashboards must use callTool("GMAIL_FETCH_EMAILS"), not
 * callAppProxy or raw Gmail REST URLs.
 */
export async function callAppProxy<T = unknown>(args: ConnectedAppCallArgs): Promise<ProxyResponse<T>> {
  assertServer();
  const proxyUrl = requireEnv("NEBULA_PROXY_URL");
  const token = requireEnv("SANDBOX_AUTH_TOKEN");
  const resp = await fetch(`${proxyUrl}/internal/proxy/app`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app: args.app,
      method: args.method ?? "GET",
      url: args.url,
      account_id: args.accountId,
      body: args.body,
      headers: args.headers,
      params: args.params,
    }),
  });
  return (await resp.json()) as ProxyResponse<T>;
}

/**
 * Base URL + bearer token for the Nebula LLM proxy. Use as the
 * `baseURL` / `apiKey` of the OpenAI or Anthropic SDK client; the user's
 * selected model is used regardless of the `model` field you pass.
 *
 * ```ts
 * const client = new OpenAI({
 *   baseURL: `${llmProxyBaseUrl()}/v1`,
 *   apiKey: llmProxyAuthToken(),
 * });
 * ```
 */
export function llmProxyBaseUrl(): string {
  assertServer();
  return `${requireEnv("NEBULA_PROXY_URL")}/internal/proxy/llm`;
}

export function llmProxyAuthToken(): string {
  assertServer();
  return requireEnv("SANDBOX_AUTH_TOKEN");
}

/**
 * Send a message back to the calling agent via
 * `POST /internal/proxy/messages`. Use for "run this report" / "ping me when
 * X" buttons. Omit `threadId` to start a fresh thread bound to the agent.
 *
 * Do NOT create a webhook trigger for in-miniapp callbacks; that is for
 * external services calling Nebula.
 */
export async function postAgentMessage(args: AgentMessageArgs): Promise<AgentMessageResponse> {
  assertServer();
  const proxyUrl = requireEnv("NEBULA_PROXY_URL");
  const token = requireEnv("SANDBOX_AUTH_TOKEN");
  const agentId = requireEnv("AGENT_ID");
  const resp = await fetch(`${proxyUrl}/internal/proxy/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: agentId,
      content: args.content,
      ...(args.threadId ? { thread_id: args.threadId } : {}),
    }),
  });
  if (!resp.ok) {
    throw new Error(`Nebula message proxy failed (${resp.status}): ${await resp.text()}`);
  }
  return (await resp.json()) as AgentMessageResponse;
}

/**
 * Read first-party Nebula resources scoped to the sandbox token's user and
 * workspace. Supported paths include `me`, `workspace`, `agents`, and
 * `agents/<id-or-slug>`. This is read-only; use `postAgentMessage` or
 * `callTool` for actions.
 */
export async function callNebulaApi<T = unknown>(args: NebulaApiArgs): Promise<T> {
  assertServer();
  const proxyUrl = requireEnv("NEBULA_PROXY_URL");
  const token = requireEnv("SANDBOX_AUTH_TOKEN");
  let path = args.path;
  while (path.startsWith("/")) {
    path = path.slice(1);
  }
  const resp = await fetch(`${proxyUrl}/internal/proxy/nebula/${path}${queryString(args.params)}`, {
    method: args.method ?? "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(args.body !== undefined ? { body: JSON.stringify(args.body) } : {}),
  });
  if (!resp.ok) {
    throw new Error(`Nebula API ${path} failed (${resp.status}): ${await resp.text()}`);
  }
  return (await resp.json()) as T;
}

/**
 * Execute one tool through the agent's scoped Nebula tool surface. This covers
 * built-in tools plus dynamically loaded connected-app/custom-toolkit tools.
 * Use this for named actions such as GMAIL_FETCH_EMAILS from a Next.js API
 * route, so the miniapp fetches live data at request time instead of receiving
 * a stale cache produced by an agent-side tool call. Read the payload from
 * `data` (e.g. `data.messages` for GMAIL_FETCH_EMAILS) - it unwraps the
 * connected-app result envelope for you. Do not mask proxy failures by importing cache JSON;
 * a live-data miniapp should fail visibly until the proxy route is fixed. If a
 * Gmail-capable helper agent owns the tool, pass its id as args.agentId. If a
 * Gmail inbox/email dashboard's callTool route returns 2xx JSON, keep that
 * route and finish; do not replace it with diagnostics, chat-side agent output,
 * direct NEBULA_PROXY_URL probes, or raw Gmail HTTP, and do not inspect
 * env vars, supervisor state, or logs after that success.
 */
export async function callTool<T = unknown>(args: ToolCallArgs): Promise<ToolCallResponse<T>> {
  assertServer();
  const proxyUrl = requireEnv("NEBULA_PROXY_URL");
  const token = requireEnv("SANDBOX_AUTH_TOKEN");
  const resp = await fetch(`${proxyUrl}/internal/proxy/tools`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: args.agentId ?? requireEnv("AGENT_ID"),
      tool_name: args.toolName,
      arguments: args.arguments ?? {},
      ...(args.threadId ? { thread_id: args.threadId } : {}),
    }),
  });
  if (!resp.ok) {
    throw new Error(`Nebula tool proxy failed (${resp.status}): ${await resp.text()}`);
  }
  const payload = (await resp.json()) as ToolCallResponse<T>;
  // Connected-app actions wrap their payload in a { success, message, exports }
  // envelope; built-in tools return their result directly.
  const result = payload.result;
  payload.data = (
    result && typeof result === "object" && "exports" in result
      ? (result as { exports: unknown }).exports
      : result
  ) as T;
  return payload;
}

/**
 * List tool schemas visible to an agent in an existing single-agent thread.
 * This is read-only and does not create a thread.
 */
export async function listTools(args: { agentId?: string; threadId: string }): Promise<ToolListResponse> {
  assertServer();
  const proxyUrl = requireEnv("NEBULA_PROXY_URL");
  const token = requireEnv("SANDBOX_AUTH_TOKEN");
  const resp = await fetch(
    `${proxyUrl}/internal/proxy/tools${queryString({
      agent_id: args.agentId ?? requireEnv("AGENT_ID"),
      thread_id: args.threadId,
    })}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    },
  );
  if (!resp.ok) {
    throw new Error(`Nebula tool list failed (${resp.status}): ${await resp.text()}`);
  }
  return (await resp.json()) as ToolListResponse;
}
