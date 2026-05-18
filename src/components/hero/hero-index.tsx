"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const TITLE = ["Y", "O", "L", "K", "L", "A", "B"];
const STAGGER = 0.07;
const BASE_DELAY = 0.35;

export function HeroIndex() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="vignette relative isolate overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1480px] px-6 sm:px-10 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
        {/* 00 / index — meta */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
        >
          <span className="block h-px w-7 bg-accent" />
          <span>00 / index 2026</span>
        </motion.div>

        {/* Title — staggered glyphs */}
        <h1
          aria-label="Yolklab"
          className="mt-10 sm:mt-14 font-display select-none leading-[0.84] tracking-[-0.04em] text-foreground"
          style={{
            fontSize: "clamp(5.6rem, 16vw, 18rem)",
            fontWeight: 400,
          }}
        >
          <span className="flex flex-wrap justify-between gap-x-2 sm:gap-x-4 max-w-full">
            {TITLE.map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                initial={reduced ? false : { opacity: 0, y: 28, scaleY: 1.12 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                transition={{
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                  delay: BASE_DELAY + i * STAGGER,
                }}
                className="inline-block origin-bottom"
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Slogan */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
            delay: BASE_DELAY + TITLE.length * STAGGER + 0.15,
          }}
          className="mt-12 grid grid-cols-12 gap-x-4 sm:gap-x-6"
        >
          <div className="col-span-12 sm:col-span-7 lg:col-span-6 sm:col-start-6 lg:col-start-7">
            <div className="flex items-start gap-4">
              <div className="mt-3 hidden sm:block h-px w-12 shrink-0 aurora-line" />
              <p className="font-display text-2xl sm:text-[28px] leading-snug text-foreground italic">
                <span aria-hidden className="text-accent mr-3">—</span>
                想到就去做，
                <br className="sm:hidden" />
                <span className="font-display not-italic font-medium">
                  Just Do It！
                </span>
              </p>
            </div>
            <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground max-w-md leading-relaxed">
              Personal index of <span className="text-accent">tools</span> &amp;{" "}
              <span className="text-accent">games</span> · made by yolklab ·
              archived &amp; living.
            </p>
          </div>
        </motion.div>

        {/* Scroll cue */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: BASE_DELAY + TITLE.length * STAGGER + 0.9,
            }}
            className="mt-16 sm:mt-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-subtle-foreground"
          >
            <motion.span
              aria-hidden
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="block"
            >
              ↓
            </motion.span>
            <span>scroll · works below</span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
