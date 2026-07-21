import type { SupabaseClient } from "@supabase/supabase-js";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  totalXp: number;
  labsCompleted: number;
  /** Resolved image URL for UI (null if no photo). */
  avatarUrl: string | null;
};

/** XP progression: level N requires an extra step of XP to feel game-like. */
export function levelFromXp(totalXp: number): {
  level: number;
  currentXp: number;
  nextLevelXp: number;
} {
  let level = 1;
  let spent = 0;
  let need = 400;
  while (spent + need <= totalXp) {
    spent += need;
    level += 1;
    need = 400 + (level - 1) * 100;
  }
  return {
    level,
    currentXp: totalXp - spent,
    nextLevelXp: need,
  };
}

/**
 * Aggregates all users’ lab quiz scores from `user_progress` and joins `profiles`
 * for display names. Sorted by total XP descending.
 */
export async function fetchLeaderboardEntries(
  supabase: SupabaseClient
): Promise<LeaderboardEntry[]> {
  const { data: progress } = await supabase
    .from("user_progress")
    .select("user_id, score, completed");

  if (!progress?.length) return [];

  const byUser = new Map<string, { totalXp: number; labsCompleted: number }>();
  for (const row of progress) {
    const uid = row.user_id as string | null;
    if (!uid) continue;
    const cur = byUser.get(uid) ?? { totalXp: 0, labsCompleted: 0 };
    cur.totalXp += row.score ?? 0;
    if (row.completed) cur.labsCompleted += 1;
    byUser.set(uid, cur);
  }

  const userIds = Array.from(byUser.keys());
  if (!userIds.length) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p] as const));

  const entries: LeaderboardEntry[] = userIds.map((userId) => {
    const p = profileMap.get(userId);
    const displayName =
      p?.full_name?.trim() || p?.email?.split("@")[0] || "Learner";
    const agg = byUser.get(userId)!;
    return {
      userId,
      displayName,
      totalXp: agg.totalXp,
      labsCompleted: agg.labsCompleted,
      avatarUrl: profileAvatarPublicUrl(supabase, p?.avatar_url ?? null),
    };
  });

  entries.sort((a, b) => b.totalXp - a.totalXp);
  return entries;
}

export function rankForUser(
  entries: LeaderboardEntry[],
  userId: string
): number {
  const idx = entries.findIndex((e) => e.userId === userId);
  return idx === -1 ? Math.max(1, entries.length + 1) : idx + 1;
}

function titleFromRank(rank: number): string {
  if (rank <= 1) return "Champion";
  if (rank <= 3) return "Expert";
  if (rank <= 10) return "Scholar";
  return "Rising";
}

export function podiumTitle(rank: number): string {
  return titleFromRank(rank);
}
