---
name: portfolio-add-project
description: Add a new product (tool or game) to the Yolklab personal-portfolio site, or append a new release to an existing product. Use this when the user wants to publish a new project to the portfolio, ship a new version of an existing one, or list a beta/planned product. Produces product MDX + first release MDX + cinematic cover SVG, then typecheck-gates the result.
---

# Portfolio: Add Project / Release

Use this skill to keep the `personal-portfolio` site (Yolklab) consistent every time you add a new work or ship a new version. The skill replaces ad-hoc hand-writing of MDX with a structured pipeline.

## When to use

- The user wants to **publish a new project** to the portfolio (any of: web tool, app, mini-program, game, source release).
- The user wants to **ship a new release** for an existing portfolio product without touching the product metadata.
- The user mentions Yolklab, portfolio, `personal-portfolio`, or "上新作品 / 发新版本".

Do **not** use this skill for:
- Editing a product's body content (just open the MDX directly).
- Changing site chrome / layout / design tokens.
- Working on the sibling `提示词工具` project — that has its own pipeline.

## Modes

Run in one of two modes:

| Mode | Trigger | Outputs |
|---|---|---|
| **new-product** (default) | User wants to add a new work | `content/products/{slug}.mdx` + `content/releases/{date}-{slug}-v1.0.0.mdx` + cover |
| **release-only** | User says "为 {slug} 加一条 release" or passes `--release-only {slug}` | Only `content/releases/{date}-{slug}-v{version}.mdx` |

## Pre-flight

Before asking anything, run:

```bash
ls content/products/                 # to confirm slug uniqueness in new-product mode
ls public/covers/                    # to know what cover assets already exist
```

If `content/products/` is missing, abort — the user is in the wrong project.

## Mode A: new-product

### Step 1 — Structured intake (AskUserQuestion)

Ask **one AskUserQuestion call with 3-4 questions**:

1. **slug** (header `slug`) — free-text via "Other"; validate kebab-case, no leading digit, ≤ 28 chars.
2. **type** (header `类型`) — options: `tool` (工具/软件) | `game` (游戏).
3. **status** (header `状态`) — options: `live` (已上线) | `beta` (公测) | `planned` (筹备中) | `archived` (已归档).
4. **launchedAt** (header `上线日期`) — options: `今天` | `自定义 YYYY-MM-DD`; default to today's date if `今天`.

Then ask **a second AskUserQuestion call** for the entry strategy:

5. **entryKinds** (header `入口形态`, multiSelect: true) — options: `web` | `source` (GitHub) | `wechat` (微信小程序) | `appstore` | `googleplay` | `download` (直接下载) | `mini-app`.
6. **hasCover** (header `封面`) — options: `自动生成` (recommended) | `已有图片` | `暂用纯色占位`.

### Step 2 — Free-text intake

Ask the user as a single prose message (NOT AskUserQuestion — these are open-ended):

> 接下来需要这些文本，可以一次都贴过来：
>
> 1. 中文标题（例：靓开源提示词）
> 2. 一句话简介（≤ 30 字，会出现在卡片副标和封面上）
> 3. 标签（逗号分隔，例：Next.js, AI, MDX；最多 5 个，第一个作为封面 TAG）
> 4. 入口信息：对每个选定的 entry 类型给出 label + url 或 qr 路径
>    - web/source/appstore/googleplay/download → `label` + `url`
>    - wechat/mini-app → `label` + `qr` (相对路径如 /qr/{slug}.png)
> 5. 正文三段（每段一句到一段话即可）：
>    - **项目背景**：从用户视角写「为什么会做这个」，用「想…但…」的句式开头最自然
>    - **项目功能**：3-7 条 bullet，每条以 `**关键词**：` 开头，小白能懂的话术，不要技术黑话
>    - **设计理念**（可选）：3-5 条 bullet，同上格式
> 6. 关联项目（related slugs，逗号分隔，可空）

Parse the user's reply. If any required piece is missing or ambiguous, ask **once** to clarify, never bombard with sub-questions.

### Step 3 — Write product MDX

Target: `content/products/{slug}.mdx`. Template:

```mdx
---
slug: {slug}
title: {title}
type: {type}
status: {status}
year: {year}
launchedAt: {launchedAt}
oneLiner: {oneLiner}
tags: [{tag1}, {tag2}, ...]
cover: /covers/{slug}.svg
entries:
  - kind: {kind}
    label: {label}
    url: {url}        # or `qr: /qr/{slug}.png` for wechat / mini-app
related: [{related1}, ...]
---

## 项目背景

{背景正文}

## 项目功能

- **{关键词1}**：{说明}
- **{关键词2}**：{说明}
...

## 设计理念

- **{理念1}**：{说明}
...
```

Field rules baked in:
- `year` = year part of `launchedAt`
- `tags` array: write Chinese tags as-is, technical names as their canonical casing (`Next.js`, not `nextjs`)
- `entries`: omit any field that's empty; never emit `url:` with empty string
- Use 2-space YAML indentation
- Do **not** write any `cover: /covers/...` other than the auto-generated `.svg` path unless the user picked "已有图片" AND specified an extension

### Step 4 — Cover

Based on the user's `hasCover` choice:

- **自动生成** → run `pnpm gen:cover {slug}`. If it errors, surface the error verbatim and stop — do not improvise.
- **已有图片** → tell the user the exact filename to place: `public/covers/{slug}.{ext}`. Verify with `ls public/covers/{slug}.*` before continuing. Update the product MDX `cover:` field to match the actual extension.
- **暂用纯色占位** → write a minimal placeholder SVG:
  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#1a1612"/><text x="80" y="540" font-family="'Cormorant Garamond',serif" font-size="120" fill="#3d362c">{slug}</text></svg>
  ```
  to `public/covers/{slug}.svg`.

### Step 5 — Write first release MDX

Target: `content/releases/{launchedAt}-{slug}-v1.0.0.mdx`.

```mdx
---
date: "{launchedAt}"
product: {slug}
version: 1.0.0
kind: release
title: 首发上线
manual: true
---

{1-2 句首发说明，来自用户的"项目背景"开头或独立一句}
```

The `manual: true` line is critical — it stops `sync-releases.ts` from overwriting the launch narrative when the user later creates a GitHub Release.

### Step 6 — Verify

```bash
pnpm typecheck
```

If errors, surface them, do **not** auto-fix unless the fix is trivially obvious (typo in frontmatter key).

Then list what was created:

```bash
ls -la content/products/{slug}.mdx content/releases/{launchedAt}-{slug}-v1.0.0.mdx public/covers/{slug}.*
```

### Step 7 — Hand off

Print a 3-line summary in this exact format:

```
✓ Added {slug} ({title}) — {type}, {status}, launched {launchedAt}
  Files: products/{slug}.mdx, releases/{date}-{slug}-v1.0.0.mdx, covers/{slug}.*
  Next: pnpm dev → open http://localhost:3000/works/{slug} → if ok, `git add . && git commit -m "feat({slug}): add product" && git push`
```

Do **not** start the dev server yourself, do **not** commit. The user explicitly drives those.

## Mode B: release-only

### Step 1 — Confirm target

If the slug wasn't passed, ask one AskUserQuestion with options listing the existing slugs from `ls content/products/`. After selection:

```bash
ls content/releases/*-{slug}-*.mdx   # show release history
```

Display the latest version so user can pick the next one.

### Step 2 — Intake

Ask in one prose message:
> 这次的发布信息：
> 1. 版本号（例：1.1.0；遵循 semver）
> 2. 发布日期（默认今天）
> 3. 类型（release / feature / fix / major）
> 4. 标题（一句话；例：新增收藏夹与暗色主题）
> 5. 变更明细（3-5 条 bullet，每条以 `**关键词**：` 开头）

### Step 3 — Decide source flag

Ask one AskUserQuestion:

> 这条 release 是否要让 GitHub Releases 同步任务覆盖？

Options:
- `不覆盖（manual: true，推荐手写文案场景）` — write `manual: true` in frontmatter
- `允许覆盖（让 GitHub Release 作为真源）` — omit `manual`; sync will overwrite next run

### Step 4 — Write

Target: `content/releases/{date}-{slug}-v{version}.mdx`. Template:

```mdx
---
date: "{date}"
product: {slug}
version: {version}
kind: {kind}
title: {title}
manual: true      # only if user picked "不覆盖"
---

- **{关键词1}**：{说明}
- **{关键词2}**：{说明}
...
```

### Step 5 — Verify & hand off

Same as Mode A: `pnpm typecheck` → print summary → leave dev/commit to user.

## Hard rules

These rules are non-negotiable. If you can't satisfy them, stop and tell the user, do not improvise around them.

1. **One MDX file per release, one per product** — never bundle, never split across files.
2. **No emoji** anywhere in frontmatter or body. The user's global memory says no AI slop.
3. **No Inter / Roboto / system-ui font references** anywhere — the site uses Cormorant Garamond + Geist + JetBrains Mono.
4. **Tags must be ≤ 5** and the first tag becomes the cover's TAG line — order matters.
5. **slug uniqueness** — for new-product mode, `content/products/{slug}.mdx` must not exist; if it does, ask the user whether to use Mode B (release-only) instead.
6. **`launchedAt` and release `date` are always quoted strings** in frontmatter (`"2026-05-18"`), not bare YAML dates — gray-matter will otherwise convert them to Date objects.
7. **Never run `git commit` or `git push`** — the user always drives those.
8. **Never edit `loader.ts`, `types.ts`, components, or design tokens** as part of this skill — those are separate, deliberate changes.

## Escape hatch

If a request doesn't fit either mode cleanly (e.g., the user wants a multi-entry product with three QR codes plus app store links, or a product whose body doesn't fit the 三段 structure), ASK before improvising:

> 这个项目的形态不太适合标准模板（{原因}）。要：
> A. 用标准模板尽力贴近，事后手动微调
> B. 退出 skill，直接手写 MDX
> C. 修改模板结构（需要先讨论）

Default to A unless the user picks B.
