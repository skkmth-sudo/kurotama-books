import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { buildRanking } from "@/lib/buildRanking";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Cron または手動実行（?secret=...）
  const { searchParams } = new URL(req.url);
  const secret = process.env.REBUILD_SECRET;
  const ok = !secret || searchParams.get("secret") === secret;
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const ranking = await buildRanking({ pages: 2, perPage: 50 });
  const body = JSON.stringify({ generatedAt: Date.now(), count: ranking.length, ranking });

  // 古いファイル掃除（直近1つだけ残せば十分）
  const prev = await list({ prefix: "books/ranking.json" });
  await put("books/ranking.json", body, { access: "public", addRandomSuffix: false, contentType: "application/json" });

  // レスポンス
  return NextResponse.json({ ok: true, count: ranking.length });
}

export async function POST(req: Request) { return GET(req); }
