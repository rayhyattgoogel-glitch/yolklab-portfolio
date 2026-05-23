import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="mx-auto max-w-[1480px] px-6 sm:px-10 py-12 sm:py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-display text-5xl leading-none tracking-tight text-foreground sm:text-6xl">
              yolklab
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              想到就去做 · Just Do It
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <Link
              href="/"
              className="transition-colors hover:text-accent"
            >
              index
            </Link>
            <Link href="/diary" className="transition-colors hover:text-accent">
              diary
            </Link>
            <Link href="/log" className="transition-colors hover:text-accent">
              log
            </Link>
            <Link href="/about" className="transition-colors hover:text-accent">
              about
            </Link>
            <a
              href="https://github.com/yolklab"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent"
            >
              github ↗
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} yolklab · all works listed are personal projects</span>
          <span className="text-accent">v 0.1</span>
        </div>
      </div>
    </footer>
  );
}
