import type { SupabaseClient } from "@supabase/supabase-js";

export type WeeklyEngagement = {
  chart: { day: string; activity: number }[];
  peakDayLabel: string;
  peakCount: number;
  weekTotal: number;
  prevWeekTotal: number;
  /** Percent change vs previous 7-day window; null if previous week was 0. */
  weekOverWeekPct: number | null;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addLocalDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shortWeekday(d: Date): string {
  return d
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase()
    .slice(0, 3);
}

/**
 * Last 7 local days (inclusive) vs prior 7 days: quiz completions from `user_progress`.
 */
export async function fetchWeeklyEngagement(
  supabase: SupabaseClient
): Promise<WeeklyEngagement> {
  const today = startOfLocalDay(new Date());
  const thisStart = addLocalDays(today, -6);
  const prevStart = addLocalDays(thisStart, -7);
  const rangeEnd = addLocalDays(today, 1);

  const { data: rows } = await supabase
    .from("user_progress")
    .select("completed_at, completed")
    .eq("completed", true)
    .not("completed_at", "is", null)
    .gte("completed_at", prevStart.toISOString())
    .lt("completed_at", rangeEnd.toISOString());

  const thisKeys: string[] = [];
  for (let i = 0; i < 7; i++) {
    thisKeys.push(localDateKey(addLocalDays(thisStart, i)));
  }

  const thisDayCounts = new Map<string, number>();
  for (const k of thisKeys) thisDayCounts.set(k, 0);

  let prevWeekTotal = 0;
  let weekTotal = 0;
  let peakKey = thisKeys[0] ?? "";
  let peakCount = 0;

  for (const row of rows ?? []) {
    const raw = row.completed_at as string;
    const d = new Date(raw);
    const key = localDateKey(d);
    if (thisDayCounts.has(key)) {
      thisDayCounts.set(key, (thisDayCounts.get(key) ?? 0) + 1);
      weekTotal += 1;
    } else {
      const t = d.getTime();
      if (t >= prevStart.getTime() && t < thisStart.getTime()) {
        prevWeekTotal += 1;
      }
    }
  }

  const chart = thisKeys.map((key) => {
    const d = new Date(key + "T12:00:00");
    return { day: shortWeekday(d), activity: thisDayCounts.get(key) ?? 0 };
  });

  for (const k of thisKeys) {
    const c = thisDayCounts.get(k) ?? 0;
    if (c > peakCount) {
      peakCount = c;
      peakKey = k;
    }
  }

  const peakD = new Date(peakKey + "T12:00:00");
  const peakDayLabel =
    peakCount > 0
      ? `${peakD.toLocaleDateString("en-US", { weekday: "long" })}`
      : "—";

  const weekOverWeekPct =
    prevWeekTotal === 0
      ? null
      : Math.round(((weekTotal - prevWeekTotal) / prevWeekTotal) * 100);

  return {
    chart,
    peakDayLabel,
    peakCount,
    weekTotal,
    prevWeekTotal,
    weekOverWeekPct,
  };
}
