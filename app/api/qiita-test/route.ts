// app/api/qiita-test/route.ts
import { NextResponse } from "next/server";

// Nodeランタイムで実行
export const runtime = "nodejs";
// キャッシュを使わず、常に最新データを取得
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "Next.js";
    const page = Number(searchParams.get("page") ?? "1");
    const per = Number(searchParams.get("per") ?? "10");

    // Qiita API（トークンがあるとレート制限緩和）
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    const token = process.env.QIITA_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    // データ取得
    const res = await fetch(
      `https://qiita.com/api/v2/items?page=${page}&per_page=${per}&query=${encodeURIComponent(q)}`,
      { headers, cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Qiita", status: res.status },
        { status: res.status }
      );
    }

    const items = await res.json();
    return NextResponse.json({ query: q, page, per, count: items.length, items });
  } catch (e) {
    console.error("Qiita API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 他のHTTPメソッドを使いたい場合は下に追加
// export async function POST(request: Request) { ... }
