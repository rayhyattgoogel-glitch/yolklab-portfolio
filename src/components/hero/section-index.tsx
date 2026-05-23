"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  animate,
} from "motion/react";
import { useEffect, useState } from "react";

interface Section {
  index: string;
  label: string;
  href: string;
  count: number;
  caption: string;
}

interface SectionIndexProps {
  sections: Section[];
}

/** Mount delay so this falls after the Hero stagger finishes (~1.4s). */
const BASE_DELAY = 1.35;
const STEP = 0.12;

export function SectionIndex({ sections }: SectionIndexProps) {
  const reduced = useReducedMotion();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="relative mx-auto max-w-[1480px] px-6 sm:px-10 py-24 sm:py-36">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
          delay: reduced ? 0 : BASE_DELAY - 0.2,
        }}
        className="mb-12 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
      >
        <span className="block h-px w-7 bg-border-strong" />
        <span>section index</span>
      </motion.div>

      <ol className="border-t border-border">
        {sections.map((s, i) => (
          <motion.li
            key={s.href}
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
              delay: reduced ? 0 : BASE_DELAY + i * STEP,
            }}
            className="group border-b border-border"
          >
            <Link
              href={s.href}
              className="relative grid grid-cols-12 items-baseline gap-x-4 py-7 sm:py-9 transition-colors hover:bg-surface"
            >
              <span className="col-span-2 sm:col-span-1 font-mono text-[12px] sm:text-sm uppercase tracking-[0.22em] text-muted-foreground transition-colors group-hover:text-accent">
                {s.index}
              </span>

              <span className="col-span-7 sm:col-span-6 lg:col-span-5 font-display text-4xl sm:text-6xl lg:text-7xl tracking-[-0.02em] text-foreground transition-transform duration-500 ease-out group-hover:translate-x-2">
                {s.label}
              </span>

              <span className="hidden lg:block col-span-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground leading-relaxed self-center">
                {s.caption}
              </span>

              <span className="col-span-3 sm:col-span-5 lg:col-span-2 flex items-baseline justify-end gap-4 self-center">
                <CountUp
                  to={s.count}
                  active={armed}
                  delay={BASE_DELAY + 0.3 + i * STEP}
                />
                <ArrowGlyph />
              </span>
            </Link>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function CountUp({
  to,
  active,
  delay = 0,
}: {
  to: number;
  active: boolean;
  delay?: number;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    Math.round(v).toString().padStart(2, "0"),
  );
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      mv.set(to);
      return;
    }
    const controls = animate(mv, to, {
      duration: 1.2,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [active, to, delay, mv, reduced]);

  return (
    <motion.span className="num-reveal text-2xl sm:text-3xl text-accent">
      {rounded}
    </motion.span>
  );
}

function ArrowGlyph() {
  return (
    <span
      aria-hidden
      className="font-mono text-lg text-muted-foreground transition-all duration-500 ease-out group-hover:text-accent group-hover:translate-x-1"
    >
      →
    </span>
  );
}
