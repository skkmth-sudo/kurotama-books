// app/api/rebuild/route.ts
import { NextResponse } from "next/server";

const QIITA_TOKEN = process.env.QIITA_TOKEN;

// ---- 1) 収集設定（カテゴリやクエリは自由に増やせる）
const TOPIC_QUERIES = [
  "絵本", "読み聞かせ", "児童書", "育児 絵本", "科学 絵本", "動物 絵本"
];

type QiitaItem = {
  id: string; title: string; url: string;
  likes_count?: number; stocks_count?: number; body?: string;
};

type BookAgg = {
  id: string;                    // ISBN13 or ASIN or normalized title
  title: string;                 // 書名
  asin?: string; isbn?: string;
  mentions: number;
  score: number;
  sources: { qiitaId: string; url: string; title: string }[];
};

const POSITIVE = ["絵本","えほん","児童","幼児","子ども","こども","読み聞かせ"];
const NG = ["白書","年鑑","統計","研究","論文","入門","教科書","参考書","問題集","ビジネス","投資"];

const ASIN_RE = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i;
const ISBN_RE = /\b97[89]\d{10}\b/; // 簡易ISBN13

const titleMarks = [/『([^』]{2,60})』/g, /「([^」]{2,60})」/g, /《([^》]{2,60})》/g];

function normTitle(s: string) {
  return s.replace(/[：:].+$/, "").replace(/（[^）]*）$/, "").trim();
}
function extractTitles(text: string) {
  const out = new Set<string>();
  for (const re of titleMarks) {
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

async function qiitaSearch(query: string): Promise<QiitaItem[]> {
  const url = `https://qiita.com/api/v2/items?per_page=50&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: QIITA_TOKEN ? { Authorization: `Bearer ${QIITA_TOKEN}` } : {},
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Qiita ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const bookMap = new Map<string, BookAgg>();

    for (const q of TOPIC_QUERIES) {
      const query = `(tag:絵本 OR title:${q} OR body:${q}) stocks:>1`;
      const items = await qiitaSearch(query);

      for (const it of items) {
        const ctx = `${it.title}\n${it.body ?? ""}`;
        if (!looksLikeKidContext(ctx)) continue;

        const asin = ASIN_RE.exec(ctx)?.[1];
        const isbn = ISBN_RE.exec(ctx)?.[0];
        const titles = extractTitles(ctx);
        const keys: string[] = [];

        if (isbn) keys.push(`isbn:${isbn}`);
        if (asin) keys.push(`asin:${asin}`);
        for (const t of titles) keys.push(`title:${t}`);

        if (keys.length === 0) continue; // 書籍候補が拾えなかった

        const weight = Math.log1p((it.stocks_count ?? 0) + (it.likes_count ?? 0));

        for (const k of keys) {
          const existing = bookMap.get(k);
          if (existing) {
            existing.mentions += 1;
            existing.score += 1 + weight;
            existing.sources.push({ qiitaId: it.id, url: it.url, title: it.title });
          } else {
            bookMap.set(k, {
              id: k,
              title: k.startsWith("title:") ? k.slice(6) : (titles[0] ?? "（不明）"),
              asin: asin || undefined,
              isbn: isbn || undefined,
              mentions: 1,
              score: 1 + weight,
              sources: [{ qiitaId: it.id, url: it.url, title: it.title }],
            });
          }
        }
      }
    }

    const ranking = [...bookMap.values()]
      .sort((a,b) => b.score - a.score)
      .slice(0, 100);

    return NextResponse.json({ generatedAt: Date.now(), count: ranking.length, ranking });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
