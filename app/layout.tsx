// app/layout.tsx もしくは src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "森の図書館｜児童書ランキング",
  description: "絵本や児童書の人気・注目作を紹介する個人メディア『森の図書館』",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 共通ヘッダー */}
        <header className="border-b bg-green-50/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
            <Link href="/" className="text-xl font-bold text-green-800">
              🌲 森の図書館
            </Link>
            <nav className="flex gap-4 text-sm text-green-700">
              <Link href="/ranking" className="hover:underline">ランキング</Link>
              <Link href="/category/ehon" className="hover:underline">絵本</Link>
              <Link href="/category/science" className="hover:underline">科学</Link>
              <Link href="/media" className="hover:underline">媒体情報</Link>
            </nav>
          </div>
        </header>

        {/* メイン。固定フッターと重ならないよう下余白を確保 */}
        <main className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 pb-28">
          {children}
        </main>

        {/* 固定フッター（常に画面下） */}
        <footer className="fixed bottom-0 left-0 w-full border-t bg-green-50/90 backdrop-blur-sm z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 text-sm text-gray-600 flex flex-wrap gap-4 justify-center">
            <a className="underline" href="/media">媒体情報</a>
            <a className="underline" href="/policy/affiliate">アフィリエイトポリシー</a>
            <a className="underline" href="/policy/privacy">プライバシーポリシー</a>
            <a className="underline" href="/contact">お問い合わせ</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "森の図書館｜児童書ランキング",
  description: "絵本や児童書の人気・注目作を紹介する個人メディア『森の図書館』",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 共通ヘッダー */}
        <header className="border-b bg-green-50/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
            <Link href="/" className="text-xl font-bold text-green-800">
              🌲 森の図書館
            </Link>
            <nav className="flex gap-4 text-sm text-green-700">
              <Link href="/ranking" className="hover:underline">ランキング</Link>
              <Link href="/category/ehon" className="hover:underline">絵本</Link>
              <Link href="/category/science" className="hover:underline">科学</Link>
              <Link href="/media" className="hover:underline">媒体情報</Link>
            </nav>
          </div>
        </header>

        {/* 下に固定フッターが重ならないよう余白を確保 */}
        <main className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 pb-32">
          {children}
        </main>

        {/* 固定フッター（超高 z-index, 半透明, 影付き） */}
        <footer
          className="
            fixed bottom-0 left-0 w-full
            border-t bg-green-50/95 backdrop-blur-sm shadow-lg
            z-[9999]
          "
          style={{ pointerEvents: "auto" }}
        >
          <div className="max-w-5xl mx-auto px-6 py-4 text-sm text-gray-700 flex flex-wrap gap-4 justify-center">
            <a className="underline" href="/media">媒体情報</a>
            <a className="underline" href="/policy/affiliate">アフィリエイトポリシー</a>
            <a className="underline" href="/policy/privacy">プライバシーポリシー</a>
            <a className="underline" href="/contact">お問い合わせ</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
