"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { Target, Zap } from "lucide-react";
import type { WeeklyEngagement } from "@/lib/engagement-stats";

/** Weekly quiz completion activity + KPIs (fed from server aggregates). */
export function EngagementChart({ data }: { data: WeeklyEngagement }) {
  const deltaStr =
    data.weekOverWeekPct === null
      ? "No prior week data"
      : `${data.weekOverWeekPct >= 0 ? "+" : ""}${data.weekOverWeekPct}% vs prior week`;

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#0a1f2e]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-heading">
            Student Engagement
          </h3>
          <p className="text-xs text-muted-foreground">
            Quiz completions — last 7 days
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground">
          Live data
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chart}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(83,74,183,0.06)" }}
              contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
            />
            <Bar
              dataKey="activity"
              fill="#005581"
              radius={[8, 8, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl bg-[#FFFFFA] p-3 dark:bg-[#05131e]"
        >
          <Target className="h-8 w-8 text-[#005581]" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              Busiest day
            </p>
            <p className="text-lg font-bold text-heading">
              {data.peakCount} completions
            </p>
            <p className="text-xs text-muted-foreground">{data.peakDayLabel}</p>
            {data.peakCount > 0 ? (
              <p className="text-xs text-muted-foreground">
                Highest single-day volume this week
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                No quiz completions in this window yet
              </p>
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-3 rounded-xl bg-[#FFFFFA] p-3 dark:bg-[#05131e]"
        >
          <Zap className="h-8 w-8 text-[#1D9E75]" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              Quiz completions
            </p>
            <p className="text-lg font-bold text-[#1D9E75]">
              {data.weekTotal} this week
            </p>
            <p className="text-xs text-muted-foreground">{deltaStr}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
