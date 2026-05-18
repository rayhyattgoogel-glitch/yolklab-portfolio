"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Wrap children with a route-change "curtain" sweep that flashes the accent
 * curtain from top to bottom on every pathname change.
 * Uses motion's AnimatePresence keyed on pathname; the curtain runs once per
 * navigation then unmounts. Content beneath fades up subtly under it.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={`curtain-${pathname}`}
          className="curtain-veil"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
        />
      </AnimatePresence>
      <motion.div
        key={`content-${pathname}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.32,
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
