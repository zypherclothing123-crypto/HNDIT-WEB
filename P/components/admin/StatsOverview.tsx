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

const iconStyles: Record<string, string> = {
  "Total Students": "bg-[#ffd200]/15 text-[#ffd200]",
  "Active Subjects": "bg-[#72CDF4]/15 text-[#72CDF4]",
  "AI Analyses": "bg-[#005581]/15 text-[#005581]",
  "Quiz Completions": "bg-emerald-500/15 text-emerald-500",
};

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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ delay: 0.05 * i, type: "spring", stiffness: 300 }}
            className="group rounded-3xl border-2 bg-white p-6 shadow-sm transition-all hover:border-[#72CDF4] hover:shadow-lg dark:border-white/10 dark:bg-[#0a1f2e]"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconStyles[item.label] || "bg-slate-100 text-slate-500"}`}>
                <Icon className="h-6 w-6" />
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
