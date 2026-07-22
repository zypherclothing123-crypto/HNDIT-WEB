import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export default async function LabsIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, year, semester, code")
    .order("year")
    .order("semester");

  const list = subjects ?? [];
  const subjectIds = list.map((s) => s.id);
  const { data: labRows } =
    subjectIds.length > 0
      ? await supabase
          .from("labs")
          .select("id, subject_id")
          .in("subject_id", subjectIds)
      : { data: [] as { id: string; subject_id: string }[] };

  const labCountBySubject = new Map<string, number>();
  const labIdsBySubject = new Map<string, string[]>();
  for (const row of labRows ?? []) {
    const sid = row.subject_id as string;
    const lid = row.id as string;
    labCountBySubject.set(sid, (labCountBySubject.get(sid) ?? 0) + 1);
    const arr = labIdsBySubject.get(sid) ?? [];
    arr.push(lid);
    labIdsBySubject.set(sid, arr);
  }

  const progressBySubject = new Map<string, number>();
  if (user && (labRows ?? []).length > 0) {
    const allLabIds = (labRows ?? []).map((r) => r.id as string);
    const { data: progress } = await supabase
      .from("user_progress")
      .select("lab_id, completed")
      .eq("user_id", user!.id)
      .in("lab_id", allLabIds);

    const completedLabs = new Set(
      (progress ?? [])
        .filter((p) => p.completed)
        .map((p) => p.lab_id as string)
    );

    for (const [sid, labIds] of Array.from(labIdsBySubject.entries())) {
      const done = labIds.filter((id) => completedLabs.has(id)).length;
      const pct =
        labIds.length === 0 ? 0 : Math.round((done / labIds.length) * 100);
      progressBySubject.set(sid, pct);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-3xl border-2 border-slate-100 bg-gradient-to-br from-[#005581]/5 via-white to-white px-6 py-8 shadow-md dark:border-white/5 dark:from-[#005581]/20 dark:via-[#0a1f2e] dark:to-[#0a1f2e] md:px-10 md:py-10">
        <p className="text-xs font-black uppercase tracking-widest text-[#005581] dark:text-[#72CDF4]">
          Curriculum
        </p>
        <h1 className="mt-2 text-2xl font-bold text-heading md:text-3xl">
          Subjects &amp; labs
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          Choose a subject to see every lab for that module. Each lab opens at{" "}
          <span className="font-mono text-xs font-semibold text-heading">
            /labs/[subject]/[lab]
          </span>{" "}
          so you always stay in the right course context.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const n = labCountBySubject.get(s.id) ?? 0;
          const progressPct = progressBySubject.get(s.id);
          return (
            <Link
              key={s.id}
              href={`/labs/${s.id}`}
              className="group relative flex flex-col gap-4 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#72CDF4] hover:shadow-xl dark:border-white/5 dark:bg-[#0a1f2e] dark:hover:border-[#72CDF4]/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#005581]/10 text-[#005581] transition-transform group-hover:scale-110 group-hover:bg-[#005581] group-hover:text-white dark:bg-[#72CDF4]/10 dark:text-[#72CDF4] dark:group-hover:bg-[#72CDF4] dark:group-hover:text-[#001824]">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold leading-snug text-heading group-hover:text-[#005581]">
                      {s.name}
                    </p>
                    {s.code ? (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                        {s.code}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      Year {s.year} · Semester {s.semester} · {n} lab{n !== 1 ? "s" : ""}
                    </p>
                    <span className="text-sm font-bold text-heading">
                      {progressPct}%
                    </span>
                  </div>
                  <div className="h-2.5 mt-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#005581] to-[#72CDF4] transition-all duration-1000 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-[#005581]" />
              </div>
            </Link>
          );
        })}
      </div>

      {!list.length ? (
        <p className="text-center text-sm text-muted-foreground">
          No subjects yet. An admin can add them from the admin panel.
        </p>
      ) : null}
    </div>
  );
}
