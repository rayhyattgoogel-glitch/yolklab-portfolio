import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  loadAllProducts,
  loadProductBySlug,
  loadReleasesByProduct,
} from "@/lib/content/loader";
import { EntryActions } from "@/components/product/entry-actions";
import {
  ReleaseFeed,
  ReleaseFeedHeader,
} from "@/components/release/release-feed";
import type { Metadata } from "next";

const STATUS_LABEL: Record<string, string> = {
  live: "live",
  beta: "beta",
  archived: "archived",
  planned: "planned",
};

export function generateStaticParams() {
  return loadAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = loadProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.oneLiner,
    openGraph: {
      title: product.title,
      description: product.oneLiner,
      images: product.ogImage ? [product.ogImage] : product.cover ? [product.cover] : [],
    },
  };
}

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = loadProductBySlug(slug);
  if (!product) return notFound();

  const releases = loadReleasesByProduct(slug);
  const allProducts = loadAllProducts();
  const related = product.related
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <article className="mx-auto max-w-[1480px] px-6 sm:px-10 pb-32">
      {/* Back link */}
      <nav className="pt-10 sm:pt-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-accent"
        >
          <span aria-hidden>←</span>
          back to index
        </Link>
      </nav>

      {/* Hero — meta + title + oneLiner */}
      <header className="pt-12 sm:pt-20">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`chip ${product.type === "game" ? "chip-accent" : ""}`}>
            {product.type}
          </span>
          <span className="chip">{STATUS_LABEL[product.status] ?? product.status}</span>
          <span className="chip">{product.year}</span>
          {product.launchedAt && (
            <span className="chip">launched · {product.launchedAt}</span>
          )}
        </div>

        <h1
          className="mt-8 font-display tracking-[-0.04em] leading-[0.95] text-foreground"
          style={{ fontSize: "clamp(3.5rem, 10vw, 10rem)", fontWeight: 400 }}
        >
          {product.title}
        </h1>

        {product.oneLiner && (
          <p className="mt-8 max-w-[70ch] text-xl sm:text-2xl leading-relaxed text-muted-foreground">
            {product.oneLiner}
          </p>
        )}

        {product.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Cover banner */}
      {product.cover && (
        <figure className="mt-14 sm:mt-20 relative overflow-hidden border border-border">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={product.cover}
              alt={`${product.title} · cover`}
              fill
              priority
              sizes="(min-width: 1480px) 1480px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
          {/* Corner ticks */}
          <span
            aria-hidden
            className="absolute left-3 top-3 h-3 w-3"
            style={{
              borderTop: "1.5px solid var(--accent)",
              borderLeft: "1.5px solid var(--accent)",
            }}
          />
          <span
            aria-hidden
            className="absolute right-3 top-3 h-3 w-3"
            style={{
              borderTop: "1.5px solid var(--accent)",
              borderRight: "1.5px solid var(--accent)",
            }}
          />
          <span
            aria-hidden
            className="absolute left-3 bottom-3 h-3 w-3"
            style={{
              borderBottom: "1.5px solid var(--accent)",
              borderLeft: "1.5px solid var(--accent)",
            }}
          />
          <span
            aria-hidden
            className="absolute right-3 bottom-3 h-3 w-3"
            style={{
              borderBottom: "1.5px solid var(--accent)",
              borderRight: "1.5px solid var(--accent)",
            }}
          />
        </figure>
      )}

      {/* Entry Actions */}
      <section className="pt-12 pb-12 border-b border-border">
        <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          <span className="block h-px w-7 bg-accent" />
          <span>entries · {product.entries.length} ways in</span>
        </div>
        <EntryActions entries={product.entries} productTitle={product.title} />
      </section>

      {/* MDX body */}
      {product.body && (
        <section className="grid grid-cols-12 gap-6 pt-16 pb-20 border-b border-border">
          <aside className="col-span-12 md:col-span-2 lg:col-span-3 mb-6 md:mb-0">
            <div className="md:sticky md:top-24 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground flex items-center md:items-start gap-3">
              <span className="block h-px w-7 bg-accent md:mt-2.5" />
              <span>
                about
                <br className="hidden md:block" />
                <span className="md:block text-subtle-foreground normal-case tracking-normal mt-1">
                  详细介绍
                </span>
              </span>
            </div>
          </aside>
          <div className="col-span-12 md:col-span-10 lg:col-span-8">
            <div className="prose-yolklab">
              <MDXRemote source={product.body} />
            </div>
          </div>
        </section>
      )}

      {/* Release feed */}
      <section className="pt-16 pb-20 border-b border-border">
        <ReleaseFeedHeader productSlug={product.slug} total={releases.length} />
        <ReleaseFeed releases={releases} productSlug={product.slug} />
      </section>

      {/* Related works */}
      {related.length > 0 && (
        <section className="pt-16">
          <div className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            <span className="block h-px w-7 bg-accent" />
            <span>related works · {related.length}</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/works/${p.slug}`}
                  className="block gold-edge border border-border p-6 h-full"
                >
                  <div className="flex items-center gap-2">
                    <span className={`chip ${p.type === "game" ? "chip-accent" : ""}`}>
                      {p.type}
                    </span>
                    <span className="chip">{p.year}</span>
                  </div>
                  <div className="mt-4 font-display text-3xl tracking-tight text-foreground">
                    {p.title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {p.oneLiner}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
