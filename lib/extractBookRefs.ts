// 本文/タイトルから ASIN・ISBN・候補タイトルを抜き出す（安全な正規表現だけ）
export type Extracted = {
  asin?: string | null;
  isbn?: string | null;
  titles: string[]; // 『…』/「…」/《…》
};

const ASIN_RE = /(?:amazon\.[a-z.]+\/(?:gp\/product|dp)\/|asin=)([A-Z0-9]{10})/i;
const ISBN_RE = /\b97[89]\d{10}\b/g;

const TITLE_RES = [
  /『([^』\r\n]{2,40})』/g,
  /「([^」\r\n]{2,40})」/g,
  /《([^》\r\n]{2,40})》/g,
];

function normTitle(s: string) {
  return s.replace(/[：:].+$/, "").replace(/（[^）]*）$/, "").trim();
}

export function extractBookRefs(text: string): Extracted {
  const all = text ?? "";
  const asin = ASIN_RE.exec(all)?.[1] ?? null;

  let isbn: string | null = null;
  const g = all.match(ISBN_RE);
  if (g && g.length) isbn = g[0];

  const titlesSet = new Set<string>();
  for (const re of TITLE_RES) {
    let m;
    while ((m = re.exec(all)) !== null) titlesSet.add(normTitle(m[1]));
  }
  return { asin, isbn, titles: [...titlesSet] };
}

