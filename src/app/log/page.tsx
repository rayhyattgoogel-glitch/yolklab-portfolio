import { PageHeading } from "@/components/nav/page-heading";
import { ReleaseTimeline } from "@/components/release/release-timeline";
import {
  loadAllProducts,
  loadAllReleases,
} from "@/lib/content/loader";
import type { ReleaseIndex } from "@/lib/content/types";

export const metadata = {
  title: "Log · Release Notes",
};

/**
 * Render very simple inline markdown for release body — keep it small,
 * the same util as the per-product feed. Inline here so we don't ship the
 * heuristic helpers to the client bundle.
 */
function renderInlineMarkdown(input: string): string {
  if (!input) return "";
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
      out.push(`<li>${fmt(line.replace(/^[-*]\s+/, ""))}</li>`);
    } else {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      if (line) out.push(`<p>${fmt(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("");
}

function fmt(s: string): string {
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

export default function LogPage() {
  const releases = loadAllReleases();
  const products = loadAllProducts();
  const titleBySlug = new Map(products.map((p) => [p.slug, p.title]));
  const typeBySlug = new Map(products.map((p) => [p.slug, p.type]));

  const indexes: ReleaseIndex[] = releases.map((r) => ({
    product: r.product,
    productTitle: titleBySlug.get(r.product) ?? r.product,
    productType: typeBySlug.get(r.product) ?? "tool",
    date: r.date,
    version: r.version,
    kind: r.kind,
    title: r.title,
  }));

  const bodies: Record<string, string> = {};
  for (const r of releases) {
    bodies[`${r.product}-${r.date}-${r.version}`] = renderInlineMarkdown(r.body);
  }

  return (
    <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
      <PageHeading
        eyebrow="03 / log"
        title="Changelog"
        caption="所有作品的迭代更新时间线 · 按年份倒序 · 支持按类型与年份筛选"
        meta={`${releases.length.toString().padStart(2, "0")} entries`}
      />
      <section className="pb-32">
        <ReleaseTimeline releases={indexes} bodies={bodies} />
      </section>
    </div>
  );
}
