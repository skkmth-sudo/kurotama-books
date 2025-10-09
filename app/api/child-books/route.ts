// app/api/child-books/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 改良ポイント
 * - 複数クエリを横断してマージ（intitle, "絵本"付与, 児童書subject など）
 * - 10件未満なら段階的に検索を広げる（langRestrict外す 等）
 * - 児童書らしさ + 人気でスコアリングして並べ替え
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "絵本").trim();
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const perRaw = Number(searchParams.get("per") ?? "20");
    const per = Math.min(Math.max(1, perRaw), 40); // Google Booksの上限40
    const startIndex = (page - 1) * per;

    const key = process.env.GOOGLE_BOOKS_API_KEY || "";

    // 検索戦略（段階的に広げる）
    const queriesStage1 = [
      `(intitle:${q}) (subject:juvenile OR 児童 OR 絵本 OR 子ども)`,
      `(${q} 絵本) (subject:juvenile OR 児童 OR 絵本 OR 子ども)`,
      `(${q} 児童書) (subject:juvenile OR 児童 OR 絵本 OR 子ども)`,
    ];

    const queriesStage2 = [
      `${q} (subject:juvenile OR 児童 OR 絵本 OR 子ども)`,
      `(${q}) (subject:"Children" OR "Juvenile" OR "Young")`,
    ];

    const queriesFallback = [
      `絵本 児童書`, // 最低限でも“絵本”を多めに
    ];

    // langRestrict=ja でまず日本語優先
    let results = await searchMany(queriesStage1, {
      per,
      startIndex,
      key,
      langRestrict: "ja",
    });

    if (results.length < 10) {
      const more = await searchMany(queriesStage2, {
        per,
        startIndex,
        key,
        langRestrict: "ja",
      });
      results = mergeUnique(results, more);
    }

    // それでも少なければ日本語制限を外して更に拾う
    if (results.length < 10) {
      const evenMore = await searchMany(queriesStage2, {
        per,
        startIndex,
        key,
        langRestrict: "", // 外す
      });
      results = mergeUnique(results, evenMore);
    }

    // それでも少なければ絵本固定で補充
    if (results.length < 10) {
      const fallback = await searchMany(queriesFallback, {
        per,
        startIndex,
        key,
        langRestrict: "ja",
      });
      results = mergeUnique(results, fallback);
    }

    // スコアリングして並べ替え
    const items = results
      .map((it) => normalize(it))
      .sort((a, b) => score(b) - score(a))
      .slice(0, per); // ページング分だけ返す

    return NextResponse.json({
      query: q,
      page,
      per,
      count: items.length,
      items,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function mergeUnique(a: any[], b: any[]) {
  const byId = new Map<string, any>();
  for (const x of a) if (x?.id) byId.set(x.id, x);
  for (const x of b) if (x?.id && !byId.has(x.id)) byId.set(x.id, x);
  return Array.from(byId.values());
}

async function searchMany(
  queries: string[],
  opts: { per: number; startIndex: number; key?: string; langRestrict?: string }
) {
  const out: any[] = [];
  for (const q of queries) {
    const list = await searchGoogleBooks(q, opts);
    for (const it of list) {
      if (it?.id) out.push(it);
    }
    // 目標件数に達したら早期終了
    if (out.length >= opts.per) break;
  }
  return out;
}

async function searchGoogleBooks(
  q: string,
  { per, startIndex, key, langRestrict }: { per: number; startIndex: number; key?: string; langRestrict?: string }
) {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", q);
  if (langRestrict) url.searchParams.set("langRestrict", langRestrict);
  url.searchParams.set("printType", "books");
  url.searchParams.set("orderBy", "relevance");
  url.searchParams.set("maxResults", String(Math.min(per, 40)));
  url.searchParams.set("startIndex", String(startIndex));
  if (key) url.searchParams.set("key", key!);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items ?? [];
}

function normalize(it: any) {
  const v = it.volumeInfo ?? {};
  const s = it.saleInfo ?? {};
  const img = v.imageLinks ?? {};
  const categories: string[] = v.categories ?? [];
  const isKids =
    categories.some((c: string) =>
      /(児童|絵本|こども|子ども|ジュニア|幼児|小学生|juvenile|young)/i.test(c)
    ) || /(絵本|児童|こども|子ども)/.test(v.title ?? "");

  return {
    id: it.id,
    title: v.title,
    authors: v.authors ?? [],
    categories,
    publishedDate: v.publishedDate ?? "",
    description: v.description ?? "",
    averageRating: v.averageRating ?? null,
    ratingsCount: v.ratingsCount ?? 0,
    pageCount: v.pageCount ?? null,
    thumbnail:
      v.imageLinks?.thumbnail?.replace("http://", "https://") ||
      v.imageLinks?.smallThumbnail?.replace("http://", "https://") ||
      null,
    infoLink: v.infoLink,
    listPrice:
      s.listPrice?.amount && s.listPrice?.currencyCode
        ? `${s.listPrice.amount.toLocaleString()} ${s.listPrice.currencyCode}`
        : null,
    isKids,
  };
}

function score(x: any) {
  return (
    (x.isKids ? 1000 : 0) +
    (x.averageRating ? x.averageRating * 20 : 0) +
    Math.min(x.ratingsCount ?? 0, 500)
  );
}
