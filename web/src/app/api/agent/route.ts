import { NextResponse } from "next/server";
import { AGENT_SERVICES } from "@/lib/agent/services";

export async function GET() {
  return NextResponse.json({
    name: "OREBOT Network API",
    version: "0.1.0",
    description: "Autonomous signal mining with x402 on-chain ORE micropayments",
    auth: {
      methods: ["web3_wallet", "google", "x", "farcaster", "email", "phone"],
      docs: "https://portal.thirdweb.com/connect/sign-in/overview",
    },
    payments: {
      protocol: "x402",
      chains: 170,
      docs: "https://portal.thirdweb.com/x402",
    },
    services: AGENT_SERVICES.map((s) => ({
      id: s.id,
      name: s.name,
      endpoint: s.endpoint,
      method: "POST",
      price: `${s.price.amountUsd.toFixed(2)} ${s.price.token}`,
      description: s.description,
    })),
  });
}
