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
            <defs>
              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#72CDF4" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#005581" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(114,205,244,0.1)" }}
              contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb", border: "2px solid #72CDF4" }}
            />
            <Bar
              dataKey="activity"
              fill="url(#colorActivity)"
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
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex items-center gap-3 rounded-2xl border-2 border-transparent bg-[#FFFFFA] p-4 shadow-sm transition-all hover:border-[#ffd200] hover:shadow-md dark:bg-[#05131e]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffd200]/15">
            <Target className="h-6 w-6 text-[#ffd200]" />
          </div>
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
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 300 }}
          className="flex items-center gap-3 rounded-2xl border-2 border-transparent bg-[#FFFFFA] p-4 shadow-sm transition-all hover:border-[#72CDF4] hover:shadow-md dark:bg-[#05131e]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#72CDF4]/15">
            <Zap className="h-6 w-6 text-[#72CDF4]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              Quiz completions
            </p>
            <p className="text-lg font-bold text-[#72CDF4]">
              {data.weekTotal} this week
            </p>
            <p className="text-xs text-muted-foreground">{deltaStr}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
