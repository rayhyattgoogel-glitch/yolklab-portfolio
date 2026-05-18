import { PageHeading } from "@/components/nav/page-heading";
import Link from "next/link";

export const metadata = {
  title: "About",
  description: "Yolklab 是 yolklab 的个人作品集 —— 工具、软件、游戏的集中索引。",
};

interface SocialLink {
  label: string;
  href: string;
  handle: string;
  external?: boolean;
}

const SOCIAL: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/yolklab",
    handle: "@yolklab",
    external: true,
  },
  {
    label: "Email",
    href: "mailto:hello@yolklab.net",
    handle: "hello@yolklab.net",
  },
  {
    label: "微信公众号",
    href: "/works",
    handle: "Yolklab · 待开通",
  },
  {
    label: "即刻",
    href: "/works",
    handle: "@yolklab · 待开通",
  },
];

const STACK = [
  { group: "frontend", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4"] },
  { group: "design", items: ["Figma", "shadcn/ui", "Motion", "MDX"] },
  { group: "infra", items: ["Vercel", "Cloudflare DNS", "GitHub Actions"] },
  { group: "side", items: ["Cocos / Phaser", "微信小程序 / 小游戏", "Tauri"] },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
      <PageHeading
        eyebrow="04 / about"
        title="About"
        caption="关于 yolklab · 一个把想法变成可点击作品的地方"
      />

      <div className="pb-32 space-y-24 sm:space-y-32">
        {/* Manifesto */}
        <section className="grid grid-cols-12 gap-6 border-t border-border pt-16">
          <aside className="col-span-12 md:col-span-2 lg:col-span-3 mb-6 md:mb-0">
            <div className="md:sticky md:top-24 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground flex items-start gap-3">
              <span className="block h-px w-7 bg-accent mt-2.5" />
              <span>manifesto<br/><span className="text-subtle-foreground normal-case tracking-normal mt-1 block">宣言</span></span>
            </div>
          </aside>
          <div className="col-span-12 md:col-span-10 lg:col-span-8 prose-yolklab">
            <p className="font-display text-3xl sm:text-4xl leading-snug text-foreground tracking-tight">
              想到就去做，<span className="text-accent italic">Just Do It！</span>
            </p>
            <p>
              <strong>Yolklab</strong> 是 yolklab 的个人作品集 ——
              一个把每一个想法、原型、Side Project 都集中收纳的地方。
              每一个作品都从一个具体的问题出发，被认真地做出来、被使用、再被记录。
            </p>
            <p>
              这里的所有作品都是<strong>个人作品</strong>。
              工具与软件是为了让自己（和愿意一起用的人）的工作变得更顺手；
              游戏是因为做游戏本身就是一件让人开心的事。
              它们形态各异 —— 一个网页、一个 App、一个微信小程序 —— 但内核都是同一件事：
              <em>动手把它做出来</em>。
            </p>
            <p>
              这个站本身也是一件作品。你正在阅读的页面用
              <code>Next.js 16</code> + <code>Tailwind v4</code> +
              <code>MDX</code> 构建，全静态导出部署在 Vercel；
              所有视觉风格（漆黑底 + 火油金 + 衬线 Display + 等宽 Mono）都源自一个克制的电影感美学决定 ——
              <strong>不取悦算法</strong>，只为自己看着舒服。
            </p>
          </div>
        </section>

        {/* Stack */}
        <section className="grid grid-cols-12 gap-6 border-t border-border pt-16">
          <aside className="col-span-12 md:col-span-2 lg:col-span-3 mb-6 md:mb-0">
            <div className="md:sticky md:top-24 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground flex items-start gap-3">
              <span className="block h-px w-7 bg-accent mt-2.5" />
              <span>stack<br/><span className="text-subtle-foreground normal-case tracking-normal mt-1 block">常用工具链</span></span>
            </div>
          </aside>
          <div className="col-span-12 md:col-span-10 lg:col-span-8">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
              {STACK.map((s) => (
                <div key={s.group}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent mb-3">
                    {s.group}
                  </dt>
                  <dd>
                    <ul className="space-y-1.5">
                      {s.items.map((it) => (
                        <li
                          key={it}
                          className="font-display text-xl leading-snug text-foreground"
                        >
                          {it}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Contact */}
        <section className="grid grid-cols-12 gap-6 border-t border-border pt-16">
          <aside className="col-span-12 md:col-span-2 lg:col-span-3 mb-6 md:mb-0">
            <div className="md:sticky md:top-24 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground flex items-start gap-3">
              <span className="block h-px w-7 bg-accent mt-2.5" />
              <span>contact<br/><span className="text-subtle-foreground normal-case tracking-normal mt-1 block">联系方式</span></span>
            </div>
          </aside>
          <div className="col-span-12 md:col-span-10 lg:col-span-8">
            <ul className="border-t border-border">
              {SOCIAL.map((s) => (
                <li key={s.label} className="group border-b border-border">
                  <Link
                    href={s.href}
                    {...(s.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="grid grid-cols-12 items-baseline gap-x-4 py-5 transition-colors hover:bg-surface"
                  >
                    <span className="col-span-5 sm:col-span-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors group-hover:text-accent">
                      {s.label}
                    </span>
                    <span className="col-span-7 sm:col-span-7 font-display text-2xl tracking-tight text-foreground transition-transform duration-400 ease-out group-hover:translate-x-1">
                      {s.handle}
                    </span>
                    <span
                      aria-hidden
                      className="hidden sm:block col-span-2 text-right font-mono text-lg text-muted-foreground transition-all duration-400 ease-out group-hover:text-accent group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-[60ch] font-mono text-[11px] uppercase tracking-[0.22em] text-subtle-foreground leading-relaxed">
              ↑ 占位 · 待 yolklab 替换为真实链接 · 站点已就绪
            </p>
          </div>
        </section>

        {/* Colophon */}
        <section className="grid grid-cols-12 gap-6 border-t border-border pt-16">
          <aside className="col-span-12 md:col-span-2 lg:col-span-3 mb-6 md:mb-0">
            <div className="md:sticky md:top-24 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground flex items-start gap-3">
              <span className="block h-px w-7 bg-accent mt-2.5" />
              <span>colophon<br/><span className="text-subtle-foreground normal-case tracking-normal mt-1 block">关于本站</span></span>
            </div>
          </aside>
          <div className="col-span-12 md:col-span-10 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            <Field label="Display" value="Cormorant Garamond + 思源宋体" />
            <Field label="Body" value="Geist + PingFang SC" />
            <Field label="Mono" value="JetBrains Mono" />
            <Field label="Color · Dark" value="oklch(0.12 0.012 60)" />
            <Field label="Color · Accent" value="oklch(0.78 0.13 78) · oil gold" />
            <Field label="Hosting" value="Vercel · Cloudflare DNS" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-subtle-foreground text-[10px]">{label}</div>
      <div className="mt-1 text-foreground normal-case tracking-normal text-[14px] leading-snug">
        {value}
      </div>
    </div>
  );
}
