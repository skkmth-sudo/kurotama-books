"use client";
import Image from "next/image";

export function BookCover({ isbn, title, className="w-16 h-20 rounded-md bg-gray-100 border" }:{
  isbn?: string; title: string; className?: string;
}) {
  if (!isbn) return <div className={className} aria-label="no cover" />;
  const url = `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-M.jpg`;
  return (
    <Image src={url} alt={`${title} の表紙`} width={64} height={80} className={className+" object-cover"} unoptimized/>
  );
}
