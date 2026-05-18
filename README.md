# yolklab · personal-portfolio

> 想到就去做，Just Do It！

[![Vercel](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://yolklab.net)

一个电影感的个人作品索引站，记录 **yolklab** 做的所有「工具/软件」与「游戏」类作品，附带一条统一的 **Release Notes** 时间线。

- **生产域名**：[yolklab.net](https://yolklab.net)
- **作品形态**：网页、App 下载、微信小程序二维码、源码链接 —— 都可以挂载在一个产品上
- **风格**：漆黑底 + 火油金点缀 · 衬线 Display（Cormorant + 思源宋体）+ 等宽 Mono（JetBrains Mono）· 严格遵守反 AI-slop 美学

## 技术栈

- **Next.js 16** · React 19 · TypeScript 6 · 全静态导出（`output: "export"`）
- **Tailwind v4**（CSS-first 配置，无 `tailwind.config.ts`）+ `tw-animate-css`
- **MDX**（`next-mdx-remote/rsc`）+ `gray-matter` + `fast-glob`
- **Motion** —— 动效（Hero stagger / 路由转场 / QR modal）
- **next-themes** —— Light / Dark 双主题切换（默认 Dark）
- **shadcn @canary** —— 适配 Tailwind v4 + React 19
- **qrcode** —— 微信小程序二维码运行时生成
- **Vercel** + GitHub Actions

## 命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 本地开发（自动跑 `prebuild` 生成索引） |
| `pnpm build` | 生产构建到 `out/`（静态导出） |
| `pnpm start` | 本地预览 production build |
| `pnpm typecheck` | `tsc --noEmit`，唯一的静态检查（无 lint，无 test） |
| `pnpm vercel-build` | Vercel 部署用的 build 命令 |

## 添加新作品

> 全部内容以 MDX 文件维护，加文件 → push → Vercel 自动部署。

### 添加一个产品

在 `content/products/<slug>.mdx`：

```mdx
---
slug: my-cool-tool
title: 我的工具
type: tool                  # tool | game
status: live                # live | beta | archived | planned
year: 2026
launchedAt: "2026-05-18"
oneLiner: 一句话简介
tags: [Next.js, AI]
cover: /covers/my-cool-tool.svg
entries:
  - kind: web
    label: 在线访问
    url: https://example.com
  - kind: wechat
    label: 微信小程序
    qr: /qr/my-cool-tool.png    # 或者省略 qr 用 url 自动生成
    appid: wx12345
  - kind: download
    label: macOS 下载
    url: https://example.com/app.dmg
  - kind: source
    label: GitHub
    url: https://github.com/yolklab/my-cool-tool
related: [other-slug]
---

正文（MDX）—— 介绍 / 设计理念 / 技术栈 / 部署 ……
```

入口类型 `kind` 支持：`web` · `appstore` · `googleplay` · `download` · `wechat` · `mini-app` · `source`。

`wechat` 类型会触发二维码弹窗 —— 优先用 `qr`（静态图片）；如果只填了 `url`，会用 `qrcode` 库在运行时生成 Data URL。

### 添加一条 Release Notes

在 `content/releases/<date>-<product>-<version>.mdx`：

```mdx
---
date: "2026-05-18"
product: my-cool-tool       # 必须对应某个产品的 slug
version: 1.0.0
kind: release               # major | feature | fix | release
title: 首发上线
---

正文（短）—— 变更说明。支持 **粗体**、`代码` 和 - 列表 这种轻量 markdown。
```

## 路由

| 路径 | 内容 |
|---|---|
| `/` | Hero + 章节索引 + 最近更新 |
| `/works` | 全部作品 |
| `/tools` | 工具/软件子集 |
| `/games` | 游戏子集 |
| `/works/[slug]` | 产品详情（MDX 正文 + 多入口 + 关联 releases + 相关作品） |
| `/log` | Release Notes 时间线（按 type / year 筛选） |
| `/about` | 自我介绍 + 联系方式 + 工具链 |

## 部署

- 在 Vercel 连接此仓库即可，构建命令走 `pnpm vercel-build`（已在 `vercel.json` 配好）
- DNS：Cloudflare DNS-only → Vercel，Let's Encrypt 自动签发

## License

MIT
