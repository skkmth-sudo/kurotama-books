"use client";

import { useEffect, useState } from "react";

type RankedBook = {
  title: string;
  mentions: number;
  score: number;
  sources: { qiitaId: string; url: string }[];
};

export default function RankingPage() {
  const [items, setItems] = useState<RankedBook[]>([]);
  const [query, setQuery] = useState("絵本");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData(q: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/qiita-picture-books?q=${encodeURIComponent(q)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const received: RankedBook[] = data.ranking ?? [];
      setItems(received);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          🌲 人気児童書ランキング（Qiita言及ベース）
        </span>
      </h1>

      {/* プリセット */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => {
              setQuery(p);
              fetchData(p);
            }}
            className="rounded-full border border-green-300 bg-white/80 px-3 py-1 text-sm text-green-700 hover:bg-green-50"
          >
            #{p}
          </button>
        ))}
      </div>

      {/* 検索 */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="テーマを検索（例：絵本・冒険・動物・科学）"
          className="border border-yellow-300 rounded-full px-4 py-2 w-72 focus:ring-2 focus:ring-amber-300 outline-none"
        />
        <button
          onClick={() => fetchData(query)}
          disabled={loading}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow"
        >
          {loading ? "よみこみ中..." : "検索"}
        </button>

        <button
          onClick={() => fetchData(query)} // API側で最大50件返す設計
          disabled={loading}
          className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow"
        >
          いっぱい見る（最大50件）
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-center mb-4">取得に失敗しました：{error}</p>
      )}

      {/* カード一覧 */}
      <div className="space-y-4">
        {items.map((b, idx) => {
          const firstSource = b.sources?.[0]?.url;
          const otherCount = Math.max(0, (b.sources?.length ?? 0) - 1);
          return (
            <div
              key={`${b.title}-${idx}`}
              className={`rounded-3xl shadow-md border p-4 transition hover:-translate-y-1 hover:shadow-lg ${pastelColors[idx % pastelColors.length]}`}
            >
              <div className="flex gap-4">
                {/* アイコン（表紙は使わない） */}
                <div className="w-24 h-24 flex-shrink-0 grid place-items-center rounded-xl border border-amber-200 bg-white text-4xl">
                  {idx === 0 ? "🌳" : idx === 1 ? "🍃" : idx === 2 ? "📗" : "📖"}
                </div>

                {/* 本文 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-lg text-green-900 leading-snug">
                      <a
                        href={firstSource ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        title={firstSource ? "Qiita出典へ" : undefined}
                      >
                        {b.title}
                      </a>
                    </h2>

                    {/* 言及バッジ */}
                    <span
                      className="shrink-0 inline-flex items-center rounded-full bg-emerald-600 text-white px-3 py-1 text-sm font-bold shadow"
                      title="Qiita上の言及スコア"
                    >
                      🔎 言及 {b.mentions}
                    </span>
                  </div>

                  {/* 出典リンク（最大3） */}
                  {!!b.sources?.length && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="mr-2 text-gray-600">出典:</span>
                      {b.sources.slice(0, 3).map((s, i) => (
                        <a
                          key={s.qiitaId}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline mr-3"
                        >
                          Qiita記事{i + 1}
                        </a>
                      ))}
                      {otherCount > 0 && (
                        <span className="text-gray-500">他 {otherCount} 件</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && !loading && (
          <p className="text-center text-gray-500">結果が見つかりませんでした📖</p>
        )}
      </div>
    </main>
  );
}
