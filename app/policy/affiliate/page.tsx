// app/policy/affiliate/page.tsx
export const metadata = {
    title: "アフィリエイトポリシー | えほんの森",
    description:
      "当サイト「えほんの森」では、アフィリエイトプログラムを利用し、読者の皆様に安心してご利用いただけるよう明確な方針を定めています。",
  };
  
  export default function AffiliatePolicyPage() {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
        {/* 見出し */}
        <div className="bg-gradient-to-r from-amber-50 to-green-50 rounded-3xl p-6 shadow-sm border border-amber-100 mb-10">
          <h1 className="text-3xl font-extrabold text-green-900 mb-2 flex items-center gap-2">
            🌲 アフィリエイトポリシー
          </h1>
          <p className="text-sm text-gray-600">
            最終更新日：2025年10月9日 ｜ えほんの森 編集部
          </p>
        </div>
  
        {/* 本文 */}
        <section className="space-y-6">
          <p>
            当サイト「えほんの森」（以下、「当サイト」といいます）は、Amazon
            アソシエイト、楽天アフィリエイト、もしもアフィリエイト等の
            アフィリエイトプログラムを利用しています。
          </p>
  
          <p>
            当サイト内のリンクから商品を購入された場合、購入者様に追加の費用が
            発生することはなく、当サイト運営者に報酬が支払われることがあります。
          </p>
  
          <p>
            当サイトのレビューや紹介内容は、できる限り公正・客観的な情報を
            提供することを心がけており、広告である旨が分かるよう
            <code className="bg-gray-100 px-1 rounded text-sm">rel="sponsored nofollow"</code>
            を設定しています。
          </p>
        </section>
  
        {/* 掲載方針 */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-3 text-green-800">
            📚 掲載方針
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>児童書・絵本などの文化的価値を重視した紹介を行います。</li>
            <li>商業的な広告であっても、誤解を招かないよう明記します。</li>
            <li>
              掲載内容・価格・在庫状況などは変更される可能性があります。
              最新の情報はリンク先ページにてご確認ください。
            </li>
          </ul>
        </section>
  
        {/* 免責事項 */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-3 text-green-800">
            🪶 免責事項
          </h2>
          <p>
            当サイトでは正確な情報の提供を心がけていますが、その内容の正確性、
            完全性、安全性を保証するものではありません。
          </p>
          <p className="mt-2">
            掲載情報を利用する際は、各サービス提供者・販売サイトの情報を
            ご確認の上、自己責任でご利用ください。
          </p>
        </section>
  
        {/* 関連ページ */}
        <div className="mt-12 border-t pt-8 text-sm text-gray-600">
          <p>
            あわせて{" "}
            <a
              href="/policy/privacy"
              className="text-green-700 underline hover:text-green-900"
            >
              プライバシーポリシー
            </a>{" "}
            もご確認ください。
          </p>
        </div>
      </main>
    );
  }
  