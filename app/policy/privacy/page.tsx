// app/policy/privacy/page.tsx
export const metadata = {
    title: "プライバシーポリシー | 森の図書館",
    description:
      "当サイトにおける個人情報・Cookie・アクセス解析・広告の取扱いについての方針を定めています。",
  };
  
  export default function PrivacyPolicyPage() {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
        <div className="bg-gradient-to-r from-green-50 to-amber-50 rounded-3xl p-6 shadow-sm border border-green-100 mb-10">
          <h1 className="text-3xl font-extrabold text-green-900 mb-2">🔒 プライバシーポリシー</h1>
          <p className="text-sm text-gray-600">最終更新日：2025年10月9日｜森の図書館</p>
        </div>
  
        <section className="space-y-6">
          <p>
            「森の図書館」（以下「当サイト」）は、個人情報保護法その他関連法令を遵守し、
            個人情報の適切な取り扱いと保護に努めます。
          </p>
  
          <h2 className="text-2xl font-semibold text-green-800 mt-8 mb-2">
            1. 個人情報の利用目的
          </h2>
          <p>
            当サイトでは、お問い合わせやコメント投稿時にお名前・メールアドレス等を取得する場合があります。
            これらの情報は、返信や確認などの連絡目的のみに使用し、それ以外の目的には利用いたしません。
          </p>
  
          <h2 className="text-2xl font-semibold text-green-800 mt-8 mb-2">
            2. アクセス解析ツールについて
          </h2>
          <p>
            当サイトでは、Google Analytics等のアクセス解析ツールを利用することがあります。
            Cookieを使用して匿名のトラフィックデータを収集しますが、個人を特定するものではありません。
          </p>
  
          <h2 className="text-2xl font-semibold text-green-800 mt-8 mb-2">
            3. 広告配信・アフィリエイトリンク
          </h2>
          <p>
            当サイトは、もしもアフィリエイト、楽天アフィリエイト、Amazonアソシエイトなどの
            プログラムに参加しています。リンクを経由して商品を購入された場合、当サイト運営者に報酬が発生することがあります。
          </p>
  
          <h2 className="text-2xl font-semibold text-green-800 mt-8 mb-2">
            4. 外部リンクについて
          </h2>
          <p>
            当サイトからリンクされている外部サイトの内容やサービスについては、一切の責任を負いません。
          </p>
  
          <h2 className="text-2xl font-semibold text-green-800 mt-8 mb-2">
            5. 免責事項
          </h2>
          <p>
            当サイトに掲載する情報には万全を期していますが、正確性や安全性を保証するものではありません。
            掲載内容によって生じた損害等について、当サイトは一切の責任を負いません。
          </p>
  
          <h2 className="text-2xl font-semibold text-green-800 mt-8 mb-2">
            6. 改訂
          </h2>
          <p>
            本ポリシーは、法令改正や運営方針の変更等により、予告なく改定される場合があります。
          </p>
        </section>
  
        <div className="mt-12 border-t pt-8 text-sm text-gray-600">
          <p>
            本ポリシーに関するお問い合わせは、
            <a href="/contact" className="underline text-green-700 hover:text-green-900">
              お問い合わせページ
            </a>
            よりご連絡ください。
          </p>
        </div>
      </main>
    );
  }
  