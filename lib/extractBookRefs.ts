@'
export function extractBookRefs(text: string): {
  asin: string | null;
  isbn: string | null;
  titles: string[];
} {
  const s = text ?? "";

  // ASIN（Amazonの10桁）
  const asinMatch = s.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?#]|$)/i);
  const asin = asinMatch ? asinMatch[1].toUpperCase() : null;

  // ISBN（13桁: 978/979 から始まる）
  const isbnMatch = s.match(/\b97[89]\d{10}\b/);
  const isbn = isbnMatch ? isbnMatch[0] : null;

  // 『…』/「…」/《…》で括られたタイトルっぽい文字
  const titleRes = [
    /『([\p{Script=Han}\p{Hiragana}\p{Katakana}0-9A-Za-z・ー !?！？]{2,40})』/gu,
    /「([\p{Script=Han}\p{Hiragana}\p{Katakana}0-9A-Za-z・ー !?！？]{2,40})」/gu,
    /《([\p{Script=Han}\p{Hiragana}\p{Katakana}0-9A-Za-z・ー !?！？]{2,40})》/gu,
  ];
  const titlesSet = new Set<string>();
  for (const re of titleRes) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(s)) !== null) {
      const t = m[1].replace(/[：:].+$/, "").replace(/（[^）]*）$/, "").trim();
      if (t.length >= 2) titlesSet.add(t);
    }
  }

  return { asin, isbn, titles: [...titlesSet] };
}
'@ | Set-Content -Path lib/extractBookRefs.ts -Encoding utf8 -NoNewline
