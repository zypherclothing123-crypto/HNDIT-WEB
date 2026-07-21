import type { SupabaseClient } from "@supabase/supabase-js";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievement-catalog";

export type UserCollectionStats = {
  achievementsEarned: number;
  achievementsTotal: number;
  labsCompleted: number;
  labsTotal: number;
};

export async function fetchUserCollectionStats(
  supabase: SupabaseClient,
  userId: string
): Promise<UserCollectionStats> {
  const [{ count: achievementsEarned }, { data: progress }, { count: labsTotal }] =
    await Promise.all([
      supabase
        .from("achievements")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("user_progress")
        .select("completed")
        .eq("user_id", userId),
      supabase.from("labs").select("*", { count: "exact", head: true }),
    ]);

  const labsCompleted =
    progress?.filter((p) => p.completed).length ?? 0;

  return {
    achievementsEarned: achievementsEarned ?? 0,
    achievementsTotal: ACHIEVEMENT_CATALOG.length,
    labsCompleted,
    labsTotal: labsTotal ?? 0,
  };
}

/** Week-over-week new profile signups for admin dashboard hint. */
export async function fetchStudentSignupGrowth(
  supabase: SupabaseClient
): Promise<string | undefined> {
  const today = new Date();
  const startThis = new Date(today);
  startThis.setDate(startThis.getDate() - 7);
  const startPrev = new Date(startThis);
  startPrev.setDate(startPrev.getDate() - 7);

  const [{ count: thisWeek }, { count: prevWeek }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startThis.toISOString()),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startPrev.toISOString())
      .lt("created_at", startThis.toISOString()),
  ]);

  const current = thisWeek ?? 0;
  const prior = prevWeek ?? 0;
  if (prior === 0) {
    if (current > 0) return `+${current} new this week`;
    return undefined;
  }
  const pct = Math.round(((current - prior) / prior) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% vs prior week`;
}
