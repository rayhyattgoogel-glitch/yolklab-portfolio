import { PageHeading } from "@/components/nav/page-heading";
import { DiaryList } from "@/components/diary/diary-list";
import { loadAllDiaries } from "@/lib/content/loader";

export const metadata = {
  title: "Diary · 开发日记",
};

export default function DiaryPage() {
  const diaries = loadAllDiaries();

  return (
    <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
      <PageHeading
        eyebrow="04 / diary"
        title="Diary"
        caption="开发随笔 · 做东西过程里的记录与复盘 · 按时间倒序"
        meta={`${diaries.length.toString().padStart(2, "0")} entries`}
      />
      <section className="pb-32">
        <DiaryList items={diaries} />
      </section>
    </div>
  );
}
