// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t py-6 text-sm text-gray-500">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-center">
        <p>© {new Date().getFullYear()} えほんの森</p>
      </div>
    </footer>
  );
}
