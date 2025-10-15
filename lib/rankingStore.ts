import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

// Vercel でもローカルでも書ける一時ファイル場所
const FILE = path.join(os.tmpdir(), "ranking.json");

export type Source = { qiitaId: string; url: string; title: string; likes: number; stocks: number };
export type BookAgg = {
  id: string; title: string; asin?: string; isbn?: string;
  mentions: number; score: number; totalLikes: number; totalStocks: number;
  sources: Source[];
};

export async function readRanking(): Promise<BookAgg[]> {
  try {
    const text = await fs.readFile(FILE, "utf8");
    const json = JSON.parse(text);
    return Array.isArray(json?.ranking) ? json.ranking : [];
  } catch {
    return [];
  }
}

export async function writeRanking(ranking: BookAgg[]): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify({ ranking }), "utf8");
}
