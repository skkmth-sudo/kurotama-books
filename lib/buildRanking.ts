export const runtime = "nodejs";

import { extractBookRefs } from "./extractBookRefs";

const QIITA_TOKEN = process.env.QIITA_TOKEN;

// 絵本関連クエリ（広め）
const TOPIC_QUERIES = [
  "絵本", "読み聞かせ", "児童書", "幼児 絵本", "赤ちゃん 絵本",
  "知育 絵本", "名作 絵本", "ロングセラー 絵本", "ベストセラー 絵本"
];

type QiitaItem = {
  id: string; title: string; url: string; body?: string;
  likes_count?: number; stocks_count?: number;
};

// UI系ノイズ語（タイトル/本文の周辺にあれば除外）
const BAN_WORDS =
  /(ログイン|トップページ|管理画面|設定|一覧|検索条件|ダッシュボード|テンプレ|サンプル|チュートリアル|API|SQL|AWS|Docker|React|Next\.js|Rails|Laravel|Python|Go|TypeScript|Kotlin|Java|エンジニア|設計|アルゴリズム)/i;

export type Source = { qiitaId: string; url: string; title: string; likes: number; stocks: number };
export type BookAgg = {
  id: string;                 // isbn:xxxx or asin:XXXX or title:xxx（原則 isbn/asin）
  title: string;              // 本の推定タイトル（ISBNがあれば後述API等で整える余地）
  asin?: string; isbn?: string;
  mentions: number;
  totalLikes: number;
  totalStocks: number;
  score: number;
  sources: Source[];
};

async function qiitaSearch(query: string, page: number, perPage: number): Promise<QiitaItem[]> {
  const url = `https://qiita.com/api/v2/items?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
  const headers = QIITA_TOKEN ? { Authorization: `Bearer ${QIITA_TOKEN}` } : {};
  const r = await fetch(url, { headers, cache: "no-store" });
  if (!r.ok) throw new Error(`Qiita ${r.status} ${await r.text()}`);
  return r.json();
}

/** TechBookRank 方式：ASIN/ISBN がある記事だけ集計。ページは控えめに複数回。 */
export async function buildRanking(opts?: { pages?: number; perPage?: number }): Promise<BookAgg[]> {
  const pages = Math.max(1, Math.min(4, opts?.pages ?? 2));   // クエリごと最大2ページ
  const perPage = Math.max(10, Math.min(100, opts?.perPage ?? 50));

  const bookMap = new Map<string, BookAgg>();

  for (const q of TOPIC_QUERIES) {
    const query = `(tag:絵本 OR title:${q} OR body:${q}) stocks:>1`;

    for (let page = 1; page <= pages; page++) {
      const items = await qiitaSearch(query, page, perPage);

      for (const it of items) {
        const ctx = `${it.title}\n${it.body ?? ""}`;
        if (BAN_WORDS.test(ctx)) continue;                 // UI系除外

        const { asin, isbn, titles } = extractBookRefs(ctx);
        if (!asin && !isbn) continue;                       // ★ 明示リンク必須

        const key = isbn ? `isbn:${isbn}` : `asin:${asin}`;
        const likes  = it.likes_count  ?? 0;
        const stocks = it.stocks_count ?? 0;
        const title  = (titles[0] ?? it.title).trim();

        let node = bookMap.get(key);
        if (!node) {
          node = {
            id: key, title,
            asin: asin ?? undefined, isbn: isbn ?? undefined,
            mentions: 0, totalLikes: 0, totalStocks: 0, score: 0, sources: [],
          };
          bookMap.set(key, node);
        }
        node.mentions += 1;
        node.totalLikes += likes;
        node.totalStocks += stocks;
        node.score = node.totalLikes + Math.round(node.totalStocks * 0.3); // Stocksを軽く加点

        if (!node.sources.some(s => s.qiitaId === it.id)) {
          node.sources.push({ qiitaId: it.id, url: it.url, title: it.title, likes, stocks });
        }
      }
    }
  }

  // 偶発ヒットを除去（言及2回以上）
  return [...bookMap.values()]
    .filter(b => b.mentions >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
}
