"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  resolveDashboardIcon,
  type DashboardIconName,
} from "@/components/dashboard/dashboard-icons";

type Props = {
  title: string;
  subtitle: string;
  progress: number;
  href: string;
  icon: DashboardIconName;
  delay?: number;
};

export function SubjectCard({
  title,
  subtitle,
  progress,
  href,
  icon,
  delay = 0,
}: Props) {
  const Icon = resolveDashboardIcon(icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileHover={{ y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Link
        href={href}
        className="block rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-md"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#005581]/10 text-[#005581]">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-heading">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[#6b7280]">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>
      </Link>
    </motion.div>
  );
}
