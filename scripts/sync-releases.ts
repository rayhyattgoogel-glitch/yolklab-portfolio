/**
 * Sync release notes from GitHub Releases API into content/releases/*.mdx.
 *
 * For every product entry of kind="source" pointing at github.com, fetch
 * the repo's releases, then write/update one MDX file per release.
 *
 * Existing MDX files marked with `manual: true` in their frontmatter are
 * NEVER overwritten — those are hand-curated narratives.
 *
 * Network strategy mirrors 提示词工具/src/lib/content/upstream-info.ts:
 *   - node:https with { family: 4 } (Node 22's IPv6 preference is flaky)
 *   - curl fallback when https fails
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import matter from "gray-matter";
import { loadAllProducts } from "../src/lib/content/loader";
import type { Product, ReleaseKind } from "../src/lib/content/types";

const RELEASES_DIR = path.resolve(process.cwd(), "content/releases");
const USER_AGENT = "yolklab-portfolio-sync/0.1";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

interface GithubRelease {
  tag_name: string;
  name?: string | null;
  body?: string | null;
  draft?: boolean;
  prerelease?: boolean;
  published_at?: string | null;
  created_at?: string | null;
  html_url?: string;
}

interface SyncResult {
  product: string;
  repo: string;
  fetched: number;
  written: number;
  skippedManual: number;
  unchanged: number;
  error?: string;
}

function authHeaders(): Record<string, string> {
  const base: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) base.Authorization = `Bearer ${TOKEN}`;
  return base;
}

function fetchJsonViaHttps<T>(url: string, timeoutMs = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        family: 4,
        timeout: timeoutMs,
        headers: authHeaders(),
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status < 200 || status >= 300) {
          reject(new Error(`HTTP ${status} ${res.statusMessage ?? ""}`.trim()));
          res.resume();
          return;
        }
        let body = "";
        res.setEncoding("utf-8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body) as T);
          } catch (err) {
            reject(err);
          }
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("ETIMEDOUT"));
    });
    req.end();
  });
}

function fetchJsonViaCurl<T>(url: string, timeoutSec = 12): T {
  const headerArgs = [
    `-H "Accept: application/vnd.github+json"`,
    `-H "User-Agent: ${USER_AGENT}"`,
    `-H "X-GitHub-Api-Version: 2022-11-28"`,
  ];
  if (TOKEN) headerArgs.push(`-H "Authorization: Bearer ${TOKEN}"`);
  const cmd = `curl -fsS --max-time ${timeoutSec} ${headerArgs.join(" ")} "${url}"`;
  const out = execSync(cmd, {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(out) as T;
}

async function fetchJson<T>(url: string): Promise<T> {
  try {
    return await fetchJsonViaHttps<T>(url);
  } catch (httpsErr) {
    try {
      return fetchJsonViaCurl<T>(url);
    } catch (curlErr) {
      throw new Error(
        `Both https (${(httpsErr as Error).message}) and curl (${(curlErr as Error).message}) failed for ${url}`,
      );
    }
  }
}

function parseGithubRepo(url: string | undefined): { owner: string; repo: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com" && u.hostname !== "www.github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const repo = parts[1].replace(/\.git$/, "");
    return { owner: parts[0], repo };
  } catch {
    return null;
  }
}

function normalizeVersion(tag: string): string {
  return tag.replace(/^v/i, "").trim();
}

function inferKind(version: string, name: string | null | undefined): ReleaseKind {
  const major = /^\d+\.0\.0$/.test(version);
  if (major) return version.startsWith("1.0.0") ? "release" : "major";
  if (/^\d+\.\d+\.0$/.test(version)) return "feature";
  if (/^\d+\.\d+\.\d+/.test(version)) return "fix";
  const n = (name ?? "").toLowerCase();
  if (n.includes("fix") || n.includes("patch")) return "fix";
  if (n.includes("feature") || n.includes("feat")) return "feature";
  return "release";
}

function targetPath(product: string, dateIso: string, version: string): string {
  const date = dateIso.slice(0, 10);
  return path.join(RELEASES_DIR, `${date}-${product}-v${version}.mdx`);
}

function isManual(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(raw);
    return parsed.data?.manual === true;
  } catch {
    return false;
  }
}

function escapeYamlString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function renderMdx(args: {
  date: string;
  product: string;
  version: string;
  kind: ReleaseKind;
  title: string;
  htmlUrl: string;
  body: string;
}): string {
  const front = [
    "---",
    `date: "${args.date}"`,
    `product: ${args.product}`,
    `version: ${args.version}`,
    `kind: ${args.kind}`,
    `title: "${escapeYamlString(args.title)}"`,
    `source: github`,
    `githubUrl: ${args.htmlUrl}`,
    "---",
    "",
  ].join("\n");
  const body = args.body.trim() || "_发布说明待补充_";
  return `${front}${body}\n`;
}

async function syncProduct(product: Product): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  const sources = product.entries.filter(
    (e) => e.kind === "source" && parseGithubRepo(e.url) !== null,
  );
  if (sources.length === 0) return results;

  for (const entry of sources) {
    const parsed = parseGithubRepo(entry.url);
    if (!parsed) continue;
    const repo = `${parsed.owner}/${parsed.repo}`;
    const result: SyncResult = {
      product: product.slug,
      repo,
      fetched: 0,
      written: 0,
      skippedManual: 0,
      unchanged: 0,
    };
    try {
      const releases = await fetchJson<GithubRelease[]>(
        `https://api.github.com/repos/${repo}/releases?per_page=100`,
      );
      const active = releases.filter((r) => !r.draft && !r.prerelease);
      result.fetched = active.length;

      for (const r of active) {
        const version = normalizeVersion(r.tag_name);
        if (!version) continue;
        const dateIso =
          (r.published_at ?? r.created_at ?? "").slice(0, 10) ||
          new Date().toISOString().slice(0, 10);
        const file = targetPath(product.slug, dateIso, version);

        if (isManual(file)) {
          result.skippedManual += 1;
          continue;
        }

        const title = (r.name ?? "").trim() || `v${version}`;
        const kind = inferKind(version, r.name);
        const next = renderMdx({
          date: dateIso,
          product: product.slug,
          version,
          kind,
          title,
          htmlUrl: r.html_url ?? `https://github.com/${repo}/releases/tag/${r.tag_name}`,
          body: r.body ?? "",
        });

        const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
        if (prev === next) {
          result.unchanged += 1;
        } else {
          fs.writeFileSync(file, next, "utf-8");
          result.written += 1;
        }
      }
    } catch (err) {
      result.error = (err as Error).message;
    }
    results.push(result);
  }
  return results;
}

async function main(): Promise<void> {
  if (!fs.existsSync(RELEASES_DIR)) {
    fs.mkdirSync(RELEASES_DIR, { recursive: true });
  }

  const products = loadAllProducts();
  if (products.length === 0) {
    console.warn("[sync-releases] no products loaded; nothing to do.");
    return;
  }

  console.log(
    `[sync-releases] scanning ${products.length} product(s); token: ${TOKEN ? "present" : "anonymous"}`,
  );

  let totalWritten = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  for (const product of products) {
    const results = await syncProduct(product);
    for (const r of results) {
      if (r.error) {
        totalErrors += 1;
        console.error(
          `  ✗ ${product.slug} ← ${r.repo}: ${r.error}`,
        );
        continue;
      }
      totalWritten += r.written;
      totalSkipped += r.skippedManual;
      console.log(
        `  · ${product.slug} ← ${r.repo}: fetched=${r.fetched} written=${r.written} unchanged=${r.unchanged} manual=${r.skippedManual}`,
      );
    }
  }

  console.log(
    `[sync-releases] done. written=${totalWritten} skipped(manual)=${totalSkipped} errors=${totalErrors}`,
  );

  if (totalErrors > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("[sync-releases] fatal:", err);
  process.exit(1);
});
