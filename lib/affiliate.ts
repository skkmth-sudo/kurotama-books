// lib/affiliate.ts
const A_ID = process.env.MOSHIMO_A_ID;
const AMAZON = {
  p: process.env.MOSHIMO_P_ID_AMAZON,
  pc: process.env.MOSHIMO_PC_ID_AMAZON,
  pl: process.env.MOSHIMO_PL_ID_AMAZON,
};
const RAKUTEN = {
  p: process.env.MOSHIMO_P_ID_RAKUTEN,
  pc: process.env.MOSHIMO_PC_ID_RAKUTEN,
  pl: process.env.MOSHIMO_PL_ID_RAKUTEN,
};

// もしも未設定なら元URLを返す（審査前の安全運転）
export function wrapMoshimo(originalUrl: string, store: "amazon" | "rakuten") {
  const S = store === "amazon" ? AMAZON : RAKUTEN;
  const allSet = A_ID && S.p && S.pc && S.pl;
  if (!allSet) return originalUrl;

  const enc = encodeURIComponent(originalUrl);
  return `https://af.moshimo.com/af/c/click?a_id=${A_ID}&p_id=${S.p}&pc_id=${S.pc}&pl_id=${S.pl}&url=${enc}`;
}

export function amazonFromAsin(asin: string) {
  const url = `https://www.amazon.co.jp/dp/${asin}`;
  return wrapMoshimo(url, "amazon");
}
