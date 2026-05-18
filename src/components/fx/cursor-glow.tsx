"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A soft warm-gold glow that follows the cursor, masked by mix-blend-mode.
 * Disabled on coarse pointers (touch) and reduced-motion users.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const coarse = matchMedia("(pointer: coarse)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;

    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        rafId = 0;
      });
    };

    const onEnter = () => setEnabled(true);
    const onLeave = () => setEnabled(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerenter", onEnter);
    document.documentElement.addEventListener("pointerleave", onLeave);

    // Initial enable shortly after mount so it doesn't flash on first paint.
    const t = window.setTimeout(() => setEnabled(true), 400);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.clearTimeout(t);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`cursor-glow${enabled ? " active" : ""}`}
    />
  );
}
