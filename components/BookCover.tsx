"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export function BookCover({
  isbn,
  title,
  className = "w-16 h-20 rounded-md bg-gray-100 border"
}: { isbn?: string; title: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams();
      if (isbn) params.set("isbn", isbn);
      if (title) params.set("title", title);
      const r = await fetch(`/api/cover?${params.toString()}`);
      const j = await r.json();
      if (!cancelled) setUrl(j.url ?? null);
    })();
    return () => { cancelled = true; };
  }, [isbn, title]);

  // プレースホルダー（灰ボックス）
  if (!url) return <div className={className} aria-label="no cover" />;

  return (
    <Image
      src={url}
      alt={`${title} の表紙`}
      width={64}
      height={80}
      className={className + " object-cover"}
      unoptimized
    />
  );
}
