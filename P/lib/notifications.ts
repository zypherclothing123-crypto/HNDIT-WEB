import type { SupabaseClient } from "@supabase/supabase-js";

/** Aligns with `public.notifications.type` — extend as features ship. */
export type NotificationType =
  | "achievement_earned"
  | "clan_war_started"
  | "battle_invite"
  | "system";

export type InsertUserNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  metadata?: Record<string, unknown>;
};

export async function insertUserNotification(
  supabase: SupabaseClient,
  input: InsertUserNotificationInput
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
    metadata: input.metadata ?? {},
  });
  if (error) throw error;
}

/** Best-effort insert so achievements/quiz flows still work if the table is missing. */
export async function safeInsertUserNotification(
  supabase: SupabaseClient,
  input: InsertUserNotificationInput
) {
  try {
    await insertUserNotification(supabase, input);
  } catch {
    /* table not migrated yet or RLS */
  }
}

export async function notifyAchievementEarned(
  supabase: SupabaseClient,
  userId: string,
  achievementTitle: string,
  description: string | null
) {
  await safeInsertUserNotification(supabase, {
    userId,
    type: "achievement_earned",
    title: `Achievement: ${achievementTitle}`,
    body: description ?? "You unlocked a new badge.",
    link: "/achievements",
    metadata: { achievement_title: achievementTitle },
  });
}

export async function notifyBattleInvite(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  body: string,
  link?: string
) {
  await safeInsertUserNotification(supabase, {
    userId,
    type: "battle_invite",
    title,
    body,
    link: link ?? "/labs/simulation/cpu-scheduling",
  });
}

export async function notifyClanWarStarted(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  body: string,
  link?: string
) {
  await safeInsertUserNotification(supabase, {
    userId,
    type: "clan_war_started",
    title,
    body,
    link: link ?? "/leaderboard",
  });
}
