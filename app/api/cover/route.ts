import { NextResponse } from "next/server";

function openLibraryByIsbn(isbn: string) {
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-M.jpg`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isbn = searchParams.get("isbn") || "";
  const title = searchParams.get("title") || "";

  if (isbn) {
    return NextResponse.json({ url: openLibraryByIsbn(isbn) }, {
      headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800" },
    });
  }

  if (title) {
    try {
      const r = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1`
      );
      const j = await r.json();
      const item = j?.items?.[0];
      const thumb =
        item?.volumeInfo?.imageLinks?.thumbnail ||
        item?.volumeInfo?.imageLinks?.smallThumbnail;
      if (thumb) {
        const safe = String(thumb).replace(/^http:/, "https:");
        return NextResponse.json({ url: safe }, {
          headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800" },
        });
      }
    } catch (_) {}
  }

  return NextResponse.json({ url: null }, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
