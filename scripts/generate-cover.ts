/**
 * Generate a cinematic cover SVG for a product.
 *
 * Usage: tsx scripts/generate-cover.ts <slug> [--force]
 *
 * Reads content/products/<slug>.mdx, substitutes title/oneLiner/year/tags
 * into scripts/templates/cover.svg.tmpl, writes public/covers/<slug>.svg.
 *
 * Visual language matches public/covers/prompt-tools.svg — kept dark-only on
 * purpose so the cover stays "cinematic" in both light and dark themes.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const PRODUCTS_DIR = path.join(ROOT, "content/products");
const COVERS_DIR = path.join(ROOT, "public/covers");
const TEMPLATE_PATH = path.join(ROOT, "scripts/templates/cover.svg.tmpl");

interface CoverInput {
  slug: string;
  title: string;
  oneLiner: string;
  year: number;
  tags: string[];
  launchedAt?: string;
  version: string;
}

function readProduct(slug: string): CoverInput {
  const file = path.join(PRODUCTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) {
    throw new Error(`Product MDX not found: ${file}`);
  }
  const raw = fs.readFileSync(file, "utf-8");
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;

  const slugStr = typeof fm.slug === "string" ? fm.slug : slug;
  const title = typeof fm.title === "string" ? fm.title : slugStr;
  const oneLiner = typeof fm.oneLiner === "string" ? fm.oneLiner : "";
  const launchedAt = typeof fm.launchedAt === "string" ? fm.launchedAt : undefined;
  const year =
    typeof fm.year === "number"
      ? fm.year
      : launchedAt
        ? Number.parseInt(launchedAt.slice(0, 4), 10) || new Date().getFullYear()
        : new Date().getFullYear();
  const tags = Array.isArray(fm.tags)
    ? fm.tags.map((t) => String(t)).filter(Boolean)
    : [];

  return {
    slug: slugStr,
    title,
    oneLiner,
    year,
    tags,
    launchedAt,
    version: "v1.0",
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isCjk(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0x3040 && code <= 0x30ff)
  );
}

function visualWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += isCjk(ch) ? 1 : 0.55;
  return w;
}

function titleFontSize(title: string): number {
  const w = visualWidth(title);
  if (w <= 3) return 320;
  if (w <= 4) return 280;
  if (w <= 5) return 240;
  if (w <= 6) return 210;
  if (w <= 8) return 180;
  if (w <= 10) return 150;
  return 130;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

function tagsLine(tags: string[]): string {
  if (tags.length === 0) return "WORK";
  return tags.slice(0, 3).map((t) => t.toUpperCase()).join(" · ");
}

function latinizeSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((s) => s.toUpperCase())
    .join("-");
}

function render(input: CoverInput): string {
  const tmpl = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  const title = truncate(input.title, 8);
  const titleLatin = latinizeSlug(input.slug);
  const tagline = truncate(input.oneLiner || "Yolklab work · in progress.", 56);
  const tag = (input.tags[0] ?? `WORK`).toUpperCase();
  const tagsLn = tagsLine(input.tags);
  const fontSize = titleFontSize(title);

  // Bottom meta horizontal layout — derived from latin slug width
  const slugChars = titleLatin.length;
  const slugPxPerChar = 14;
  const slugEnd = Math.max(160, slugChars * slugPxPerChar);
  const dot1 = slugEnd + 24;
  const verX = dot1 + 30;
  const verEnd = verX + input.version.length * 16 + 8;
  const dot2 = verEnd + 12;
  const tagsX = dot2 + 30;

  const subs: Record<string, string> = {
    "{{TITLE}}": escapeXml(title),
    "{{TITLE_FONT_SIZE}}": String(fontSize),
    "{{TITLE_LATIN}}": escapeXml(titleLatin),
    "{{TAGLINE}}": escapeXml(tagline),
    "{{YEAR}}": String(input.year),
    "{{TAG}}": escapeXml(tag),
    "{{TAGS_LINE}}": escapeXml(tagsLn),
    "{{VERSION}}": escapeXml(input.version),
    "{{META_VERSION_X}}": String(dot1),
    "{{META_VERSION_X_TEXT}}": String(verX),
    "{{META_TAGS_X}}": String(dot2),
    "{{META_TAGS_X_TEXT}}": String(tagsX),
  };

  return Object.entries(subs).reduce(
    (out, [k, v]) => out.split(k).join(v),
    tmpl,
  );
}

function main(): void {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith("--"));
  const force = args.includes("--force");

  if (!slug) {
    console.error("Usage: tsx scripts/generate-cover.ts <slug> [--force]");
    process.exit(1);
  }

  const input = readProduct(slug);
  const output = path.join(COVERS_DIR, `${input.slug}.svg`);

  if (fs.existsSync(output) && !force) {
    console.warn(
      `[gen:cover] ${path.relative(ROOT, output)} already exists. Pass --force to overwrite.`,
    );
    process.exit(0);
  }

  fs.mkdirSync(COVERS_DIR, { recursive: true });
  fs.writeFileSync(output, render(input), "utf-8");
  console.log(`✓ Generated ${path.relative(ROOT, output)}`);
  console.log(
    `  title="${input.title}" year=${input.year} tags=[${input.tags.join(", ")}]`,
  );
}

main();
