import { NextResponse } from "next/server";
import { readRanking } from "@/lib/rankingStore";

export const runtime = "nodejs";

export async function GET() {
  const ranking = await readRanking();
  // まだ rebuild を一度もしていない場合は空配列で返る
  return NextResponse.json(
    { ranking },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=86400" } }
  );
}
