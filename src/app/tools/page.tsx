import { PageHeading } from "@/components/nav/page-heading";
import { ProductList } from "@/components/product/product-list";
import { loadProductsByType } from "@/lib/content/loader";

export const metadata = {
  title: "Tools · 工具 & 软件",
};

export default function ToolsPage() {
  const tools = loadProductsByType("tool");

  return (
    <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
      <PageHeading
        eyebrow="01 / tools"
        title="Tools"
        caption="工具与软件 · 网页应用 · App · 微信小程序 · CLI · 全部由 yolklab 独立开发"
        meta={`${tools.length.toString().padStart(2, "0")} entries`}
      />
      <section className="pb-32">
        <ProductList items={tools} />
      </section>
    </div>
  );
}
