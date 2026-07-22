"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Circle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  resolveDashboardIcon,
  type DashboardIconName,
} from "@/components/dashboard/dashboard-icons";

export type DashboardLabRow = {
  id: string;
  title: string;
  difficulty: string | null;
  completed: boolean;
  score: number | null;
};

export type DashboardSubjectLabs = {
  id: string;
  name: string;
  year: number;
  semester: number;
  code: string | null;
  progressPct: number;
  labs: DashboardLabRow[];
  icon: DashboardIconName;
};

type Props = {
  subjects: DashboardSubjectLabs[];
  totalSubjectCount: number;
};

function difficultyTone(d: string | null): string {
  const x = (d ?? "").toLowerCase();
  if (x.includes("advanced")) return "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/40";
  if (x.includes("intermediate")) return "border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950/40";
  return "border-muted bg-muted/50 text-muted-foreground";
}

export function DashboardLabsSection({
  subjects,
  totalSubjectCount,
}: Props) {
  const moreSubjects = Math.max(0, totalSubjectCount - subjects.length);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#005581]">
            Curriculum
          </p>
          <h2 className="mt-1 text-xl font-bold text-heading md:text-2xl">
            Labs by subject
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Every lab opens inside its subject. Pick a module below or jump to
            the full list.
          </p>
        </div>
        <Link
          href="/labs"
          className="inline-flex items-center gap-2 rounded-full border border-[#005581]/30 bg-[#005581]/5 px-4 py-2 text-sm font-semibold text-[#005581] transition hover:bg-[#005581]/10"
        >
          Browse all subjects
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {subjects.map((subject, si) => {
          const Icon = resolveDashboardIcon(subject.icon);
          return (
            <motion.article
              key={subject.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * si, duration: 0.35 }}
              className="flex flex-col overflow-hidden rounded-3xl border bg-card shadow-soft ring-1 ring-black/[0.03] dark:ring-white/[0.06]"
            >
              <div className="border-b bg-gradient-to-br from-[#005581]/[0.07] to-transparent px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#005581]/12 text-[#005581]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold leading-snug text-heading">
                        {subject.name}
                      </h3>
                      {subject.code ? (
                        <Badge
                          variant="secondary"
                          className="shrink-0 rounded-lg text-[10px] font-bold"
                        >
                          {subject.code}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Year {subject.year} · Semester {subject.semester} ·{" "}
                      {subject.labs.length} lab
                      {subject.labs.length !== 1 ? "s" : ""}
                    </p>
                    <div className="mt-3 max-w-sm space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                        <span>Subject progress</span>
                        <span>{subject.progressPct}%</span>
                      </div>
                      <Progress value={subject.progressPct} className="h-2" />
                    </div>
                  </div>
                  <Link
                    href={`/labs/${subject.id}`}
                    className="shrink-0 rounded-xl border border-[#005581]/20 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#005581] shadow-sm transition hover:bg-[#005581]/10 dark:bg-[#0a1f2e]"
                  >
                    Subject hub
                  </Link>
                </div>
              </div>

              <ul className="max-h-[280px] divide-y overflow-y-auto overscroll-contain">
                {subject.labs.length === 0 ? (
                  <li className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No labs published yet.{" "}
                    <Link
                      href={`/labs/${subject.id}`}
                      className="font-semibold text-[#005581] hover:underline"
                    >
                      Open subject page
                    </Link>
                  </li>
                ) : (
                  subject.labs.map((lab) => (
                    <li key={lab.id}>
                      <Link
                        href={`/labs/${subject.id}/${lab.id}`}
                        className="group flex items-center gap-3 px-5 py-3 transition hover:bg-muted/60"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[#005581]/70">
                          {lab.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-[#1D9E75]" />
                          ) : (
                            <Circle className="h-5 w-5 stroke-[1.5]" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-heading group-hover:text-[#005581]">
                            {lab.title}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            {lab.difficulty ? (
                              <span
                                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase ${difficultyTone(lab.difficulty)}`}
                              >
                                {lab.difficulty}
                              </span>
                            ) : null}
                            {lab.completed && lab.score != null ? (
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {lab.score} XP
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-[#005581]" />
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </motion.article>
          );
        })}
      </div>

      {moreSubjects > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/labs" className="font-semibold text-[#005581] hover:underline">
            +{moreSubjects} more subject{moreSubjects !== 1 ? "s" : ""}
          </Link>{" "}
          in the curriculum catalog.
        </p>
      ) : null}
    </section>
  );
}
