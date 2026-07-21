"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import {
  Activity,
  Medal,
  MessageSquare,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { EngagementChart } from "@/components/admin/EngagementChart";
import type { AdminAnalyticsBundle } from "@/lib/admin-analytics";

const iconWrap =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-[#534AB7]/10 text-[#534AB7]";

function TrendLineCard({
  title,
  subtitle,
  data,
  color,
}: {
  title: string;
  subtitle: string;
  data: { day: string; value: number }[];
  color: string;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#2d2d44]">
      <div className="mb-3">
        <h3 className="text-base font-bold text-heading">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function AdminAnalyticsView({ data }: { data: AdminAnalyticsBundle }) {
  const { totals, engagement, achievements14d, signups14d } = data;

  const kpis = [
    {
      label: "Total quiz XP",
      value: totals.totalQuizXp.toLocaleString(),
      hint: `${totals.avgScorePerCompletion} avg pts / completion`,
      icon: TrendingUp,
    },
    {
      label: "Achievements unlocked",
      value: totals.achievements.toLocaleString(),
      hint: "All-time badges",
      icon: Medal,
    },
    {
      label: "AI Tutor sessions",
      value: totals.chatSessions.toLocaleString(),
      hint: "Saved chat sessions",
      icon: MessageSquare,
    },
    {
      label: "Admins vs students",
      value: `${totals.admins} / ${totals.students}`,
      hint: "Admin accounts · learners",
      icon: UserPlus,
    },
  ];

  const achChart = achievements14d;
  const signChart = signups14d;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#534AB7]">
          Analytics
        </p>
        <h1 className="mt-1 text-2xl font-bold text-heading">
          Usage &amp; learning insights
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregated from quiz completions, achievements, signups, and tutor
          activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="rounded-2xl border bg-white p-4 shadow-soft dark:border-white/10 dark:bg-[#2d2d44]"
            >
              <div className="flex items-start gap-3">
                <div className={iconWrap}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {k.label}
                  </p>
                  <p className="text-xl font-bold text-heading">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.hint}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <EngagementChart data={engagement} />
        <section className="rounded-2xl border bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#2d2d44]">
          <div className="mb-4 flex items-center gap-2">
            <div className={iconWrap}>
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-heading">
                Content footprint
              </h3>
              <p className="text-xs text-muted-foreground">
                Labs, uploads, and roster size
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-muted pb-2">
              <span className="text-muted-foreground">Labs</span>
              <span className="font-semibold text-heading">
                {totals.labs.toLocaleString()}
              </span>
            </li>
            <li className="flex justify-between border-b border-muted pb-2">
              <span className="text-muted-foreground">Uploaded notes</span>
              <span className="font-semibold text-heading">
                {totals.notes.toLocaleString()}
              </span>
            </li>
            <li className="flex justify-between border-b border-muted pb-2">
              <span className="text-muted-foreground">Students (non-admin)</span>
              <span className="font-semibold text-heading">
                {totals.students.toLocaleString()}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Admin accounts</span>
              <span className="font-semibold text-heading">
                {totals.admins.toLocaleString()}
              </span>
            </li>
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendLineCard
          title="Achievements per day"
          subtitle="Last 14 days (badge unlocks)"
          data={achChart}
          color="#534AB7"
        />
        <TrendLineCard
          title="New profiles"
          subtitle="Last 14 days (registrations)"
          data={signChart}
          color="#1D9E75"
        />
      </div>
    </div>
  );
}
