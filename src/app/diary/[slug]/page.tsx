import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { DiaryMarkdown } from "@/components/diary/diary-markdown";
import { loadAllDiaries, loadDiaryBySlug } from "@/lib/content/loader";

export function generateStaticParams() {
  return loadAllDiaries().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const diary = loadDiaryBySlug(slug);
  if (!diary) return {};
  return {
    title: diary.title,
    description: diary.summary,
    openGraph: {
      type: "article",
      title: diary.title,
      description: diary.summary,
    },
    twitter: {
      card: "summary_large_image",
      title: diary.title,
      description: diary.summary,
    },
  };
}

export default async function DiaryEntryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const diary = loadDiaryBySlug(slug);
  if (!diary) return notFound();

  return (
    <article className="mx-auto max-w-[1480px] px-6 sm:px-10 pb-32">
      {/* Back link */}
      <nav className="pt-10 sm:pt-16">
        <Link
          href="/diary"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-accent"
        >
          <span aria-hidden>←</span>
          back to diary
        </Link>
      </nav>

      {/* Hero — meta + title */}
      <header className="pt-12 sm:pt-20">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-accent">{diary.date}</span>
          {diary.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        <h1
          className="mt-8 font-display tracking-[-0.03em] leading-[1.02] text-foreground"
          style={{ fontSize: "clamp(2.5rem, 6.5vw, 5.5rem)", fontWeight: 400 }}
        >
          {diary.title}
        </h1>

        {diary.summary && (
          <p className="mt-8 max-w-[70ch] text-xl leading-relaxed text-muted-foreground">
            {diary.summary}
          </p>
        )}
      </header>

      {/* Cover banner */}
      {diary.cover && (
        <figure className="mt-14 sm:mt-20 relative overflow-hidden border border-border">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={diary.cover}
              alt={`${diary.title} · cover`}
              fill
              priority
              sizes="(min-width: 1480px) 1480px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        </figure>
      )}

      {/* Body */}
      <section className="pt-14 sm:pt-16">
        <DiaryMarkdown source={diary.body} />
      </section>
    </article>
  );
}
