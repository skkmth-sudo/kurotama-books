// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "森の図書館",
  description: "児童書・絵本のランキングサイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 antialiased">
        {children}
      </body>
    </html>
  );
}
