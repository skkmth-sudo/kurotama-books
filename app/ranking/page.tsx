"use client";

import { useEffect, useState } from "react";

type Book = {
  id: string;
  title: string;
  authors: string[];
  categories: string[];
  publishedDate: string;
  averageRating: number | null;
  ratingsCount: number;
  pageCount: number | null;
  thumbnail: string | null;
  infoLink: string;
  listPrice: string | null;
};

export default function RankingPage() {
  const [items, setItems] = useState<Book[]>([]);
  const [query, setQuery] = useState("絵本");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  async function fetchData(q: string, nextPage = 1, append = false) {
    try {
      setLoading(true);
      setError(null);
      // 1回で20冊取得
      const res = await fetch(
        `/api/child-books?q=${encodeURIComponent(q)}&page=${nextPage}&per=20`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const received: Book[] = data.items ?? [];
      setItems((prev) => (append ? [...prev, ...received] : received));
      setPage(nextPage);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(query, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Stars = ({ value }: { value: number | null }) => {
    const v = Math.max(0, Math.min(5, value ?? 0));
    const full = Math.floor(v);
    const empty = 5 - full;
    return (
      <span className="inline-flex items-center text-amber-500">
        {"★".repeat(full)}
        {"☆".repeat(empty)}
        <span className="ml-2 text-xs text-gray-600">{v ? v.toFixed(1) : "—"}</span>
      </span>
    );
  };

  const pastelColors = [
    "bg-yellow-50 border-yellow-200",
    "bg-green-50 border-green-200",
    "bg-blue-50 border-blue-200",
    "bg-pink-50 border-pink-200",
    "bg-purple-50 border-purple-200",
  ];

  const presets = ["絵本", "読み聞かせ", "動物 絵本", "冒険 絵本", "科学 絵本", "はじめての漢字"];

  return (
    <main className="max-w-5xl mx-auto p-6 font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-green-900 drop-shadow-md">
        <span className="bg-amber-100 px-6 py-2 rounded-3xl shadow-sm border border-amber-200">
          🌲 人気児童書ランキング
        </span>
      </h1>

      {/* プリセット */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => {
              setQuery(p);
              fetchData(p, 1, false);
            }}
            className="rounded-full border border-green-300 bg-white/80 px-3 py-1 text-sm text-green-700 hover:bg-green-50"
          >
            #{p}
          </button>
        ))}
      </div>

      {/* 検索 + いっぱい見る */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="テーマを検索（例：絵本・冒険・動物・科学）"
          className="border border-yellow-300 rounded-full px-4 py-2 w-72 focus:ring-2 focus:ring-amber-300 outline-none"
        />
        <button
          onClick={() => fetchData(query, 1, false)}
          disabled={loading}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow"
        >
          {loading ? "よみこみ中..." : "検索"}
        </button>

        <button
          onClick={async () => {
            // 1〜3ページ連続取得で最大60冊近く一覧に
            await fetchData(query, 1, false);
            await fetchData(query, 2, true);
            await fetchData(query, 3, true);
          }}
          disabled={loading}
          className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow"
        >
          いっぱい見る（50冊）
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-center mb-4">取得に失敗しました：{error}</p>
      )}

      {/* カード一覧 */}
      <div className="space-y-4">
        {items.map((b, idx) => (
          <div
            key={b.id ?? b.infoLink ?? idx}
            className={`rounded-3xl shadow-md border p-4 transition hover:-translate-y-1 hover:shadow-lg ${pastelColors[idx % pastelColors.length]}`}
          >
            <div className="flex gap-4">
              {/* 表紙 */}
              <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-xl border border-amber-200 bg-white">
                {b.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.thumbnail}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-3xl">📘</div>
                )}
              </div>

              {/* 本文 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-lg text-green-900 leading-snug">
                    <span className="mr-2 text-xl">
                      {idx === 0 ? "🌳" : idx === 1 ? "🍃" : idx === 2 ? "📗" : `📖${idx + 1}`}
                    </span>
                    <a
                      href={b.infoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {b.title}
                    </a>
                  </h2>

                  {/* 評価バッジ */}
                  <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-600 text-white px-3 py-1 text-sm font-bold shadow">
                    ⭐ {b.averageRating ? b.averageRating.toFixed(1) : "—"}
                  </span>
                </div>

                <div className="mt-1 text-sm text-gray-700 flex flex-wrap items-center gap-3">
                  <span>👤 {b.authors?.length ? b.authors.join(" / ") : "著者情報なし"}</span>
                  <span>📅 {b.publishedDate || "—"}</span>
                  {b.pageCount ? <span>📄 {b.pageCount} p</span> : null}
                  {b.listPrice ? <span>💴 {b.listPrice}</span> : null}
                </div>

                <div className="mt-1">
                  <Stars value={b.averageRating} />
                  <span className="ml-2 text-xs text-gray-600">
                    {b.ratingsCount ? `(${b.ratingsCount}件)` : ""}
                  </span>
                </div>

                {!!b.categories?.length && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {b.categories.slice(0, 6).map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setQuery(c);
                          fetchData(c, 1, false);
                        }}
                        className="rounded-full border border-green-300 bg-white/70 px-2.5 py-1 text-xs text-green-700 hover:bg-green-50"
                        title={`カテゴリ: ${c}`}
                      >
                        #{c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* さらに読み込む */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => fetchData(query, page + 1, true)}
            disabled={loading}
            className="rounded-full bg-green-600 hover:bg-green-700 text-white px-5 py-2 shadow"
          >
            {loading ? "読み込み中…" : "さらに読み込む"}
          </button>
        </div>

        {items.length === 0 && !loading && (
          <p className="text-center text-gray-500">結果が見つかりませんでした📖</p>
        )}
      </div>
    </main>
  );
}
