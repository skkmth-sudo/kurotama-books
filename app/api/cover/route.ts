import { NextResponse } from "next/server";

// Open Library: https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg
function openLibraryByIsbn(isbn: string) {
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-M.jpg`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isbn = searchParams.get("isbn") || "";
  const title = searchParams.get("title") || "";

  // 1) ISBN があれば Open Library を即返し（存在しない場合は透明1px画像になる仕様）
  if (isbn) {
    return NextResponse.json({ url: openLibraryByIsbn(isbn) }, {
      headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800" },
    });
  }

  // 2) ISBNない場合: Google Books でタイトル検索
  if (title) {
    try {
      const r = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1`,
        { next: { revalidate: 86400 } }
      );
      const j = await r.json();
      const item = j?.items?.[0];
      const thumb =
        item?.volumeInfo?.imageLinks?.thumbnail ||
        item?.volumeInfo?.imageLinks?.smallThumbnail;

      if (thumb) {
        // http を https に、=http→=https 置換
        const safe = String(thumb).replace(/^http:/, "https:");
        return NextResponse.json({ url: safe }, {
          headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800" },
        });
      }
    } catch (_) {}
  }

  // 3) 何も無ければ null
  return NextResponse.json({ url: null }, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
