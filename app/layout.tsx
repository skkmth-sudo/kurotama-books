// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Footer from "../components/Footer";
import Link from "next/link"; // ← 追加
import { Geist } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "えほんの森 | 絵本ランキングとレビュー",
  description: "AIが集めた人気絵本ランキング。親子で楽しむ物語の森。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={geistSans.variable}>
      <body className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        {/* ここが簡易ナビ（Headerコンポーネント不要） */}
        <nav className="w-full border-b bg-white/80">
          <div className="mx-auto max-w-5xl px-4 h-12 flex items-center justify-between">
            <Link href="/" className="font-semibold text-green-900">えほんの森</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/ranking" className="hover:underline">ランキング</Link>
              <Link href="/posts" className="hover:underline">記事</Link>
              {/* 必要なら：<Link href="/contact">お問い合わせ</Link> */}
            </div>
          </div>
        </nav>

        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
