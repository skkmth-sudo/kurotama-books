import { NextResponse } from "next/server";
import { buildRanking } from "@/lib/buildRanking";

export const runtime = "nodejs";

export async function GET() {
  try {
    const ranking = await buildRanking({ pages: 2, perPage: 30 });
    return NextResponse.json({ ok: true, generatedAt: Date.now(), count: ranking.length, ranking });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}