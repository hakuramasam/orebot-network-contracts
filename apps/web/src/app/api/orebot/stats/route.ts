import { NextResponse } from "next/server";
import { getOrebotRoster, getOreSupply, getTrendSupply, CONTRACT_ADDRESSES } from "@/lib/orebot/registry";

export async function GET() {
  try {
    const [roster, oreSupply, trendSupply] = await Promise.all([
      getOrebotRoster(),
      getOreSupply(),
      getTrendSupply(),
    ]);

    const totalSignalsMined = roster.reduce((sum, o) => sum + o.signalsMined, 0);
    const totalTasksCompleted = roster.reduce((sum, o) => sum + o.tasksCompleted, 0);
    const totalOreMinted = roster.reduce((sum, o) => sum + o.creditsEarned, 0);
    const activeBots = roster.filter((o) => o.activated).length;

    return NextResponse.json({
      ok: true,
      network: {
        name: "OREBOT Network",
        chain: "Base Mainnet",
        chainId: 8453,
        contracts: CONTRACT_ADDRESSES,
      },
      stats: {
        total_orebots: roster.length,
        active_orebots: activeBots,
        total_signals_mined: totalSignalsMined,
        total_tasks_completed: totalTasksCompleted,
        total_ore_minted: totalOreMinted,
        ore_supply: oreSupply,
        trend_supply: trendSupply,
      },
      roster,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
