export function extractBookRefs(text: string): {
  asin: string | null;
  isbn: string | null;
  titles: string[];
} {
  const src = text ?? "";
  const titles = new Set<string>();
  let asin: string | null = null;
  const asinUrlRe = /amazon\.(?:co\.jp|com)\/(?:[^/]+\/)?(?:dp|gp\/product)\/([A-Z0-9]{10})/i;
  const mAsinUrl = asinUrlRe.exec(src);
  if (mAsinUrl) { asin = mAsinUrl[1].toUpperCase(); }
  else {
    const mAsinBare = /\b([A-Z0-9]{10})\b/.exec(src);
    if (mAsinBare) asin = mAsinBare[1].toUpperCase();
  }
  let isbn: string | null = null;
  const mIsbnRaw = src.match(/\b97[89][\d-]{10,16}\b|\b[\d-]{9,13}X\b/gi)?.[0] ?? null;
  if (mIsbnRaw) {
    const digits = mIsbnRaw.replace(/[^0-9X]/gi, "");
    if (/^\d{13}$/.test(digits)) isbn = digits;
    else if (/^\d{9}[\dX]$/i.test(digits)) {
      const body = "978" + digits.slice(0, 9);
      const sum = body.split("").reduce((s, d, i) => s + (i % 2 ? 3 : 1) * parseInt(d, 10), 0);
      const check = (10 - (sum % 10)) % 10;
      isbn = body + String(check);
    }
  }
  const quoteRes = [/『([^』]{2,60})』/g, /「([^」]{2,60})」/g, /《([^》]{2,60})》/g];
  for (const re of quoteRes) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const cleaned = m[1].replace(/[：:].+$/, "").replace(/（[^）]*）$/, "").trim();
      if (cleaned) titles.add(cleaned);
    }
  }
  return { asin, isbn, titles: [...titles] };
}
