// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Footer from "../components/Footer";
import Link from "next/link";
import { Geist } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "えほんの森 | 絵本ランキングとレビュー",
  description: "AIが集めた人気絵本ランキング。親子で楽しむ物語の森。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={geistSans.variable}>
      <body className="min-h-screen grid grid-rows-[1fr_auto]">
        <main>
          {/* ---- ミニナビ（常時表示） ---- */}
          <nav className="w-full sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-5xl px-4 h-12 flex items-center justify-between">
              <Link href="/" className="font-semibold text-green-900">
                えほんの森
              </Link>

              {/* 左：主要ナビ */}
              <div className="flex items-center gap-4 text-sm">
                <Link href="/ranking" className="hover:underline">ランキング</Link>
                <Link href="/posts" className="hover:underline">記事</Link>
              </div>

              {/* 右：ポリシー等（常に表示） */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                <Link href="/policy/privacy" className="hover:underline">プライバシー</Link>
                <Link href="/policy/affiliate" className="hover:underline">アフィリエイト表記</Link>
                <Link href="/policy/terms" className="hover:underline">免責・利用規約</Link>
                <Link href="/contact" className="hover:underline">お問い合わせ</Link>
              </div>
            </div>
          </nav>

          {/* 各ページ本文 */}
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
