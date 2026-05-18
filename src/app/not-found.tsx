import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1480px] px-6 sm:px-10 min-h-[70vh] flex flex-col justify-center">
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-accent">
        <span className="block h-px w-7 bg-accent" />
        <span>404 / not found</span>
      </div>
      <h1
        className="mt-8 font-display tracking-[-0.04em] leading-[0.94] text-foreground"
        style={{ fontSize: "clamp(4rem, 12vw, 14rem)", fontWeight: 400 }}
      >
        Lost in
        <br />
        the index.
      </h1>
      <p className="mt-8 max-w-[60ch] font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground leading-relaxed">
        这里没有要找的页面 · 可能从未存在，或者已经被归档
      </p>
      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 border border-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-accent transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <span aria-hidden>←</span> back to index
        </Link>
        <Link
          href="/works"
          className="group inline-flex items-center gap-2.5 border border-border px-5 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
        >
          browse works
        </Link>
      </div>
    </div>
  );
}
