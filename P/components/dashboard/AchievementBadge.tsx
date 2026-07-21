"use client";

import { motion } from "framer-motion";
import {
  resolveDashboardIcon,
  type DashboardIconName,
} from "@/components/dashboard/dashboard-icons";

type Props = {
  title: string;
  description: string;
  icon: DashboardIconName;
  tone: "gold" | "blue" | "green";
};

const tones: Record<Props["tone"], string> = {
  gold: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  blue: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
};

export function AchievementBadge({
  title,
  description,
  icon,
  tone,
}: Props) {
  const Icon = resolveDashboardIcon(icon);
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border bg-card p-5 shadow-soft"
    >
      <div
        className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${tones[tone]}`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h4 className="text-center text-base font-bold text-heading">{title}</h4>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}
