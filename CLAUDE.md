# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

**yolklab · personal-portfolio** — a Next.js 16 static-export frontend that wraps "tool" and "game" MDX records and serves as the index page of yolklab's whole work matrix. Sibling project `prompts.yolklab.net` already lives on the same domain root.

The product/release content is plain MDX in `content/`, built into `public/data/index.json` at build time via `scripts/build-index.ts`, and consumed by RSC pages.

See `README.md` for the product-level overview. **This file is for *changing the code*.**

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server at :3000. `predev` runs `build-index.ts` first. |
| `pnpm build` | Production static export to `out/`. `prebuild` runs `build-index.ts`. |
| `pnpm typecheck` | `tsc --noEmit`. The only static check. No lint, no test suite. |
| `pnpm gen:cover <slug>` | Render `public/covers/<slug>.svg` from `scripts/templates/cover.svg.tmpl` using the product's frontmatter. Pass `--force` to overwrite. |
| `pnpm sync:releases` | Pull GitHub Releases for every product with a `kind: source` GitHub entry; write/update `content/releases/*.mdx`. Files marked `manual: true` in their frontmatter are never overwritten. Honors `GITHUB_TOKEN` env var to avoid the 60 req/h anonymous limit. |
| `pnpm vercel-build` | What Vercel runs (currently same as `pnpm build`). |

## Architecture

### Data pipeline

```
content/products/*.mdx        content/releases/*.mdx
            \                        /
             \                      /
              ▼                    ▼
       src/lib/content/loader.ts   (fs read + gray-matter + module-scope cache)
                       │
                       ▼
       scripts/build-index.ts  →  public/data/index.json  (client-side filter source)
                       │
                       ▼
       src/app/**/page.tsx (RSC)   ←  every page calls loader directly, not the JSON.
```

`loader.ts` is the single source of truth. The build-index script and every RSC page funnel through it. Cache is module-scope (per build).

### Routing (all SSG, no dynamic routes)

- `/`, `/works`, `/tools`, `/games`, `/log`, `/about` — static.
- `/works/[slug]` — `generateStaticParams` returns every product's slug.
- `/opengraph-image`, `/apple-icon` — `next/og` `ImageResponse`, both must export `dynamic = "force-static"` under `output: 'export'`.

### Client state

- **Theme** — `next-themes`, `data-theme` attribute, storage key `yolklab-theme`, defaults to `dark`. The dark CSS variant is `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))` — **not** the default Tailwind dark class.
- **Release filter** — local `useState` in `release-timeline.tsx`. Small dataset, no store needed.
- **QR modal** — `useState` in `entry-actions.tsx`. The modal generates the QR data URL via the `qrcode` package on the client.

### Visual system

- Display: **Cormorant Garamond** + 思源宋体 fallback (`--font-display`)
- Body: **Geist** + PingFang SC fallback (`--font-sans`)
- Mono: **JetBrains Mono** + Sarasa Mono SC fallback (`--font-mono`)
- Dark: pitch-warm `oklch(0.12 0.012 60)` + oil gold `oklch(0.78 0.13 78)`
- Light: ivory `oklch(0.985 0.006 85)` + old gold `oklch(0.58 0.14 72)`
- Tokens live entirely in `src/app/globals.css` via `@theme inline` and CSS variables. **No `tailwind.config.ts` — do not create one** (Tailwind v4 reads from CSS).

Strict rules baked into the system:
- No emoji.
- No purple gradients.
- Single accent color (oil gold / old gold).
- No shadows on cards — border-color hover only (`gold-edge` class).
- Serif Display reserved for hero titles, page H1, product titles, year markers.

## Non-obvious gotchas (read before changing)

### Build / framework constraints

- **Page params are Promises in Next.js 16**: `const { slug } = await params;` — required, easy to forget when refactoring.
- **`output: 'export'` forbids**: ISR, `revalidate`, Edge runtime, server actions. Anything dynamic must compute at build time.
- **Do not add `trailingSlash: true`** to `next.config.ts`. Same OG-image redirect trap as the sibling project: most social crawlers (X, Slack, LinkedIn) do not follow the 308.
- **shadcn must be `@canary`** if you add any UI components — stable shadcn is incompatible with Tailwind v4 + React 19. The base Radix primitives we already use (`@radix-ui/react-dialog`, `@radix-ui/react-slot`) don't need it, but a `pnpm dlx shadcn@canary add ...` does.
- **TypeScript ≥ 5.1** is required by Next.js 16. We use 6.x. Earlier versions trigger TS errors on `MDXRemote` async server component usage.

### Tooling

- **`pnpm-workspace.yaml` must list esbuild as allowed build** (`allowBuilds.esbuild: true`). `tsx` (the build-index runner) needs esbuild's postinstall to download the platform binary. `sharp` and `unrs-resolver` are explicitly ignored — we don't use Next.js image optimization (static export + `images.unoptimized`).
- pnpm 11 auto-rewrites `pnpm-workspace.yaml` on install; verify after a fresh `pnpm install` that `esbuild: true` is preserved.

### Hot-reload caches

`loader.ts` caches at module scope, and Next.js 16's dev server reuses cached RSC outputs aggressively. **Any MDX change — new file, edited frontmatter, edited body — requires restarting `pnpm dev`.** `predev` only runs `build-index.ts` once at start; saving a new `.mdx` does not retrigger it, and even if it did, the loader cache held by the RSC pages would still serve the old data. Don't trust hot-reload for content changes; restart.

The only edits that hot-reload cleanly are React components, CSS, and TypeScript code outside `src/lib/content/`.

### `@vercel/og` / Satori

- `apple-icon.tsx` and `opengraph-image.tsx` both export `dynamic = "force-static"`. Without it, static export fails.
- `vercel.json` adds `Content-Type: image/png` headers for `/opengraph-image` and `/apple-icon`, because static export emits without `.png` extension and Vercel's default is `application/octet-stream` (which strict crawlers reject).
- Satori only loads TTF/OTF, not woff/woff2. If you add custom fonts in the OG image, fetch the TTF version (Google Fonts serves TTF only for UA `Mozilla/4.0`).

### Vercel build configuration

- **Do not add `"outputDirectory": "out"` to `vercel.json`**. With `framework: "nextjs"` + `output: "export"`, Vercel's Next.js builder needs to find `routes-manifest.json` in `.next/` (always there during build) while serving static files from `out/` — both happen automatically. Setting `outputDirectory: "out"` makes the builder look for `routes-manifest.json` inside `out/` and fail with `The file "/vercel/path0/out/routes-manifest.json" couldn't be found`. The sibling `liang-prompts` project intentionally omits this field; mirror that.

### Motion / animations

- All animations live in client components — every file using `motion/react` starts with `"use client"`.
- **Do not gate Hero/SectionIndex/RecentStrip reveals behind `useInView`** in the home page. The full-page Playwright screenshot rendered them as `opacity: 0` because IntersectionObserver doesn't trigger during synthetic viewport resize. Use mount-delay staggers instead.
- Path-based page transitions use `motion`'s `AnimatePresence` keyed on `usePathname()` — that's why `<PageTransition>` is currently parked in `src/components/fx/` but not yet wired into `layout.tsx`. Wiring it requires keyed `key={pathname}` on the wrapper around `{children}` and converting the layout to a client wrapper or splitting it.

### Entry kinds and the QR modal

`entry.kind === "wechat"` (or any entry with `qr` set and no `url`) triggers `<QrModal>`. The modal:
1. Uses the static `qr` image if provided (`<Image src={entry.qr}>`).
2. Otherwise, uses `qrcode.toDataURL(entry.url)` to generate at runtime (no build-time generation).
3. Both paths render inside a gold-bordered card with corner ticks (the visual style is hand-coded, not a library).

When adding a wechat entry, the `appid` is purely decorative — shown as small mono caption under the QR. Routing the appid into the actual mini-program scheme would require an additional decision; keep it cosmetic until a real product needs it.

### Release filter quirks

- `release-timeline.tsx`'s `Pills` component is generic over `string | number`. If you add a new filter dimension, keep the value type narrow — comparing `"all"` vs a year as `string | number` works because of `value === o.v` and pill rendering only uses `String(o.v)` as React key.
- The very simple inline-markdown renderer in both `release-feed.tsx` (per-product, on detail page) and `log/page.tsx` (full timeline) is duplicated on purpose — keep them in sync, or extract to `lib/markdown.ts` if you find yourself adding a third copy.

## Adding new products / releases

**Preferred path: the `/portfolio-add-project` skill** (lives in `.claude/skills/portfolio-add-project/SKILL.md`). It collects metadata through structured questions and produces a product MDX + first release MDX + cinematic cover SVG in one shot, then runs `pnpm typecheck` to gate. The same skill supports a `release-only` mode for shipping new versions.

Manual flow (when the skill doesn't fit):

1. Drop a `.mdx` file in `content/products/` or `content/releases/`.
2. For covers, run `pnpm gen:cover <slug>` to render a cover matching the visual language; or place your own image at `public/covers/<slug>.<ext>`.
3. `pnpm dev` will pick it up on next `predev` (which runs automatically). Restart dev only if you edit `loader.ts` parsing logic — the loader's module-scope cache survives hot reload.
4. `pnpm build` regenerates `public/data/index.json` and emits pages for new products.

### Release frontmatter — `manual` and `source` fields

| Field | Meaning |
|---|---|
| `manual: true` | This file is hand-written; `pnpm sync:releases` will not touch it. Use for launch narratives, curated milestones, or anything where the GitHub Release body would lose information. |
| `source: github` | Auto-generated from a GitHub Release. Will be overwritten on every sync — do **not** hand-edit. |
| `source: manual` (or absent) | Same effect as `manual: true` plus a stronger semantic. Either is fine. |
| `githubUrl` | The GitHub release page URL (only for `source: github`). |

The auto-sync writes new files when the product has a `kind: source` entry pointing to `github.com/{owner}/{repo}`. Files are named `content/releases/{published_at[0..10]}-{slug}-v{version}.mdx`. The default cron is daily at UTC 17:23 (Beijing 01:23) via `.github/workflows/sync-releases.yml`, intentionally offset from the sibling project's 18:00 UTC.

When you hand-write a release that mirrors something that exists or will exist on GitHub Releases, **always include `manual: true`** to keep your wording.

## Workflow

- Single-owner repo. Direct push to `main` is the normal flow; Vercel auto-deploys.
- Open a PR only when you want Vercel preview deployment (large redesigns).
- Sibling repo `prompts.yolklab.net` shares the same Vercel account / `yolklab.net` apex.

## Sibling project

`../提示词工具` (deployed at `prompts.yolklab.net`) is the older sibling — same Next.js 16 + Tailwind v4 + static-export stack, but a different aesthetic (cinnabar red + 中文编辑器). When you need a proven solution and don't see one here, look there first:

- **GitHub API via IPv4 + curl fallback** — `提示词工具/src/lib/content/upstream-info.ts`. This portfolio's `scripts/sync-releases.ts` was copied from that pattern. Do not "modernize" it to plain `fetch` — Node 22's IPv6 preference times out on many networks.
- **Submodule sync cron** — `提示词工具/.github/workflows/sync-upstream.yml` runs at 18:00 UTC; this portfolio's `sync-releases.yml` runs at 17:23 UTC to avoid the integer-minute thundering herd and any race when both repos push at once.
- **Vercel + Cloudflare DNS-only** — the sibling's `README.md` documents the SSL/DNS setup; same procedure applies here.

The two projects intentionally do **not** share code, components, or design tokens. Cross-pollinate ideas, not files.

## When changing the brand

- `metadataBase` is `https://yolklab.net` (hardcoded in `src/app/layout.tsx`). Change here if migrating.
- Site name `Yolklab`, slogan `想到就去做，Just Do It！`, and tagline appear in `layout.tsx`, `opengraph-image.tsx`, `apple-icon.tsx`, `nav/site-header.tsx`, `nav/site-footer.tsx`, and `app/about/page.tsx`. Rename in all of them when forking.
