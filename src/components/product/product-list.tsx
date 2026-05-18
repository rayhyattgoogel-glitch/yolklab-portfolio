"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { Product, ProductIndex } from "@/lib/content/types";

interface ProductListProps {
  items: (Product | ProductIndex)[];
  /** Offset for the displayed index labels. */
  startIndex?: number;
  /** Mount-delay base for the first item's stagger. */
  baseDelay?: number;
}

const STATUS_LABEL: Record<string, string> = {
  live: "live",
  beta: "beta",
  archived: "archived",
  planned: "planned",
};

export function ProductList({
  items,
  startIndex = 1,
  baseDelay = 0.1,
}: ProductListProps) {
  const reduced = useReducedMotion();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground">
        — 暂无作品 · 即将上架 —
      </div>
    );
  }

  return (
    <ol className="border-t border-border">
      {items.map((p, i) => {
        const idx = String(startIndex + i).padStart(2, "0");
        return (
          <motion.li
            key={p.slug}
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
              delay: reduced ? 0 : baseDelay + i * 0.1,
            }}
            className="group border-b border-border"
          >
            <Link
              href={`/works/${p.slug}`}
              className="block py-10 sm:py-14"
            >
              <div className="grid grid-cols-12 gap-x-4 sm:gap-x-8 lg:gap-x-10 items-start">
                {/* Cover */}
                <div className="col-span-12 sm:col-span-5 lg:col-span-5">
                  <Cover product={p} />
                </div>

                {/* Content */}
                <div className="col-span-12 sm:col-span-7 lg:col-span-7 mt-6 sm:mt-0 flex flex-col h-full">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground transition-colors group-hover:text-accent">
                      {idx} / {p.type}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle-foreground">
                      {p.year}
                    </span>
                  </div>

                  <h2 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.02] text-foreground transition-transform duration-500 ease-out group-hover:translate-x-2">
                    {p.title}
                  </h2>

                  <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
                    {p.oneLiner || "—"}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className={`chip ${p.type === "game" ? "chip-accent" : ""}`}>
                      {p.type}
                    </span>
                    <span className="chip">{STATUS_LABEL[p.status] ?? p.status}</span>
                    {p.tags.slice(0, 4).map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-8 flex items-baseline justify-between gap-4">
                    <EntrySummary product={p} />
                    <span
                      aria-hidden
                      className="font-mono text-2xl text-muted-foreground transition-all duration-500 ease-out group-hover:text-accent group-hover:translate-x-1.5"
                    >
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ol>
  );
}

function Cover({ product }: { product: Product | ProductIndex }) {
  const src = product.cover;
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden border border-border transition-all duration-500 ease-out group-hover:border-accent">
      {src ? (
        <Image
          src={src}
          alt={`${product.title} · cover`}
          fill
          sizes="(min-width: 640px) 40vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          unoptimized
        />
      ) : (
        <CoverPlaceholder title={product.title} type={product.type} />
      )}
      {/* Corner ticks on hover */}
      <CornerTicks />
    </div>
  );
}

function CoverPlaceholder({ title, type }: { title: string; type: string }) {
  const first = title.charAt(0);
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, var(--accent-soft), transparent 60%)",
        }}
      />
      <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {type} · cover
      </div>
      <div className="font-display text-[8rem] text-foreground opacity-60 leading-none">
        {first}
      </div>
    </div>
  );
}

function CornerTicks() {
  const t =
    "absolute h-3 w-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100";
  return (
    <>
      <span
        aria-hidden
        className={`${t} left-2 top-2`}
        style={{
          borderTop: "1.5px solid var(--accent)",
          borderLeft: "1.5px solid var(--accent)",
        }}
      />
      <span
        aria-hidden
        className={`${t} right-2 top-2`}
        style={{
          borderTop: "1.5px solid var(--accent)",
          borderRight: "1.5px solid var(--accent)",
        }}
      />
      <span
        aria-hidden
        className={`${t} left-2 bottom-2`}
        style={{
          borderBottom: "1.5px solid var(--accent)",
          borderLeft: "1.5px solid var(--accent)",
        }}
      />
      <span
        aria-hidden
        className={`${t} right-2 bottom-2`}
        style={{
          borderBottom: "1.5px solid var(--accent)",
          borderRight: "1.5px solid var(--accent)",
        }}
      />
    </>
  );
}

function EntrySummary({ product }: { product: Product | ProductIndex }) {
  const count =
    "entries" in product ? product.entries.length : product.entryCount;
  const hasQr =
    "entries" in product
      ? product.entries.some((e) => e.kind === "wechat" || !!e.qr)
      : product.hasQr;
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
      <span>{count} entries</span>
      {hasQr && (
        <span className="inline-flex items-center gap-1 text-accent">
          <QrGlyph /> qr
        </span>
      )}
    </div>
  );
}

function QrGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <rect x="0" y="0" width="3" height="3" fill="currentColor" />
      <rect x="7" y="0" width="3" height="3" fill="currentColor" />
      <rect x="0" y="7" width="3" height="3" fill="currentColor" />
      <rect x="4" y="4" width="2" height="2" fill="currentColor" />
    </svg>
  );
}
