import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "books.googleusercontent.com" }, // Google Books
      { protocol: "https", hostname: "lh3.googleusercontent.com" },   // 場合によってこちらも使われる
    ],
  },
};

export default nextConfig;
