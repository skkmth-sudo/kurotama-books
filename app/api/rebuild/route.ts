import { NextResponse } from "next/server";
import { buildRanking } from "@/lib/buildRanking";

export const runtime = "nodejs";

export async function POST() {
  const ranking = await buildRanking({ fast: false });
  return NextResponse.json({ ok: true, generatedAt: Date.now(), count: ranking.length, ranking });
}

// GET で叩いてもOK（任意）
export async function GET() {
  return POST();
}
