// lib/buildRanking.ts
export const runtime = "nodejs";

const QIITA_TOKEN = process.env.QIITA_TOKEN;

/** 絵本関連クエリ（広め） */
const TOPIC_QUERIES = [
  "絵本", "読み聞かせ", "児童書", "幼児 絵本", "赤ちゃん 絵本", "知育 絵本",
  "名作 絵本", "ロングセラー 絵本", "ベストセラー 絵本"
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

/** 子ども向け文脈（本文全体で判定用） */
const POSITIVE = ["絵本","えほん","児童","幼児","赤ちゃん","読み聞かせ","保育","未就学","園児"];
const NG       = ["白書","年鑑","統計","論文","参考書","問題集","研究","業務", "仕様", "設計"];

/** “絵本でない”タイトルを弾く強力フィルタ */
const BAN_TITLE =
  /(ログイン|トップページ|管理画面|設定|一覧|検索条件|サンプル|チュートリアル|テンプレ|ダッシュボード|デモ|テスト|アプリ|ページ|API|SQL|AWS|Docker|Laravel|Rails|React|Next\.js|Java|Kotlin|Python|Go|TypeScript|エンジニア|アジャイル|サムライ|アルゴリズム)/i;

/** “絵本らしい”語（タイトル側） */
const MUST_TITLE = /(絵本|えほん|児童|幼児|赤ちゃん|読み聞かせ|図鑑|紙芝居|しかけ絵本)/;

/** 参照抽出 */
const ASIN_RE = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i;
const ISBN_RE = /\b97[89]\d{10}\b/;
/** 日本語対応・環境依存のない括弧抽出（2〜40字） */
const TITLE_RES = [/『([^』\r\n]{2,40})』/g, /「([^」\r\n]{2,40})」/g, /《([^》\r\n]{2,40})》/g];

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

/* ---------------- Google Books で“絵本”検証 ---------------- */

type GBMeta = {
  ok: boolean;
  title?: string;
  isbn?: string;
  categories?: string[];
};

const gbCache = new Map<string, GBMeta>();

async function googleBooksLookupByIsbn(isbn: string): Promise<GBMeta> {
  const key = `isbn:${isbn}`;
  if (gbCache.has(key)) return gbCache.get(key)!;
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&maxResults=1`;
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  const item = j?.items?.[0];
  const cats: string[] = item?.volumeInfo?.categories ?? [];
  const title: string | undefined = item?.volumeInfo?.title;
  const ok = isPictureBookCats(cats);
  const meta = { ok, title, isbn, categories: cats };
  gbCache.set(key, meta);
  return meta;
}

async function googleBooksLookupByTitle(title: string): Promise<GBMeta> {
  const key = `title:${title}`;
  if (gbCache.has(key)) return gbCache.get(key)!;
  const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&langRestrict=ja&maxResults=3`;
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  const items = Array.isArray(j?.items) ? j.items : [];
  let pick: any = null;
  for (const it of items) {
    const cats: string[] = it?.volumeInfo?.categories ?? [];
    if (isPictureBookCats(cats)) { pick = it; break; }
  }
  const cats: string[] = pick?.volumeInfo?.categories ?? [];
  const titleOut: string | undefined = pick?.volumeInfo?.title ?? title;
  const isbn = pick?.volumeInfo?.industryIdentifiers?.find((x: any) => /ISBN_13/.test(x?.type))?.identifier;
  const ok = isPictureBookCats(cats);
  const meta = { ok, title: titleOut, isbn, categories: cats };
  gbCache.set(key, meta);
  return meta;
}

function isPictureBookCats(categories: string[] = []) {
  const joined = categories.join(" / ");
  return /(絵本|児童|児童文学|Children's Books|Picture Books|Baby|Toddler|Juvenile)/i.test(joined);
}

/* ----------------------------------------------------------- */

/** fast: true ならクエリ数と件数を絞って高速に返す */
export async function buildRanking(opts?: { fast?: boolean }): Promise<BookAgg[]> {
  const fast = !!opts?.fast;
  const queries = fast ? TOPIC_QUERIES.slice(0, 3) : TOPIC_QUERIES;
  const perPage = fast ? 10 : 50;

  const bookMap = new Map<string, BookAgg>();

  for (const q of queries) {
    // しきい値を少し上げる
    const query = `(tag:絵本 OR title:${q} OR body:${q}) stocks:>3`;
    const items = await qiitaSearch(query, perPage);

    for (const it of items) {
      const ctx = `${it.title}\n${it.body ?? ""}`;
      if (!looksLikeKidContext(ctx)) continue;

      // タイトル候補抽出
      const titles = extractTitles(ctx).filter(t => !BAN_TITLE.test(t));
      if (titles.length === 0) continue;

      // 参照抽出
      const asin   = ASIN_RE.exec(ctx)?.[1];
      const isbn   = ISBN_RE.exec(ctx)?.[0];

      // ---- Google Books で “絵本” 検証 ----
      let validated = false;
      let norm = titles[0];

      if (isbn) {
        const meta = await googleBooksLookupByIsbn(isbn);
        validated = meta.ok;
        if (meta.title) norm = meta.title;
      } else {
        // ISBN/ASINが無い場合は、見出しに絵本語が入り、かつGBカテゴリで絵本判定
        if (titles.some(t => MUST_TITLE.test(t))) {
          const meta = await googleBooksLookupByTitle(titles[0]);
          validated = meta.ok;
          if (meta.title) norm = meta.title;
        }
      }

      if (!validated) continue; // ← 絵本として検証できないものは除外

      const likes  = it.likes_count  ?? 0;
      const stocks = it.stocks_count ?? 0;

      // 集約キーを作成
      const key = isbn ? `isbn:${isbn}` : `title:${norm}`;

      let node = bookMap.get(key);
      if (!node) {
        node = {
          id: key,
          title: norm,
          asin: asin || undefined,
          isbn: isbn || undefined,
          mentions: 0,
          totalLikes: 0,
          totalStocks: 0,
          score: 0,
          sources: [],
        };
        bookMap.set(key, node);
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

  // 最後に“最低ライン”を課す（言及2回以上 or ISBNあり）
  const arr = [...bookMap.values()].filter(b => b.mentions >= 2 || !!b.isbn);

  return arr.sort((a, b) => b.score - a.score).slice(0, 100);
}
