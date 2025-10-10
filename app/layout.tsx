// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "えほんの森",
  description: "児童書・絵本のランキングサイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-amber-50 antialiased`}
      >
        {/* ヘッダー */}
        <header className="w-full bg-white/70 backdrop-blur border-b border-green-100">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/ranking" className="text-lg font-bold text-green-800">
              🌲 えほんの森
            </Link>
            <nav className="flex gap-5 text-sm text-gray-700">
              <Link href="/ranking" className="hover:underline">ランキング</Link>
              <Link href="/media" className="hover:underline">媒体情報</Link>
              <Link href="/policy/affiliate" className="hover:underline">アフィリエイト</Link>
              <Link href="/policy/privacy" className="hover:underline">プライバシー</Link>
              <Link href="/contact" className="hover:underline">お問い合わせ</Link>
            </nav>
          </div>
        </header>

        {/* メイン */}
        <main className="flex-1">
          {children}
        </main>

        {/* フッター */}
        <Footer />
      </body>
    </html>
  );
}
