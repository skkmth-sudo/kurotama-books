import { extractBookRefs } from "./extractBookRefs";

const QIITA_TOKEN = process.env.QIITA_TOKEN;

// 絵本寄りのクエリ
const TOPIC_QUERIES = [
  "絵本", "読み聞かせ", "児童書", "幼児 絵本", "赤ちゃん 絵本",
  "知育 絵本", "名作 絵本", "ロングセラー 絵本", "ベストセラー 絵本"
];

type QiitaItem = {
  id: string; title: string; url: string; body?: string;
  likes_count?: number; stocks_count?: number;
};

// ここが絞り込みの肝
const POSITIVE = /(絵本|児童書|児童|幼児|赤ちゃん|読み聞かせ|寝かしつけ|保育園|幼稚園|年少|年中|年長|こども|子ども|小学生)/i;
const BAN_WORDS =
  /(ログイン|トップページ|管理画面|設定|一覧|検索条件|ダッシュボード|テンプレ|サンプル|チュートリアル|API|HTTP|HTTPS|TCP|IP|DNS|SSL|TLS|ネットワーク|セキュリティ|ITパスポート|情報処理|プログラミング|Git|GitHub|CI|CD|AWS|GCP|Azure|Docker|Kubernetes|Linux|Windows|Mac|React|Next\.js|Vue|Rails|Laravel|Django|Python|Go|TypeScript|Kotlin|Java|Android|iPhone|スマホアプリ|エンジニア|アルゴリズム|設計|サーバ)/i;

export type Source = { qiitaId: string; url: string; title: string; likes: number; stocks: number };
export type BookAgg = {
  id: string;                 // isbn:xxxx or asin:XXXX
  title: string;
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

/** ISBN/ASIN が本文にある & 絵本系コンテキストの時だけ集計 */
export async function buildRanking(opts?: { pages?: number; perPage?: number }): Promise<BookAgg[]> {
  const pages = Math.max(1, Math.min(3, opts?.pages ?? 2));
  const perPage = Math.max(10, Math.min(50, opts?.perPage ?? 30));

  const bookMap = new Map<string, BookAgg>();

  for (const q of TOPIC_QUERIES) {
    const query = `(tag:絵本 OR tag:児童書 OR title:${q} OR body:${q}) stocks:>1`;

    for (let page = 1; page <= pages; page++) {
      const items = await qiitaSearch(query, page, perPage);

      for (const it of items) {
        const ctx = `${it.title}\n${it.body ?? ""}`;

        // 技術・UI系は除外、絵本の肯定語が本文に無ければ除外
        if (BAN_WORDS.test(ctx) || !POSITIVE.test(ctx)) continue;

        const { asin, isbn, titles } = extractBookRefs(ctx);
        if (!asin && !isbn) continue; // ISBN/ASIN必須

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
        node.score = node.totalLikes + Math.round(node.totalStocks * 0.3);

        if (!node.sources.some(s => s.qiitaId === it.id)) {
          node.sources.push({ qiitaId: it.id, url: it.url, title: it.title, likes, stocks });
        }
      }
    }
  }

  return [...bookMap.values()]
    .filter(b => b.mentions >= 1) // 件数が少なければ 1、増えたら 2 に上げる
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
}