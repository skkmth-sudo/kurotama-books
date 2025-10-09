import type { Metadata } from "next";
import books from "@/data/books.json";
import { computeScore, type Book } from "@/lib/score";
import { labelOf } from "@/lib/categories";
import Link from "next/link";
import BookCard from "@/components/BookCard";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `${labelOf(params.slug)} のランキング`,
    description: `${labelOf(params.slug)}カテゴリの書籍ランキング`,
  };
}

export default function CategoryPage({ params }: Props) {
  const slug = params.slug;
  const filtered = (books as (Book & { category?: string })[])
    .filter((b) => (b.category ?? "").toLowerCase() === slug.toLowerCase())
    .map((b) => ({ ...b, score: computeScore(b) }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">{labelOf(slug)} ランキング</h1>
      <p className="text-sm text-gray-500 mt-1">
        カテゴリ: <code className="px-1 py-0.5 rounded bg-gray-100">{slug}</code>
      </p>

      {filtered.length === 0 ? (
        <p className="mt-6">このカテゴリのデータがまだありません。</p>
      ) : (
        <ol className="mt-6 space-y-3">
          {filtered.map((b, i) => (
            <BookCard key={b.id ?? i} book={b} index={i + 1} showCategory={false} />
          ))}
        </ol>
      )}

      <div className="mt-8">
        <Link href="/ranking" className="underline">← 総合ランキングへ戻る</Link>
      </div>
    </main>
  );
}
