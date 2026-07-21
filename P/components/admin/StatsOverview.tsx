"use client";

import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Sparkles,
  ClipboardList,
} from "lucide-react";

type Stat = {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Users;
};

const iconWrap =
  "flex h-11 w-11 items-center justify-center rounded-xl bg-[#534AB7]/10 text-[#534AB7]";

export function StatsOverview({
  totalStudents,
  activeSubjects,
  aiAnalyses,
  quizCompletions,
  studentGrowthHint,
}: {
  totalStudents: number;
  activeSubjects: number;
  aiAnalyses: number;
  quizCompletions: number;
  studentGrowthHint?: string;
}) {
  const items: Stat[] = [
    {
      label: "Total Students",
      value: totalStudents.toLocaleString(),
      hint: studentGrowthHint,
      icon: Users,
    },
    {
      label: "Active Subjects",
      value: String(activeSubjects),
      icon: BookOpen,
    },
    {
      label: "AI Analyses",
      value: String(aiAnalyses),
      icon: Sparkles,
    },
    {
      label: "Quiz Completions",
      value: quizCompletions.toLocaleString(),
      icon: ClipboardList,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-2xl border bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#2d2d44]"
          >
            <div className="flex items-center gap-3">
              <div className={iconWrap}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  {item.label}
                </p>
                <p className="text-2xl font-semibold text-heading">
                  {item.value}
                  {item.hint ? (
                    <span className="ml-2 text-sm font-semibold text-[#1D9E75]">
                      {item.hint}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
