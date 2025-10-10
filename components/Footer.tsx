// components/Footer.tsx
// 'use client'; // クリック処理やフックがあるときだけ有効化

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t py-6 text-sm text-gray-500">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
        <p>© {new Date().getFullYear()} えほんの森</p>
        <nav className="flex gap-4">
          <Link href="/about" className="hover:underline">
            このサイトについて
          </Link>
          <Link href="/privacy" className="hover:underline">
            プライバシー
          </Link>
          <a
            href="https://github.com/skkmth-sudo/ehonnomori"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
