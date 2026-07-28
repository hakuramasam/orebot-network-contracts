/**
 * Agent service definitions - each service maps to a paid API endpoint.
 * Payments in ORE token on Base Mainnet.
 */

export const ORE_TOKEN = "0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD";
export const BASE_CHAIN_ID = 8453;

export type AgentService = {
  id: string;
  name: string;
  description: string;
  icon: string;
  endpoint: string;
  price: {
    amountUsd: number;
    token: "ORE";
    weiPerCall: string;  // ORE token amount in wei (18 decimals)
  };
  chainId: number;
  tokenAddress: string;
  inputSchema: string;
};

export const AGENT_SERVICES: AgentService[] = [
  {
    id: "chat",
    name: "Signal Chat",
    description: "Query the OREBOT Network signal database. Ask about mined signals, market trends, and on-chain analytics. Billed per query.",
    icon: "message-square",
    endpoint: "/api/agent/chat",
    price: { amountUsd: 0.01, token: "ORE", weiPerCall: "10000000000000000" },
    chainId: BASE_CHAIN_ID,
    tokenAddress: ORE_TOKEN,
    inputSchema: `{ "prompt": "string", "context"?: "string[]" }`,
  },
  {
    id: "image",
    name: "Signal Visualization",
    description: "Generate visualizations of mining results, signal scores, and OREBOT network activity. Billed per image.",
    icon: "image",
    endpoint: "/api/agent/image",
    price: { amountUsd: 0.05, token: "ORE", weiPerCall: "50000000000000000" },
    chainId: BASE_CHAIN_ID,
    tokenAddress: ORE_TOKEN,
    inputSchema: `{ "prompt": "string", "style"?: "string", "size"?: "512x512" | "1024x1024" }`,
  },
  {
    id: "analyze",
    name: "Signal Analysis",
    description: "Deep analysis of mined signals with confidence scoring and cross-reference validation. Billed per analysis.",
    icon: "bar-chart-3",
    endpoint: "/api/agent/analyze",
    price: { amountUsd: 0.10, token: "ORE", weiPerCall: "100000000000000000" },
    chainId: BASE_CHAIN_ID,
    tokenAddress: ORE_TOKEN,
    inputSchema: `{ "data": "object[]", "query": "string" }`,
  },
];

export function getServiceById(id: string): AgentService | undefined {
  return AGENT_SERVICES.find((s) => s.id === id);
}

export function getServiceByEndpoint(endpoint: string): AgentService | undefined {
  return AGENT_SERVICES.find((s) => endpoint.startsWith(s.endpoint));
}
