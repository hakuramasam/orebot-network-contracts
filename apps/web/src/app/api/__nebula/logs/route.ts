import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ClientLog = { kind: string; message: string; stack?: string; at: number };

const MAX = 100;
const buffer: ClientLog[] = [];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ClientLog>;
    buffer.push({
      kind: String(body.kind ?? "client"),
      message: String(body.message ?? "").slice(0, 2000),
      stack: body.stack ? String(body.stack).slice(0, 4000) : undefined,
      at: typeof body.at === "number" ? body.at : Date.now(),
    });
    if (buffer.length > MAX) buffer.splice(0, buffer.length - MAX);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ logs: buffer });
}
