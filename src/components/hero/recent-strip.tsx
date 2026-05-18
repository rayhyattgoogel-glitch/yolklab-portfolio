"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ReleaseIndex } from "@/lib/content/types";
import { timeAgo } from "@/lib/utils";

interface RecentStripProps {
  releases: ReleaseIndex[];
}

const KIND_LABEL: Record<string, string> = {
  major: "major",
  feature: "feature",
  fix: "fix",
  release: "release",
};

const STEP = 0.07;

export function RecentStrip({ releases }: RecentStripProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15, once: true });
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setFallback(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  const active = inView || fallback;

  if (releases.length === 0) {
    return null;
  }

  return (
    <section
      ref={ref}
      className="relative mx-auto max-w-[1480px] px-6 sm:px-10 pb-24 sm:pb-32"
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -6 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 flex items-end justify-between gap-6"
      >
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          <span className="block h-px w-7 bg-border-strong" />
          <span>recent · changelog</span>
        </div>
        <Link
          href="/log"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-accent"
        >
          full log →
        </Link>
      </motion.div>

      <ul className="border-t border-border">
        {releases.map((r, i) => (
          <motion.li
            key={`${r.product}-${r.date}-${r.version}`}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
              delay: reduced ? 0 : 0.1 + i * STEP,
            }}
            className="group border-b border-border"
          >
            <Link
              href={`/works/${r.product}`}
              className="grid grid-cols-12 items-baseline gap-x-4 py-5 transition-colors hover:bg-surface"
            >
              <span className="col-span-3 sm:col-span-2 font-mono text-[12px] sm:text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {r.date.slice(5)}
              </span>

              <span className="col-span-3 sm:col-span-2">
                <span
                  className={`chip ${
                    r.kind === "major" || r.kind === "release"
                      ? "chip-accent"
                      : ""
                  }`}
                >
                  {KIND_LABEL[r.kind] ?? r.kind}
                </span>
              </span>

              <span className="col-span-6 sm:col-span-6 lg:col-span-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-xl sm:text-2xl text-foreground tracking-tight transition-transform duration-400 ease-out group-hover:translate-x-1">
                  {r.productTitle}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                  v{r.version}
                </span>
                <span className="basis-full font-mono text-[12px] text-muted-foreground sm:text-sm sm:basis-auto">
                  · {r.title}
                </span>
              </span>

              <span className="hidden sm:flex col-span-2 justify-end font-mono text-[11px] uppercase tracking-[0.18em] text-subtle-foreground transition-colors group-hover:text-muted-foreground">
                {timeAgo(r.date)}
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
