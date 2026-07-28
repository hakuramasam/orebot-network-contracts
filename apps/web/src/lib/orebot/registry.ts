/**
 * OREBOT Registry — reads on-chain data from the OREBOTRegistry contract on Base.
 * Provides the agent roster, stats, and contract addresses for the web app.
 */

// Contract addresses (Base Mainnet, chainId 8453)
export const OREBOT_REGISTRY = "0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2";
export const ORE_TOKEN = "0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD";
export const TREND_TOKEN = "0xbf981cff5040f9652d4721c85c3e05f6d79f9b07";
export const AGENT_PAYMENT_ROUTER = "0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e";
export const OREBOT_MARKETPLACE = "0x83358421B952eCe0Fc84529E81A1bC98a1001B7d";
export const SIGNAL_STAKING = "0x9948378e9088979124184464d145ACF0E217C5a7";
export const TREND_BUYBACK_BURNER = "0x02ae416b83dd3A572d98F78E523b3536127eac2d";

// Operator wallet
export const OPERATOR_WALLET = "0x9ad133aDDba94A95320126d8784d484943130115";
// Treasury wallet
export const TREASURY_WALLET = "0x4e26fc6eb05a1cdbd762609fde9958e5b8cc754d";

// Base RPC endpoints (public)
const RPC_ENDPOINTS = [
  "https://mainnet.base.org",
  "https://base.llamarpc.com",
  "https://base.publicnode.com",
];

export enum OrebotClass {
  Miner = 0,
  Analyst = 1,
  Builder = 2,
  Guardian = 3,
  Scout = 4,
  Prospector = 5,
}

export const CLASS_NAMES: Record<number, string> = {
  0: "Miner",
  1: "Analyst",
  2: "Builder",
  3: "Guardian",
  4: "Scout",
  5: "Prospector",
};

export const CLASS_EMOJI: Record<number, string> = {
  0: "⛏️",
  1: "📊",
  2: "🔨",
  3: "🛡️",
  4: "🧭",
  5: "🔍",
};

export type OrebotOnChain = {
  id: number;
  callsign: string;
  wallet: string;
  class: number;
  className: string;
  classEmoji: string;
  reputation: number;
  signalsMined: number;
  tasksCompleted: number;
  creditsEarned: number;
  activated: boolean;
};

export const CONTRACT_ADDRESSES = {
  OREBOT_REGISTRY,
  ORE_TOKEN,
  TREND_TOKEN,
  AGENT_PAYMENT_ROUTER,
  OREBOT_MARKETPLACE,
  SIGNAL_STAKING,
  TREND_BUYBACK_BURNER,
  OPERATOR_WALLET,
  TREASURY_WALLET,
};

/**
 * Fetch the full OREBOT roster from the Registry contract via raw RPC.
 */
export async function getOrebotRoster(): Promise<OrebotOnChain[]> {
  const roster: OrebotOnChain[] = [];
  // orebots(uint256) selector: 0x9185d8b8 + uint256 arg
  const OREBOTS_SELECTOR = "0x9185d8b8";

  for (let i = 1; i <= 6; i++) {
    try {
      const arg = i.toString(16).padStart(64, "0");
      const data = OREBOTS_SELECTOR + arg;
      const result = await rpcCall(OREBOT_REGISTRY, data);
      const decoded = decodeOrebotStruct(result);
      roster.push({
        id: i,
        ...decoded,
        className: CLASS_NAMES[decoded.class] ?? "Unknown",
        classEmoji: CLASS_EMOJI[decoded.class] ?? "❓",
      });
    } catch (err) {
      console.error(`Failed to fetch OREBOT #${i}:`, err);
    }
  }

  return roster;
}

/**
 * Get ORE token total supply.
 */
export async function getOreSupply(): Promise<number> {
  try {
    const data = await rpcCall(ORE_TOKEN, "0x18160ddd");
    return Number(BigInt(data)) / 1e18;
  } catch {
    return 0;
  }
}

/**
 * Get TREND token total supply.
 */
export async function getTrendSupply(): Promise<number> {
  try {
    const data = await rpcCall(TREND_TOKEN, "0x18160ddd");
    return Number(BigInt(data)) / 1e18;
  } catch {
    return 0;
  }
}

// ── Internal helpers ──

function decodeOrebotStruct(hex: string): Omit<OrebotOnChain, "id" | "className" | "classEmoji"> {
  let h = hex.startsWith("0x") ? hex.slice(2) : hex;

  // Dynamic string: first 32 bytes is offset
  const stringOffset = parseInt(h.slice(0, 64), 16) * 2;
  const stringLen = parseInt(h.slice(stringOffset, stringOffset + 64), 16) * 2;
  const callsignHex = h.slice(stringOffset + 64, stringOffset + 64 + stringLen);
  let callsign = "";
  for (let i = 0; i < callsignHex.length; i += 2) {
    callsign += String.fromCharCode(parseInt(callsignHex.slice(i, i + 2), 16));
  }

  // Fixed fields after the offset slot (slot 1 = 64 hex chars)
  const wallet = "0x" + h.slice(64 + 24, 64 + 64).toLowerCase();
  const orebotClass = parseInt(h.slice(128, 192), 16);
  const reputation = parseInt(h.slice(192, 256), 16);
  const signalsMined = parseInt(h.slice(256, 320), 16);
  const tasksCompleted = parseInt(h.slice(320, 384), 16);
  const creditsEarned = parseInt(h.slice(384, 448), 16);
  const activated = parseInt(h.slice(448, 512), 16) === 1;

  return {
    callsign: callsign.replace(/\u0000+$/, ""),
    wallet,
    class: orebotClass,
    reputation,
    signalsMined,
    tasksCompleted,
    creditsEarned,
    activated,
  };
}

async function rpcCall(to: string, data: string): Promise<string> {
  let lastErr: unknown;
  for (const url of RPC_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to, data }, "latest"],
        }),
      });
      if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
      const json = await res.json();
      if (json.error) { lastErr = new Error(json.error.message); continue; }
      return json.result as string;
    } catch (e) { lastErr = e; continue; }
  }
  throw lastErr ?? new Error("All RPC endpoints failed");
}
