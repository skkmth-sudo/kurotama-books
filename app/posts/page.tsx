// app/posts/page.tsx
import Link from "next/link";

export default function PostsPage() {
  const posts = [
    { slug: "2025-10-top-picture-books", title: "2025年10月の人気絵本まとめ" },
    { slug: "how-we-make-the-ranking", title: "ランキングの作り方（Qiita言及ベース）" },
    { slug: "read-aloud-beginners", title: "読み聞かせのコツ：初めての5冊" },
    { slug: "animal-picture-books", title: "動物テーマの絵本おすすめ10選" },
    { slug: "science-picture-books", title: "科学系絵本：低学年から楽しめる入門" },
  ];

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">記事一覧</h1>
      <ul className="list-disc pl-5 space-y-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/posts/${p.slug}`} className="text-blue-700 underline">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
