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
      {/* ★ 既存の上部コンテンツ（あなたが作ったプライバシー等）はそのまま。
          下の“ミニナビ”は main の先頭に“追加”するだけで、置き換えません。 */}
      <body className="min-h-screen grid grid-rows-[1fr_auto]">
        <main>
          {/* ---- ここが追加した“ミニナビ”（非破壊） ---- */}
          <nav className="w-full sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-5xl px-4 h-12 flex items-center justify-between">
              <Link href="/" className="font-semibold text-green-900">
                えほんの森
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/ranking" className="hover:underline">ランキング</Link>
                <Link href="/posts" className="hover:underline">記事</Link>
                {/* 必要なら：<Link href="/contact" className="hover:underline">お問い合わせ</Link> */}
              </div>
            </div>
          </nav>

          {/* ここに各ページの内容（= 既存の上部リンクや説明も含む）がそのまま描画されます */}
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
