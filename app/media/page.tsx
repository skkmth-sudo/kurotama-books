// app/media/page.tsx
export const metadata = {
    title: "媒体情報 | 森の図書館（児童書ランキング）",
    description:
      "児童書・絵本のおすすめを分かりやすく紹介する個人メディア『森の図書館』の媒体情報ページです。",
  };
  
  export default function MediaPage() {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">媒体情報（Media Kit）</h1>
  
        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">サイト名</h2>
          <p>森の図書館（児童書ランキング）</p>
        </section>
  
        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">URL</h2>
          <p>
            <a href="https://kurotama-app.example" className="underline text-blue-700">
              https://kurotama-app.example
            </a>
          </p>
        </section>
  
        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">運営者</h2>
          <p>個人（くろたま）</p>
        </section>
  
        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">サイト概要</h2>
          <p>
            児童書・絵本を中心に、テーマ別のランキングや新刊情報をわかりやすく紹介する個人メディアです。
            読み聞かせ・学び・情操教育に役立つ書籍との出会いを支援します。
          </p>
          <ul className="list-disc pl-5">
            <li>対象：未就学〜小学生の読者・保護者・教育関係者</li>
            <li>主な内容：ランキング、レビュー、タグ（動物/冒険/科学 など）</li>
            <li>更新頻度：週1〜3回</li>
            <li>SNS/外部流入：検索・SNS・ブックマーク中心（順次拡大）</li>
          </ul>
        </section>
  
        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">掲載広告について</h2>
          <p>
            本サイトはアフィリエイトプログラムを利用しています。詳細は
            <a href="/policy/affiliate" className="underline text-blue-700">アフィリエイトポリシー</a>
            および
            <a href="/policy/privacy" className="underline text-blue-700">プライバシーポリシー</a>
            をご確認ください。
          </p>
        </section>
  
        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">お問い合わせ</h2>
          <p>
            ご連絡は <a className="underline text-blue-700" href="mailto:yourname@example.com">tao.tao.taopi26@gmail.com</a> まで。
            <a href="/contact" className="underline text-blue-700">お問い合わせフォーム</a> もご利用いただけます。
          </p>
        </section>
      </main>
    );
  }
  