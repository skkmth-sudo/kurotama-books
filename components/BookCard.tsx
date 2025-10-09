// components/BookCard.tsx
import Link from "next/link";
import { badgeClasses, labelOf } from "@/lib/categories";

type Book = {
  id?: string;
  title: string;
  author?: string;
  price?: number;
  reviews?: number;
  rating?: number;
  category?: string;
  score?: number;
};

export default function BookCard({
  book,
  index,
  showCategory = true,
}: {
  book: Book;
  index: number;
  showCategory?: boolean;
}) {
  const priceJpy =
    typeof book.price === "number"
      ? new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(book.price)
      : undefined;

  const stars =
    typeof book.rating === "number"
      ? "★".repeat(Math.round(book.rating)) + "☆".repeat(5 - Math.round(book.rating))
      : undefined;

  // 🥇🥈🥉 トップ3の見た目
  const rankColors = [
    "bg-yellow-50 border-yellow-200", // 1位
    "bg-gray-50 border-gray-200",     // 2位
    "bg-amber-50 border-amber-200",   // 3位
  ];
  const cardClass = index <= 3 ? `${rankColors[index - 1]} border-2` : "bg-white border";
  const medal = index === 1 ? "🥇" : index === 2 ? "🥈" : index === 3 ? "🥉" : "";

  return (
    <li
      className={`group ${cardClass} rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 flex items-center justify-between gap-4`}
    >
      <div className="min-w-0">
        <div className="text-lg sm:text-xl font-semibold truncate flex items-center gap-2">
          {index}. {book.title} {medal && <span>{medal}</span>}
        </div>
        {book.author && <div className="text-sm text-gray-600 mt-0.5">by {book.author}</div>}

        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
          {typeof book.rating === "number" && (
            <span className="px-2 py-0.5 rounded bg-gray-100">
              {stars} <span className="ml-1 text-gray-500">({book.rating.toFixed(1)})</span>
            </span>
          )}
          {typeof book.reviews === "number" && (
            <span className="px-2 py-0.5 rounded bg-gray-100">レビュー {book.reviews.toLocaleString()}</span>
          )}
          {priceJpy && <span className="px-2 py-0.5 rounded bg-gray-100">{priceJpy}</span>}

          {showCategory && book.category && (
            <Link
              href={`/category/${book.category}`}
              className={`px-2 py-0.5 rounded ring-1 ${badgeClasses(book.category)}`}
              aria-label={`${labelOf(book.category)} カテゴリへ`}
            >
              {labelOf(book.category)}
            </Link>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-xs text-gray-500">スコア</div>
        <div className="text-3xl font-extrabold tabular-nums text-indigo-700">
          {Math.round(book.score ?? 0)}
        </div>
      </div>
    </li>
  );
}
