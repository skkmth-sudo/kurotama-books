import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { buildRanking } from "@/lib/buildRanking";

export const runtime = "nodejs";

export async function GET() {
  // 1) まず Blob の保存済みJSONを返す
  const files = await list({ prefix: "books/ranking.json" });
  const hit = files.blobs.find(b => b.pathname === "books/ranking.json");
  if (hit) {
    const r = await fetch(hit.url, { cache: "no-store" });
    const json = await r.json();
    return NextResponse.json(json, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=86400" },
    });
  }
  // 2) 初回だけのフォールバック：軽量集計して即返し
  const ranking = await buildRanking({ pages: 1, perPage: 20 });
  return NextResponse.json({ generatedAt: Date.now(), count: ranking.length, ranking });
}
