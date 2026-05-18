"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { ReleaseIndex } from "@/lib/content/types";

interface ReleaseTimelineProps {
  releases: ReleaseIndex[];
  /** Optional pre-rendered body HTML keyed by `${product}-${date}-${version}`. */
  bodies?: Record<string, string>;
}

type TypeFilter = "all" | "tool" | "game";

const KIND_ORDER: Record<string, number> = {
  major: 0,
  release: 1,
  feature: 2,
  fix: 3,
};

export function ReleaseTimeline({ releases, bodies = {} }: ReleaseTimelineProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  const years = useMemo(() => {
    const ys = new Set<number>();
    for (const r of releases) {
      const y = Number(r.date.slice(0, 4));
      if (!Number.isNaN(y)) ys.add(y);
    }
    return Array.from(ys).sort((a, b) => b - a);
  }, [releases]);

  const filtered = useMemo(() => {
    return releases.filter((r) => {
      if (typeFilter !== "all" && r.productType !== typeFilter) return false;
      if (yearFilter !== "all" && Number(r.date.slice(0, 4)) !== yearFilter)
        return false;
      return true;
    });
  }, [releases, typeFilter, yearFilter]);

  const byYear = useMemo(() => {
    const map = new Map<number, ReleaseIndex[]>();
    for (const r of filtered) {
      const y = Number(r.date.slice(0, 4));
      if (!map.has(y)) map.set(y, []);
      map.get(y)!.push(r);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        // Same date: newer version first (numeric semver collation)
        return b.version.localeCompare(a.version, undefined, { numeric: true });
      });
    }
    return Array.from(map.entries()).sort(([a], [b]) => b - a);
  }, [filtered]);

  return (
    <div>
      {/* Filter chips */}
      <div className="mb-12 flex flex-wrap items-center gap-6 border-y border-border py-5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-subtle-foreground">
            type
          </span>
          <Pills
            options={[
              { v: "all" as const, label: `all · ${releases.length}` },
              {
                v: "tool" as const,
                label: `tool · ${releases.filter((r) => r.productType === "tool").length}`,
              },
              {
                v: "game" as const,
                label: `game · ${releases.filter((r) => r.productType === "game").length}`,
              },
            ]}
            value={typeFilter}
            onChange={(v) => setTypeFilter(v)}
          />
        </div>
        <span aria-hidden className="h-4 w-px bg-border" />
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-subtle-foreground">
            year
          </span>
          <Pills
            options={[
              { v: "all" as const, label: "all" },
              ...years.map((y) => ({ v: y, label: String(y) })),
            ]}
            value={yearFilter}
            onChange={(v) => setYearFilter(v)}
          />
        </div>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          showing {filtered.length} / {releases.length}
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-16 text-center font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground">
          — 没有符合条件的记录 —
        </div>
      )}

      {/* Timeline by year */}
      {byYear.map(([year, items], yi) => (
        <section key={year} className="mb-16">
          <div className="mb-8 flex items-baseline gap-6">
            <h2 className="font-display text-6xl sm:text-7xl tracking-[-0.04em] text-foreground leading-none">
              {year}
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              {items.length} entries
            </span>
          </div>

          <ol className="relative">
            {/* vertical rail */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-[78px] sm:left-[110px] top-2 bottom-2 w-px bg-border"
            />
            {items.map((r, i) => {
              const bodyKey = `${r.product}-${r.date}-${r.version}`;
              const body = bodies[bodyKey];
              return (
                <motion.li
                  key={bodyKey}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.05 * i + 0.1 * yi,
                  }}
                  className="relative grid grid-cols-[78px_1fr] sm:grid-cols-[110px_1fr] gap-x-6 py-6 first:pt-2 last:pb-2"
                >
                  {/* date */}
                  <div className="font-mono text-[12px] sm:text-sm tabular-nums text-muted-foreground pt-1">
                    {r.date.slice(5)}
                  </div>

                  {/* node */}
                  <span
                    aria-hidden
                    className={`absolute left-[74px] sm:left-[106px] top-3.5 h-2 w-2 rounded-full ${
                      r.kind === "major" || r.kind === "release"
                        ? "bg-accent"
                        : "bg-border-strong"
                    }`}
                  />

                  {/* content */}
                  <div className="pl-4">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <Link
                        href={`/works/${r.product}`}
                        className="font-display text-2xl sm:text-3xl tracking-tight text-foreground transition-colors hover:text-accent"
                      >
                        {r.productTitle}
                      </Link>
                      <span
                        className={`chip ${
                          r.kind === "major" || r.kind === "release"
                            ? "chip-accent"
                            : ""
                        }`}
                      >
                        {r.kind}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                        v{r.version}
                      </span>
                    </div>
                    <div className="mt-2 font-display text-lg sm:text-xl leading-snug text-foreground">
                      {r.title}
                    </div>
                    {body && (
                      <div
                        className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: body }}
                      />
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

interface Pill<V> {
  v: V;
  label: string;
}

function Pills<V extends string | number>({
  options,
  value,
  onChange,
}: {
  options: Pill<V>[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          onClick={() => onChange(o.v)}
          className={`font-mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 border transition-all ${
            value === o.v
              ? "border-accent text-accent bg-accent-soft"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
