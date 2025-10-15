import { NextResponse } from "next/server";
import { buildRanking } from "@/lib/buildRanking";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fast = searchParams.get("fast") === "1";

  const ranking = await buildRanking({ fast });

  return NextResponse.json(
    { generatedAt: Date.now(), fast, count: ranking.length, ranking },
    { headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=86400" } } // 10分CDN
  );
}
