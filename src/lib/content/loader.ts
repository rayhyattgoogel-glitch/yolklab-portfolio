import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import type {
  Product,
  ProductEntry,
  ProductStatus,
  ProductType,
  Release,
  ReleaseKind,
} from "./types";

const ROOT = path.resolve(process.cwd(), "content");
const PRODUCTS_DIR = path.join(ROOT, "products");
const RELEASES_DIR = path.join(ROOT, "releases");

let productCache: Product[] | null = null;
let releaseCache: Release[] | null = null;

function asString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") return String(v);
  return fallback;
}

function asNumber(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseInt(v, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function parseEntries(v: unknown): ProductEntry[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((raw): ProductEntry | null => {
      if (!raw || typeof raw !== "object") return null;
      const r = raw as Record<string, unknown>;
      const kind = asString(r.kind) as ProductEntry["kind"];
      if (!kind) return null;
      return {
        kind,
        label: asString(r.label, kind),
        url: asString(r.url) || undefined,
        qr: asString(r.qr) || undefined,
        appid: asString(r.appid) || undefined,
      };
    })
    .filter((e): e is ProductEntry => e !== null);
}

export function loadAllProducts(): Product[] {
  if (productCache) return productCache;

  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.warn(
      `[content] Products directory missing: ${PRODUCTS_DIR}. Skipping.`,
    );
    productCache = [];
    return productCache;
  }

  const files = fg.sync("*.mdx", { cwd: PRODUCTS_DIR, absolute: true });
  const records: Product[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;
    const slug = asString(fm.slug, path.basename(file, ".mdx"));
    const type = (asString(fm.type) as ProductType) || "tool";
    const status = (asString(fm.status) as ProductStatus) || "live";

    records.push({
      slug,
      title: asString(fm.title, slug),
      type,
      status,
      year: asNumber(fm.year, new Date().getFullYear()),
      launchedAt: asString(fm.launchedAt) || undefined,
      oneLiner: asString(fm.oneLiner),
      tags: asArray<unknown>(fm.tags).map((t) => asString(t)).filter(Boolean),
      cover: asString(fm.cover) || undefined,
      ogImage: asString(fm.ogImage) || undefined,
      entries: parseEntries(fm.entries),
      related: asArray<unknown>(fm.related).map((t) => asString(t)).filter(Boolean),
      body: parsed.content.trim(),
      filePath: path.relative(process.cwd(), file),
    });
  }

  records.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const al = a.launchedAt ?? "";
    const bl = b.launchedAt ?? "";
    if (al !== bl) return bl.localeCompare(al);
    return a.title.localeCompare(b.title, "zh-CN");
  });

  productCache = records;
  return records;
}

export function loadProductBySlug(slug: string): Product | undefined {
  return loadAllProducts().find((p) => p.slug === slug);
}

export function loadProductsByType(type: ProductType): Product[] {
  return loadAllProducts().filter((p) => p.type === type);
}

export function loadAllReleases(): Release[] {
  if (releaseCache) return releaseCache;

  if (!fs.existsSync(RELEASES_DIR)) {
    console.warn(
      `[content] Releases directory missing: ${RELEASES_DIR}. Skipping.`,
    );
    releaseCache = [];
    return releaseCache;
  }

  const files = fg.sync("*.mdx", { cwd: RELEASES_DIR, absolute: true });
  const records: Release[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;
    const rawSource = asString(fm.source);
    const source =
      rawSource === "github" || rawSource === "manual"
        ? (rawSource as "github" | "manual")
        : undefined;
    records.push({
      product: asString(fm.product),
      date: asString(fm.date),
      version: asString(fm.version),
      kind: (asString(fm.kind) as ReleaseKind) || "release",
      title: asString(fm.title),
      body: parsed.content.trim(),
      filePath: path.relative(process.cwd(), file),
      manual: fm.manual === true ? true : undefined,
      source,
      githubUrl: asString(fm.githubUrl) || undefined,
    });
  }

  records.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    // Same date: newer version on top (lexical works for semver like 1.10.0 > 1.2.0 only if zero-padded;
    // here we have plain semver, so localeCompare with numeric collation handles it.)
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });
  releaseCache = records;
  return records;
}

export function loadReleasesByProduct(productSlug: string): Release[] {
  return loadAllReleases().filter((r) => r.product === productSlug);
}

export function loadRecentReleases(limit = 5): Release[] {
  return loadAllReleases().slice(0, limit);
}
