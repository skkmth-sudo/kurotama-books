// app/api/child-books/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/api/qiita-picture-books";
  return NextResponse.redirect(url, 307);
}
