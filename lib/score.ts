export type Book = {
  id: string;
  title: string;
  author?: string;
  price?: number;
  reviews?: number; // レビュー件数
  rating?: number;  // 平均評価(5点満点)
};

export function computeScore(b: Book): number {
  const rating = b.rating ?? 0;
  const reviews = b.reviews ?? 0;
  const scoreFromRating = Math.max(0, rating - 3.5) * 30;
  const scoreFromReviews = Math.sqrt(reviews) * 2;
  const scoreFromPrice = b.price ? Math.max(0, 5000 - b.price) / 500 : 0;
  return scoreFromRating + scoreFromReviews + scoreFromPrice;
}
