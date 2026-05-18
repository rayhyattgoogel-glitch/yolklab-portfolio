import fs from "node:fs";
import path from "node:path";
import { loadAllProducts, loadAllReleases } from "../src/lib/content/loader";
import type { SiteIndex } from "../src/lib/content/types";

const OUT = path.resolve(process.cwd(), "public/data/index.json");

function main() {
  const products = loadAllProducts();
  const releases = loadAllReleases();

  const productTitleBySlug = new Map(products.map((p) => [p.slug, p.title]));
  const productTypeBySlug = new Map(products.map((p) => [p.slug, p.type]));

  const productIndexes = products.map((p) => {
    const productReleases = releases.filter((r) => r.product === p.slug);
    return {
      slug: p.slug,
      title: p.title,
      type: p.type,
      status: p.status,
      year: p.year,
      launchedAt: p.launchedAt,
      oneLiner: p.oneLiner,
      tags: p.tags,
      cover: p.cover,
      entryCount: p.entries.length,
      hasQr: p.entries.some((e) => e.kind === "wechat" || !!e.qr),
      releaseCount: productReleases.length,
      latestRelease: productReleases[0]?.date,
    };
  });

  const releaseIndexes = releases.map((r) => ({
    product: r.product,
    productTitle: productTitleBySlug.get(r.product) ?? r.product,
    productType: productTypeBySlug.get(r.product) ?? "tool",
    date: r.date,
    version: r.version,
    kind: r.kind,
    title: r.title,
  }));

  const index: SiteIndex = {
    generatedAt: new Date().toISOString(),
    products: productIndexes,
    releases: releaseIndexes,
    counts: {
      tools: products.filter((p) => p.type === "tool").length,
      games: products.filter((p) => p.type === "game").length,
      total: products.length,
      releases: releases.length,
    },
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(index, null, 2), "utf-8");

  const sizeKb = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(
    `✓ Built site index → ${path.relative(process.cwd(), OUT)} (${sizeKb} KB)\n` +
      `  tools: ${index.counts.tools}  games: ${index.counts.games}  products: ${index.counts.total}\n` +
      `  releases: ${index.counts.releases}`,
  );
}

main();
