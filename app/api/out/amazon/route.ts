// app/api/out/amazon/route.ts
import { NextResponse } from "next/server";
import { amazonFromAsin } from "@/lib/affiliate";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const asin = searchParams.get("asin");
  if (!asin) return NextResponse.json({ error: "asin required" }, { status: 400 });

  const url = amazonFromAsin(asin);

  // 未設定時はそのままAmazon直リンク（または案内JSONにしたければ下を返す）
  if (!process.env.MOSHIMO_A_ID) {
    // 直リンクの方がUX良い:
    return NextResponse.redirect(url, 302);

    // もしくはメッセージで返したい場合:
    // return NextResponse.json({ notice: "affiliate not configured", url });
  }

  return NextResponse.redirect(url, 302);
}
