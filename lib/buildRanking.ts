export const runtime = "nodejs";

const QIITA_TOKEN = process.env.QIITA_TOKEN;

const TOPIC_QUERIES = [
  "絵本", "読み聞かせ", "児童書", "育児 絵本", "科学 絵本", "動物 絵本",
];

type QiitaItem = {
  id: string; title: string; url: string;
  likes_count?: number; stocks_count?: number; body?: string;
};

export type Source = { qiitaId: string; url: string; title: string; likes: number; stocks: number };
export type BookAgg = {
  id: string; title: string; asin?: string; isbn?: string;
  mentions: number; score: number; totalLikes: number; totalStocks: number;
  sources: Source[];
};

const POSITIVE = ["絵本","えほん","児童","幼児","子ども","こども","読み聞かせ"];
const NG       = ["白書","年鑑","統計","研究","論文","入門","教科書","参考書","問題集","ビジネス","投資"];

const ASIN_RE   = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i;
const ISBN_RE   = /\b97[89]\d{10}\b/;
const TITLE_RES = [/『([^』]{2,60})』/g, /「([^」]{2,60})」/g, /《([^》]{2,60})》/g];

function normTitle(s: string) {
  return s.replace(/[：:].+$/, "").replace(/（[^）]*）$/, "").trim();
}
function extractTitles(text: string) {
  const out = new Set<string>();
  for (const re of TITLE_RES) {
    let m; while ((m = re.exec(text)) !== null) out.add(normTitle(m[1]));
  }
  return [...out];
}
function looksLikeKidContext(t: string) {
  const low = t.toLowerCase();
  const hasPos = POSITIVE.some(w => low.includes(w.toLowerCase()));
  const hasNg  = NG.some(w => low.includes(w.toLowerCase()));
  return hasPos && !hasNg;
}

async function qiitaSearch(query: string, perPage: number): Promise<QiitaItem[]> {
  const url = `https://qiita.com/api/v2/items?per_page=${perPage}&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: QIITA_TOKEN ? { Authorization: `Bearer ${QIITA_TOKEN}` } : {},
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Qiita ${res.status}`);
  return res.json();
}

/** fast: true ならクエリ数と件数を絞って高速に返す */
export async function buildRanking(opts?: { fast?: boolean }): Promise<BookAgg[]> {
  const fast = !!opts?.fast;
  const queries = fast ? TOPIC_QUERIES.slice(0, 3) : TOPIC_QUERIES;
  const perPage = fast ? 10 : 50;

  const bookMap = new Map<string, BookAgg>();

  for (const q of queries) {
    const query = `(tag:絵本 OR title:${q} OR body:${q}) stocks:>1`;
    const items = await qiitaSearch(query, perPage);

    for (const it of items) {
      const ctx = `${it.title}\n${it.body ?? ""}`;
      if (!looksLikeKidContext(ctx)) continue;

      const asin   = ASIN_RE.exec(ctx)?.[1];
      const isbn   = ISBN_RE.exec(ctx)?.[0];
      const titles = extractTitles(ctx);

      const keys: string[] = [];
      if (isbn) keys.push(`isbn:${isbn}`);
      if (asin) keys.push(`asin:${asin}`);
      for (const t of titles) keys.push(`title:${t}`);
      if (keys.length === 0) continue;

      const likes  = it.likes_count  ?? 0;
      const stocks = it.stocks_count ?? 0;

      for (const k of keys) {
        let node = bookMap.get(k);
        if (!node) {
          node = {
            id: k,
            title: k.startsWith("title:") ? k.slice(6) : (titles[0] ?? "（不明）"),
            asin: asin || undefined,
            isbn: isbn || undefined,
            mentions: 0,
            totalLikes: 0,
            totalStocks: 0,
            score: 0,
            sources: [],
          };
          bookMap.set(k, node);
        }
        node.mentions += 1;
        node.totalLikes += likes;
        node.totalStocks += stocks;
        node.score = node.totalLikes;

        if (!node.sources.some(s => s.qiitaId === it.id)) {
          node.sources.push({ qiitaId: it.id, url: it.url, title: it.title, likes, stocks });
        }
      }
    }
  }

  return [...bookMap.values()].sort((a, b) => b.score - a.score).slice(0, 100);
}
