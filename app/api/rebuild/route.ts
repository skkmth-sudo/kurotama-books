@'
import { NextResponse } from "next/server";
import { buildRanking } from "@/lib/buildRanking";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expected = process.env.REBUILD_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  try {
    const ranking = await buildRanking({ pages: 2, perPage: 30 });
    return NextResponse.json({ ok: true, generatedAt: Date.now(), count: ranking.length, ranking });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
'@ | Set-Content -Path app/api/rebuild/route.ts -Encoding utf8 -NoNewline
