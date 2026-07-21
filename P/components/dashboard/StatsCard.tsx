"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  resolveDashboardIcon,
  type DashboardIconName,
} from "@/components/dashboard/dashboard-icons";

type Props = {
  icon: DashboardIconName;
  label: string;
  value: string | number;
  hint?: string;
  highlight?: boolean;
  delay?: number;
};

export function StatsCard({
  icon,
  label,
  value,
  hint,
  highlight,
  delay = 0,
}: Props) {
  const Icon = resolveDashboardIcon(icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        "rounded-2xl border border-transparent bg-card p-5 shadow-soft",
        highlight && "border-[#1D9E75]/40 ring-1 ring-[#1D9E75]/25"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#534AB7]/10 text-[#534AB7] dark:bg-[#6B5FD6]/20 dark:text-[#6B5FD6]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            {label}
          </p>
          <p className="text-xl font-semibold text-heading">{value}</p>
          {hint ? (
            <p className="text-xs font-medium text-[#1D9E75]">{hint}</p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
