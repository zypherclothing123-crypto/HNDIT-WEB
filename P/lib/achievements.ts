import { createClient } from "@/lib/supabase/server";
import { notifyAchievementEarned } from "@/lib/notifications";

const TITLES = [
  "First Lab",
  "Perfect Score",
  "Speed Learner",
  "Subject Master",
  "HNDIT Star",
] as const;

/** Award achievement once per title for this user (dedup by title). */
export async function maybeAwardAchievement(
  userId: string,
  title: (typeof TITLES)[number],
  description: string,
  badgeIcon: string
) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("achievements")
    .select("id")
    .eq("user_id", userId)
    .eq("title", title)
    .maybeSingle();

  if (existing) return null;

  const { data, error } = await supabase
    .from("achievements")
    .insert({
      user_id: userId,
      title,
      description,
      badge_icon: badgeIcon,
    })
    .select()
    .single();

  if (error) throw error;
  await notifyAchievementEarned(supabase, userId, title, description);
  return data;
}

export { TITLES };
