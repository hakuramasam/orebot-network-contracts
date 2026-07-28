import { NextRequest, NextResponse } from "next/server";
import { getOrebotRoster } from "@/lib/orebot/registry";

// Signal Visualization endpoint — generates ASCII art / data viz from live OREBOT data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt: string = body.prompt ?? "";

    const roster = await getOrebotRoster();
    const maxSignals = Math.max(...roster.map(o => o.signalsMined), 1);

    // Generate ASCII bar chart of signals mined per OREBOT
    let chart = `\nOREBOT Network — Signal Mining Activity\n`;
    chart += `${'═'.repeat(50)}\n\n`;

    for (const bot of roster) {
      const barLen = Math.round((bot.signalsMined / maxSignals) * 30);
      const bar = '█'.repeat(barLen) + '░'.repeat(30 - barLen);
      chart += `${bot.classEmoji} ${bot.callsign.padEnd(8)} ${bar} ${bot.signalsMined}\n`;
    }

    chart += `\n${'─'.repeat(50)}\n`;
    chart += `Total: ${roster.reduce((s, o) => s + o.signalsMined, 0)} signals mined\n`;
    chart += `Active: ${roster.filter(o => o.activated).length}/${roster.length} OREBOTs\n`;
    chart += `ORE Minted: ${roster.reduce((s, o) => s + o.creditsEarned, 0)}\n`;
    chart += `Generated: ${new Date().toISOString()}\n`;
    chart += `Chain: Base Mainnet (8453)\n\n`;
    chart += `Mine the Signal. Ignore the Noise. ⛏️`;

    return NextResponse.json({ result: chart, prompt });
  } catch (err: any) {
    return NextResponse.json(
      { result: `Visualization error: ${err?.message ?? String(err)}` },
      { status: 500 }
    );
  }
}
