import { PageHeading } from "@/components/nav/page-heading";
import { ProductList } from "@/components/product/product-list";
import { loadProductsByType } from "@/lib/content/loader";

export const metadata = {
  title: "Games · 游戏",
};

export default function GamesPage() {
  const games = loadProductsByType("game");

  return (
    <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
      <PageHeading
        eyebrow="02 / games"
        title="Games"
        caption="游戏作品 · 小程序 · 下载 · 网页 · 持续上架中"
        meta={`${games.length.toString().padStart(2, "0")} entries`}
      />
      <section className="pb-32">
        <ProductList items={games} />
      </section>
    </div>
  );
}
