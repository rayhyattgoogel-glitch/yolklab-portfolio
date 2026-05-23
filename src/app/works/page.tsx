import { PageHeading } from "@/components/nav/page-heading";
import { ProductList } from "@/components/product/product-list";
import { loadAllProducts } from "@/lib/content/loader";

export const metadata = {
  title: "Works · 全部作品",
};

export default function WorksPage() {
  const products = loadAllProducts();
  const tools = products.filter((p) => p.type === "tool").length;
  const games = products.filter((p) => p.type === "game").length;

  return (
    <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
      <PageHeading
        eyebrow="01 / works"
        title="Works"
        caption={`全部已上架的作品 · ${tools} tools · ${games} games · 持续更新`}
        meta={`${products.length.toString().padStart(2, "0")} total`}
      />
      <section className="pb-32">
        <ProductList items={products} />
      </section>
    </div>
  );
}
