"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookCover } from "@/components/BookCover";

type Source = { qiitaId: string; url: string; title: string; likes: number; stocks: number };
type BookAgg = {
  id: string; title: string; asin?: string; isbn?: string;
  mentions: number; score: number; totalLikes: number; totalStocks: number;
  sources: Source[];
};

function dedupe(sources: Source[] = []) {
  const seen = new Set<string>(); const out: Source[] = [];
  for (const s of sources) { const k = s.qiitaId || s.url; if (k && !seen.has(k)) { seen.add(k); out.push({...s}); } }
  return out;
}

export default function RankingPage() {
  const [items, setItems] = useState<BookAgg[]>([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/ranking", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        const safe = (j.ranking || []).map((b: BookAgg) => ({ ...b, sources: [...(b.sources ?? [])] }));
        if (!cancelled) setItems(safe);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "読み込みに失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const xs = !q ? items : items.filter(
      (b) => b.title.toLowerCase().includes(q.toLowerCase()) ||
             b.sources.some(s => s.title.toLowerCase().includes(q.toLowerCase()))
    );
    return xs;
  }, [items, q]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">📚 えほんの森 ランキング（👍=Qiita いいね合計）</h1>

      <div className="flex gap-2 mb-6 items-center">
        <input value={q} onChange={(e)=>setQ(e.target.value)} className="border rounded px-3 py-2 w-80" placeholder="タイトル・記事を検索"/>
        <Link href="/posts" className="ml-auto underline text-sm text-blue-700">記事一覧へ</Link>
      </div>

      {loading && <p className="text-gray-500">読み込み中…</p>}
      {error && <div className="p-3 mb-4 border rounded bg-red-50 text-red-700">データ取得に失敗しました：{error}</div>}

      <ul className="space-y-3">
        {filtered.map((b, i) => {
          const isOpen = active === b.id;
          return (
            <li key={b.id} className="border rounded-2xl bg-white shadow-sm">
              <button onClick={()=>setActive(isOpen?null:b.id)} className="w-full text-left p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <BookCover isbn={b.isbn} title={b.title}/>
                  <div>
                    <h2 className="font-semibold text-lg">{i<9?`#0${i+1}`:`#${i+1}`} {b.title}</h2>
                    <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-3">
                      <span>👍 {b.totalLikes}</span>
                      <span>🗂️ 言及 {b.mentions}</span>
                      {b.totalStocks ? <span>⭐ ストック {b.totalStocks}</span> : null}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <a href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(b.title)}`} className="inline-block text-xs px-3 py-1 rounded bg-gray-700 text-white" target="_blank" rel="noopener noreferrer" onClick={(e)=>e.stopPropagation()}>Amazonで探す</a>
                  <span className={`inline-grid place-items-center w-7 h-7 rounded-full border ${isOpen ? "bg-emerald-600 text-white" : "bg-white"}`} aria-hidden>{isOpen ? "−" : "+"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4">
                  {b.sources.length===0 ? <p className="text-sm text-gray-500">関連記事が見つかりませんでした。</p> : (
                    <ul className="divide-y">
                      {dedupe(b.sources).sort((a,c)=>(c.likes??0)-(a.likes??0)).map(s=>(
                        <li key={s.qiitaId||s.url} className="py-2 flex items-start justify-between gap-3">
                          <a href={s.url} className="underline text-sm" target="_blank" rel="noopener noreferrer">{s.title}</a>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300">👍 {s.likes}{s.stocks?` / ⭐ ${s.stocks}`:""}</span>
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
