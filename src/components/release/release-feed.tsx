import Link from "next/link";
import type { Release } from "@/lib/content/types";

interface ReleaseFeedProps {
  releases: Release[];
  productSlug: string;
}

const KIND_LABEL: Record<string, string> = {
  major: "major",
  feature: "feature",
  fix: "fix",
  release: "release",
};

export function ReleaseFeed({ releases }: ReleaseFeedProps) {
  if (releases.length === 0) {
    return (
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground">
        — 暂无变更记录 —
      </p>
    );
  }

  return (
    <ul className="border-t border-border">
      {releases.map((r) => (
        <li
          key={`${r.date}-${r.version}`}
          className="group border-b border-border py-5"
        >
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
              {r.date}
            </span>
            <span
              className={`chip ${
                r.kind === "major" || r.kind === "release" ? "chip-accent" : ""
              }`}
            >
              {KIND_LABEL[r.kind] ?? r.kind}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              v{r.version}
            </span>
          </div>
          <div className="mt-2 font-display text-xl leading-snug tracking-tight text-foreground">
            {r.title}
          </div>
          {r.body && (
            <div
              className="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-muted-foreground whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: renderInlineMarkdown(r.body),
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Render very simple inline markdown for release body:
 *   **bold** → <strong>
 *   `code`  → <code>
 *   newline → <br/>
 *   - item / * item → bullet list
 * No HTML in source, so escaping just covers <, >, &.
 */
function renderInlineMarkdown(input: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = escape(input).split("\n");
  const out: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul class="mt-2 ml-5 list-disc space-y-1.5">');
        inList = true;
      }
      out.push(`<li>${inlineFormat(line.replace(/^[-*]\s+/, ""))}</li>`);
    } else {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      if (line) out.push(`<p>${inlineFormat(line)}</p>`);
      else out.push("<br/>");
    }
  }
  if (inList) out.push("</ul>");
  return out.join("");
}

function inlineFormat(s: string): string {
  return s
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="text-accent font-semibold">$1</strong>',
    )
    .replace(
      /`([^`]+?)`/g,
      '<code class="font-mono text-[13px] px-1 py-0.5 border border-border text-foreground rounded-sm">$1</code>',
    );
}

interface ReleaseFeedHeaderProps {
  productSlug: string;
  total: number;
}

export function ReleaseFeedHeader({ productSlug, total }: ReleaseFeedHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
        <span className="block h-px w-7 bg-accent" />
        <span>release notes · {total.toString().padStart(2, "0")} entries</span>
      </div>
      <Link
        href={`/log?product=${productSlug}`}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-accent"
      >
        full log →
      </Link>
    </div>
  );
}
