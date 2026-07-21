import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchWeeklyEngagement,
  type WeeklyEngagement,
} from "@/lib/engagement-stats";

export type TrendPoint = { day: string; value: number };

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

function buildDailyTrend(
  isoDates: (string | null | undefined)[],
  numDays: number
): TrendPoint[] {
  const today = startOfLocalDay(new Date());
  const start = addLocalDays(today, -(numDays - 1));
  const keys: string[] = [];
  for (let i = 0; i < numDays; i++) {
    keys.push(localDateKey(addLocalDays(start, i)));
  }
  const counts = new Map(keys.map((k) => [k, 0]));
  for (const raw of isoDates) {
    if (!raw) continue;
    const key = localDateKey(new Date(raw));
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return keys.map((key) => {
    const d = new Date(key + "T12:00:00");
    return { day: shortWeekday(d), value: counts.get(key) ?? 0 };
  });
}

export type AdminAnalyticsBundle = {
  engagement: WeeklyEngagement;
  achievements14d: TrendPoint[];
  signups14d: TrendPoint[];
  totals: {
    students: number;
    admins: number;
    labs: number;
    notes: number;
    achievements: number;
    chatSessions: number;
    totalQuizXp: number;
    avgScorePerCompletion: number;
  };
};

export async function fetchAdminAnalytics(
  supabase: SupabaseClient
): Promise<AdminAnalyticsBundle> {
  const today = startOfLocalDay(new Date());
  const start14 = addLocalDays(today, -13);
  const rangeEnd = addLocalDays(today, 1);
  const startIso = start14.toISOString();
  const endIso = rangeEnd.toISOString();

  const [
    engagement,
    studentsRes,
    adminsRes,
    labsRes,
    notesRes,
    achCountRes,
    chatRes,
    achTrendRes,
    signupTrendRes,
    progressRes,
  ] = await Promise.all([
    fetchWeeklyEngagement(supabase),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .or("role.is.null,role.neq.admin"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin"),
    supabase.from("labs").select("*", { count: "exact", head: true }),
    supabase.from("uploaded_notes").select("*", { count: "exact", head: true }),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
    supabase.from("chat_sessions").select("*", { count: "exact", head: true }),
    supabase
      .from("achievements")
      .select("earned_at")
      .gte("earned_at", startIso)
      .lt("earned_at", endIso),
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", startIso)
      .lt("created_at", endIso),
    supabase.from("user_progress").select("score, completed"),
  ]);

  const achDates = (achTrendRes.data ?? []).map((r) => r.earned_at as string);
  const signupDates = (signupTrendRes.data ?? []).map(
    (r) => r.created_at as string
  );

  const progress = progressRes.data ?? [];
  const completedRows = progress.filter((p) => p.completed);
  const totalQuizXp = completedRows.reduce(
    (a, p) => a + (p.score ?? 0),
    0
  );
  const avgScorePerCompletion = completedRows.length
    ? Math.round(totalQuizXp / completedRows.length)
    : 0;

  return {
    engagement,
    achievements14d: buildDailyTrend(achDates, 14),
    signups14d: buildDailyTrend(signupDates, 14),
    totals: {
      students: studentsRes.count ?? 0,
      admins: adminsRes.count ?? 0,
      labs: labsRes.count ?? 0,
      notes: notesRes.count ?? 0,
      achievements: achCountRes.count ?? 0,
      chatSessions: chatRes.count ?? 0,
      totalQuizXp,
      avgScorePerCompletion,
    },
  };
}
