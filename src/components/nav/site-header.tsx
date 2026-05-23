"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/diary", label: "diary" },
  { href: "/log", label: "log" },
  { href: "/about", label: "about" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/75 border-b border-border">
      <div className="mx-auto flex h-14 max-w-[1480px] items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.22em] text-foreground"
        >
          <Diamond />
          <span className="transition-colors group-hover:text-accent">
            yolklab
          </span>
        </Link>

        <nav className="flex items-center gap-7">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative font-mono text-[12px] uppercase tracking-[0.22em] transition-colors ${
                  active
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-px w-full bg-accent"
                  />
                )}
              </Link>
            );
          })}
          <span aria-hidden className="h-4 w-px bg-border" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function Diamond() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      className="text-accent"
      aria-hidden
    >
      <path d="M4.5 0 9 4.5 4.5 9 0 4.5Z" fill="currentColor" />
    </svg>
  );
}
