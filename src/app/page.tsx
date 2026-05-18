import { HeroIndex } from "@/components/hero/hero-index";
import { RecentStrip } from "@/components/hero/recent-strip";
import { ProductList } from "@/components/product/product-list";
import {
  loadAllProducts,
  loadAllReleases,
  loadRecentReleases,
} from "@/lib/content/loader";
import type { ReleaseIndex } from "@/lib/content/types";

export default function HomePage() {
  const products = loadAllProducts();
  const releases = loadAllReleases();
  const recent = loadRecentReleases(5);

  const titleBySlug = new Map(products.map((p) => [p.slug, p.title]));
  const typeBySlug = new Map(products.map((p) => [p.slug, p.type]));

  const recentIndex: ReleaseIndex[] = recent.map((r) => ({
    product: r.product,
    productTitle: titleBySlug.get(r.product) ?? r.product,
    productType: typeBySlug.get(r.product) ?? "tool",
    date: r.date,
    version: r.version,
    kind: r.kind,
    title: r.title,
  }));

  return (
    <>
      <HeroIndex />

      {/* All works, flat */}
      <section className="relative mx-auto max-w-[1480px] px-6 sm:px-10 pb-20 sm:pb-32">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            <span className="block h-px w-7 bg-accent" />
            <span>
              works · {products.length.toString().padStart(2, "0")} entries
            </span>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle-foreground">
            {releases.length} releases
          </span>
        </div>

        <ProductList items={products} baseDelay={1.3} />
      </section>

      <RecentStrip releases={recentIndex} />
    </>
  );
}
