"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Source = { qiitaId: string; url: string; title: string; likes: number; stocks: number };
type BookAgg = {
  id: string; title: string; asin?: string; isbn?: string;
  mentions: number; score: number; totalLikes: number; totalStocks: number;
  sources: Source[];
};

export default function RankingPage() {
  const [items, setItems] = useState<BookAgg[]>([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/rebuild?ts=${Date.now()}`, { cache: "no-store" });
    const json = await res.json();
    setItems((json.ranking || []) as BookAgg[]);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    const needle = q.toLowerCase();
    return items.filter(
      (b) =>
        b.title.toLowerCase().includes(needle) ||
        b.sources.some((s) => s.title.toLowerCase().includes(needle))
    );
  }, [items, q]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">📚 えほんの森 ランキング（👍=Qiita いいね合計）</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border rounded px-3 py-2 w-80"
          placeholder="タイトル・記事を検索"
        />
        <button onClick={load} className="px-4 py-2 rounded bg-emerald-600 text-white">
          再集計
        </button>
        <Link href="/posts" className="ml-auto underline text-sm text-blue-700">
          記事一覧へ
        </Link>
      </div>

      <ul className="space-y-3">
        {filtered.map((b, i) => {
          const isOpen = active === b.id;
          return (
            <li key={b.id} className="border rounded-2xl bg-white shadow-sm">
              {/* ヘッダー行（クリックで開閉） */}
              <button
                onClick={() => setActive(isOpen ? null : b.id)}
                className="w-full text-left p-4 flex items-start justify-between gap-3"
              >
                <div>
                  <h2 className="font-semibold text-lg">
                    {i < 9 ? `#0${i + 1}` : `#${i + 1}`} {b.title}
                  </h2>
                  <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-3">
                    <span>👍 {b.totalLikes}</span>
                    <span>🗂️ 言及 {b.mentions}</span>
                    {b.totalStocks ? <span>⭐ ストック {b.totalStocks}</span> : null}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {b.asin ? (
                    <a
                      href={`/api/out/amazon?asin=${b.asin}`}
                      className="inline-block text-xs px-3 py-1 rounded bg-orange-600 text-white"
                      target="_blank" rel="nofollow sponsored noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      PR: Amazonで見る
                    </a>
                  ) : (
                    <a
                      href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(b.title)}`}
                      className="inline-block text-xs px-3 py-1 rounded bg-gray-700 text-white"
                      target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Amazonで探す
                    </a>
                  )}

                  <span
                    className={`inline-grid place-items-center w-7 h-7 rounded-full border ${
                      isOpen ? "bg-emerald-600 text-white" : "bg-white"
                    }`}
                    aria-hidden
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </div>
              </button>

              {/* 展開部：関連記事をすべて列挙 */}
              {isOpen && (
                <div className="px-4 pb-4">
                  {b.sources.length === 0 ? (
                    <p className="text-sm text-gray-500">関連記事が見つかりませんでした。</p>
                  ) : (
                    <ul className="divide-y">
                      {b.sources
                        .slice() // defensive copy
                        .sort((a, c) => (c.likes ?? 0) - (a.likes ?? 0)) // いいね順に並べ替え
                        .map((s) => (
                          <li key={s.qiitaId} className="py-2 flex items-start justify-between gap-3">
                            <a
                              href={s.url}
                              className="underline text-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {s.title}
                            </a>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300">
                              👍 {s.likes}{s.stocks ? ` / ⭐ ${s.stocks}` : ""}
                            </span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
