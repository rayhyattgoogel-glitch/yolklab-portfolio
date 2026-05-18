"use client";

import { motion, useReducedMotion } from "motion/react";

interface PageHeadingProps {
  eyebrow: string;
  title: string;
  caption?: string;
  /** Optional right-aligned metadata (e.g. "12 entries") */
  meta?: string;
}

export function PageHeading({ eyebrow, title, caption, meta }: PageHeadingProps) {
  const reduced = useReducedMotion();
  return (
    <header className="relative pt-20 pb-10 sm:pt-32 sm:pb-14">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="flex items-center justify-between gap-6"
      >
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          <span className="block h-px w-7 bg-accent" />
          <span>{eyebrow}</span>
        </div>
        {meta && (
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            {meta}
          </span>
        )}
      </motion.div>

      <motion.h1
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
        className="mt-8 font-display tracking-[-0.04em] leading-[0.94] text-foreground"
        style={{ fontSize: "clamp(3.5rem, 9vw, 9rem)", fontWeight: 400 }}
      >
        {title}
      </motion.h1>

      {caption && (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="mt-8 max-w-[60ch] font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground leading-relaxed"
        >
          {caption}
        </motion.p>
      )}
    </header>
  );
}
