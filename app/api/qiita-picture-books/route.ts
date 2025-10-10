import { NextResponse } from "next/server";

const QIITA_TOKEN = process.env.QIITA_TOKEN;

type QiitaItem = {
  id: string;
  title: string;
  url: string;
  likes_count?: number;
  stocks_count?: number;
  body?: string;
};

type RankedBook = {
  title: string;
  mentions: number;
  score: number;
  sources: { qiitaId: string; url: string }[];
};

const POSITIVE_HINTS = [
  "絵本", "えほん", "児童", "幼児", "子ども", "こども", "読み聞かせ",
  "ピクチャーブック", "picture book"
];

const NG_WORDS = [
  "白書","年鑑","統計","研究","論文","実践","入門","教科書","参考書","問題集",
  "検定","国家試験","資格","ビジネス","投資","経営","マーケティング","心理学",
  "教育学","看護","医学","技術","プログラミング","設計","アーキテクチャ",
  "ガイドライン","ハンドブック","辞典","事典","全集","選集","白地図"
];

function extractTitleCandidates(text: string): string[] {
  if (!text) return [];
  const patterns = [/『([^』]{2,60})』/g, /「([^」]{2,60})」/g, /《([^》]{2,60})》/g];
  const out = new Set<string>();
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) {
      let cand = m[1].trim();
      // 末尾の副題やシリーズ括弧を軽く削る
      cand = cand.replace(/[：:].+$/, "").replace(/（[^）]*）$/, "").trim();
      // ノイズ除去
      if (!/[一-龥ぁ-んァ-ヶA-Za-z0-9]/.test(cand)) continue;
      if (cand.length < 2 || cand.length > 60) continue;
      out.add(cand);
    }
  }
  return [...out];
}

function looksLikePictureBookContext(text: string): boolean {
  const t = text.toLowerCase();
  const hasPositive = POSITIVE_HINTS.some(w => t.includes(w.toLowerCase()));
  const hasNG = NG_WORDS.some(w => t.includes(w.toLowerCase()));
  return hasPositive && !hasNG;
}

async function fetchQiitaItems(query: string): Promise<QiitaItem[]> {
  const q = encodeURIComponent(query);
  const url = `https://qiita.com/api/v2/items?per_page=50&query=${q}`;
  const res = await fetch(url, {
    headers: QIITA_TOKEN ? { Authorization: `Bearer ${QIITA_TOKEN}` } : {},
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Qiita API error: ${res.status}`);
  return (await res.json()) as QiitaItem[];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "絵本").trim();

    // 絵本寄せのクエリ。stocks/likes が少しでもある記事を優先
    const baseQuery = `(tag:絵本 OR title:${q} OR body:${q}) stocks:>2`;

    const items = await fetchQiitaItems(baseQuery);

    // 集計
    const bookMap = new Map<string, RankedBook>();

    for (const it of items) {
      const ctx = `${it.title}\n${it.body ?? ""}`;
      if (!looksLikePictureBookContext(ctx)) continue;

      const cands = extractTitleCandidates(ctx);
      const weight = Math.log1p((it.stocks_count ?? 0) + (it.likes_count ?? 0));

      for (const cand of cands) {
        const key = cand; // 外部APIを使わないので cand をそのままキーに
        const prev = bookMap.get(key);
        if (prev) {
          prev.mentions += 1;
          prev.score += 1 + weight;
          prev.sources.push({ qiitaId: it.id, url: it.url });
        } else {
          bookMap.set(key, {
            title: cand,
            mentions: 1,
            score: 1 + weight,
            sources: [{ qiitaId: it.id, url: it.url }],
          });
        }
      }
    }

    const ranking = [...bookMap.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    return NextResponse.json({ count: ranking.length, ranking });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
