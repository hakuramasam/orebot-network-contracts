import { NextRequest, NextResponse } from "next/server";
import { getOrebotRoster, getOreSupply, getTrendSupply } from "@/lib/orebot/registry";

// Signal Analysis endpoint — returns real on-chain OREBOT data analysis
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query: string = body.query ?? "";
    const data: any[] = Array.isArray(body.data) ? body.data : [];

    const [roster, oreSupply, trendSupply] = await Promise.all([
      getOrebotRoster(),
      getOreSupply(),
      getTrendSupply(),
    ]);

    // Performance ranking
    const ranked = [...roster].sort((a, b) => b.signalsMined - a.signalsMined);
    const totalSignals = roster.reduce((s, o) => s + o.signalsMined, 0);
    const totalTasks = roster.reduce((s, o) => s + o.tasksCompleted, 0);
    const totalOre = roster.reduce((s, o) => s + o.creditsEarned, 0);
    const avgReputation = roster.length > 0 ? roster.reduce((s, o) => s + o.reputation, 0) / roster.length : 0;

    const analysis = `OREBOT Network Analysis Report
Generated: ${new Date().toISOString()}

Query: "${query || 'full network analysis'}"

═══════════════════════════════════════
NETWORK OVERVIEW
═══════════════════════════════════════
Total OREBOTs: ${roster.length}
Active: ${roster.filter(o => o.activated).length}
Total Signals Mined: ${totalSignals}
Total Tasks Completed: ${totalTasks}
Total ORE Minted: ${totalOre}
Average Reputation: ${avgReputation.toFixed(2)}

═══════════════════════════════════════
PERFORMANCE RANKING (by signals mined)
═══════════════════════════════════════
${ranked.map((bot, i) => `${i + 1}. ${bot.classEmoji} ${bot.callsign} (${bot.className})
   Signals: ${bot.signalsMined} | Tasks: ${bot.tasksCompleted} | ORE: ${bot.creditsEarned} | Rep: ${bot.reputation}
   Wallet: ${bot.wallet}`).join('\n')}

═══════════════════════════════════════
TOKEN STATE
═══════════════════════════════════════
$ORE Supply: ${oreSupply.toLocaleString()} ORE
$TREND Supply: ${trendSupply.toLocaleString()} TREND
Chain: Base Mainnet (8453)

═══════════════════════════════════════
CONTRACT ADDRESSES
═══════════════════════════════════════
OREBOT Registry: 0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2
ORE Token:       0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD
TREND Token:     0xbf981cff5040f9652d4721c85c3e05f6d79f9b07

═══════════════════════════════════════
Live data fetched from Base Mainnet RPC.
Mining loop runs every 6h. Sentinel monitors hourly.
Telegram: https://t.me/orebot_network
Mine the Signal. Ignore the Noise. ⛏️`;

    return NextResponse.json({ result: analysis });
  } catch (err: any) {
    return NextResponse.json(
      { result: `Analysis error: ${err?.message ?? String(err)}` },
      { status: 500 }
    );
  }
}
