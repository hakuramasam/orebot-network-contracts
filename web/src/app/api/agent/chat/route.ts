import { NextRequest, NextResponse } from "next/server";
import { getOrebotRoster, getOreSupply, getTrendSupply } from "@/lib/orebot/registry";

// This is a server-side route that returns real OREBOT data.
// In production, x402 payment would be verified before serving.
// For now, we serve real on-chain data without payment gating.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt: string = body.prompt ?? "";

    // Fetch real on-chain data
    const [roster, oreSupply, trendSupply] = await Promise.all([
      getOrebotRoster(),
      getOreSupply(),
      getTrendSupply(),
    ]);

    const totalSignals = roster.reduce((s, o) => s + o.signalsMined, 0);
    const totalTasks = roster.reduce((s, o) => s + o.tasksCompleted, 0);
    const totalOre = roster.reduce((s, o) => s + o.creditsEarned, 0);
    const activeBots = roster.filter((o) => o.activated).length;

    // Build a response based on the prompt
    const lowerPrompt = prompt.toLowerCase();

    let response = "";

    if (lowerPrompt.includes("roster") || lowerPrompt.includes("bots") || lowerPrompt.includes("agents")) {
      response = `OREBOT Network Roster (${activeBots}/${roster.length} active):\n\n`;
      for (const bot of roster) {
        response += `${bot.classEmoji} ${bot.callsign} (${bot.className})\n`;
        response += `  Wallet: ${bot.wallet}\n`;
        response += `  Signals: ${bot.signalsMined} | Tasks: ${bot.tasksCompleted} | ORE: ${bot.creditsEarned} | Rep: ${bot.reputation}\n`;
        response += `  Status: ${bot.activated ? "✅ Active" : "⏸️ Inactive"}\n\n`;
      }
    } else if (lowerPrompt.includes("supply") || lowerPrompt.includes("token") || lowerPrompt.includes("ore") || lowerPrompt.includes("trend")) {
      response = `$ORE Token (Base Mainnet):\n`;
      response += `  Address: 0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD\n`;
      response += `  Total Supply: ${oreSupply.toLocaleString()} ORE\n`;
      response += `  Minted to OREBOTs: ${totalOre.toLocaleString()} ORE\n\n`;
      response += `$TREND Token (Base Mainnet):\n`;
      response += `  Address: 0xbf981cff5040f9652d4721c85c3e05f6d79f9b07\n`;
      response += `  Total Supply: ${trendSupply.toLocaleString()} TREND\n`;
    } else if (lowerPrompt.includes("signal") || lowerPrompt.includes("mine") || lowerPrompt.includes("mining")) {
      response = `OREBOT Mining Stats:\n\n`;
      response += `  Total Signals Mined: ${totalSignals}\n`;
      response += `  Total Tasks Completed: ${totalTasks}\n`;
      response += `  Total ORE Minted: ${totalOre}\n`;
      response += `  Active OREBOTs: ${activeBots}/${roster.length}\n\n`;
      response += `Mining runs every 6 hours. Top signals are scored and stored on-chain.\n`;
      response += `View latest signals at https://t.me/orebot_network`;
    } else {
      response = `OREBOT Network — Autonomous Signal Mining on Base\n\n`;
      response += `Network Stats:\n`;
      response += `  Active OREBOTs: ${activeBots}/${roster.length}\n`;
      response += `  Signals Mined: ${totalSignals}\n`;
      response += `  Tasks Completed: ${totalTasks}\n`;
      response += `  ORE Minted: ${totalOre}\n`;
      response += `  ORE Supply: ${oreSupply.toLocaleString()}\n`;
      response += `  TREND Supply: ${trendSupply.toLocaleString()}\n\n`;
      response += `Ask about: roster, signals, supply, tokens, or mining stats.\n`;
      response += `Telegram: https://t.me/orebot_network`;
    }

    return NextResponse.json({ result: response, prompt });
  } catch (err: any) {
    return NextResponse.json(
      { result: `Error fetching OREBOT data: ${err?.message ?? String(err)}` },
      { status: 500 }
    );
  }
}
