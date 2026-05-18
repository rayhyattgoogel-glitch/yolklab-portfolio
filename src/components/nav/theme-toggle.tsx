"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex h-8 w-14 items-center rounded-full border border-border bg-surface px-1 transition-colors hover:border-accent"
    >
      {/* Track marks */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-[9px] font-mono uppercase tracking-[0.18em] text-subtle-foreground">
        <span aria-hidden>L</span>
        <span aria-hidden>D</span>
      </span>

      {/* Knob */}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 36 }}
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
          isDark ? "ml-auto bg-accent text-accent-foreground" : "bg-foreground text-background"
        }`}
        suppressHydrationWarning
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "dark" : "light"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="block"
            aria-hidden
          >
            {isDark ? <MoonGlyph /> : <SunGlyph />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}

function MoonGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M9.2 7.2A4 4 0 0 1 4.8 2.8 4 4 0 1 0 9.2 7.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="2.4" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="6"
          y1="0.8"
          x2="6"
          y2="2.2"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          transform={`rotate(${deg} 6 6)`}
        />
      ))}
    </svg>
  );
}
