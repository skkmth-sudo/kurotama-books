// app/contact/page.tsx
"use client";
import { useState, useMemo } from "react";

export default function ContactPage() {
  const CONTACT_TO = "yourname@example.com"; // ←受信メールアドレスを変更！

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [topic, setTopic] = useState("ご意見・ご要望");
  const [msg, setMsg] = useState("");

  const isValid = name && /\S+@\S+\.\S+/.test(mail) && msg.length >= 10;

  const mailto = useMemo(() => {
    const subject = `【森の図書館】${topic}`;
    const body = [
      `お名前: ${name}`,
      `メール: ${mail}`,
      "",
      msg,
      "",
      "---",
      "※ このメールは森の図書館 お問い合わせフォームから送信されました。",
    ].join("\n");
    return `mailto:${CONTACT_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [name, mail, topic, msg]);

  return (
    <main className="max-w-xl mx-auto px-6 py-12 text-gray-800">
      <div className="bg-gradient-to-r from-amber-50 to-green-50 rounded-3xl p-6 shadow border border-green-100 mb-10">
        <h1 className="text-3xl font-extrabold text-green-900 mb-1">✉️ お問い合わせ</h1>
        <p className="text-sm text-gray-600">
          内容を入力すると、メールアプリが起動します。
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">お名前</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-300 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">メールアドレス</label>
          <input
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-300 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">件名</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-300 outline-none"
          >
            <option>ご意見・ご要望</option>
            <option>誤りのご指摘</option>
            <option>掲載・タイアップのご相談</option>
            <option>その他のお問い合わせ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">お問い合わせ内容</label>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="できるだけ具体的にご記入ください（10文字以上）"
            className="w-full border rounded-xl px-3 py-2 h-40 resize-y focus:ring-2 focus:ring-emerald-300 outline-none"
          />
        </div>

        <div className="pt-2 flex items-center gap-3">
          <a
            href={isValid ? mailto : undefined}
            onClick={(e) => {
              if (!isValid) e.preventDefault();
            }}
            className={`px-5 py-2 rounded-full text-white shadow ${
              isValid
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            メールを開く
          </a>
          <span className="text-xs text-gray-500">
            ※ メールアプリが起動します。内容を確認して送信してください。
          </span>
        </div>
      </form>

      <div className="mt-10 text-xs text-gray-500">
        <p>
          ご入力いただいた情報はお問い合わせ対応のみに使用します。
          詳細は{" "}
          <a href="/policy/privacy" className="underline text-green-700 hover:text-green-900">
            プライバシーポリシー
          </a>{" "}
          をご覧ください。
        </p>
      </div>
    </main>
  );
}
