import Link from "next/link";
import type { Diary } from "@/lib/content/types";

function groupByYear(diaries: Diary[]): [string, Diary[]][] {
  const map = new Map<string, Diary[]>();
  for (const d of diaries) {
    const year = d.date.slice(0, 4) || "—";
    const bucket = map.get(year);
    if (bucket) bucket.push(d);
    else map.set(year, [d]);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export function DiaryList({ items }: { items: Diary[] }) {
  if (items.length === 0) {
    return (
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground">
        no entries yet
      </p>
    );
  }

  const groups = groupByYear(items);

  return (
    <div className="flex flex-col gap-16">
      {groups.map(([year, entries]) => (
        <section key={year}>
          <div className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            <span className="block h-px w-7 bg-accent" />
            <span className="font-display text-2xl tracking-tight text-foreground not-italic">
              {year}
            </span>
            <span>· {entries.length.toString().padStart(2, "0")}</span>
          </div>

          <ul className="flex flex-col gap-5">
            {entries.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/diary/${d.slug}`}
                  className="block gold-edge border border-border p-6 sm:p-8"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip">{d.date}</span>
                    {d.tags.slice(0, 3).map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-5 font-display text-3xl sm:text-4xl tracking-tight leading-[1.1] text-foreground">
                    {d.title}
                  </h2>
                  {d.summary && (
                    <p className="mt-4 max-w-[70ch] text-base leading-relaxed text-muted-foreground line-clamp-3">
                      {d.summary}
                    </p>
                  )}
                  <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    read
                    <span aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
