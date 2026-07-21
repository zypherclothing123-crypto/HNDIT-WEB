import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyAchievementEarned } from "@/lib/notifications";

async function insertAchievement(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  description: string,
  badge_icon: string
) {
  const { data: existing } = await supabase
    .from("achievements")
    .select("id")
    .eq("user_id", userId)
    .eq("title", title)
    .maybeSingle();
  if (existing) return;
  const { error } = await supabase.from("achievements").insert({
    user_id: userId,
    title,
    description,
    badge_icon,
  });
  if (error) return;
  await notifyAchievementEarned(supabase, userId, title, description);
}

/** Persist lab quiz score to `user_progress` and award standard badges. */
export async function saveLabQuizProgress(
  supabase: SupabaseClient,
  userId: string,
  labId: string,
  score: number,
  totalPoints: number
) {
  const { data: existing } = await supabase
    .from("user_progress")
    .select("id, score")
    .eq("user_id", userId)
    .eq("lab_id", labId)
    .maybeSingle();

  const payload = {
    user_id: userId,
    lab_id: labId,
    completed: true,
    score,
    answers: { source: "quiz" },
    completed_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await supabase.from("user_progress").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("user_progress").insert(payload);
  }

  await insertAchievement(
    supabase,
    userId,
    "First Lab",
    "Completed your first Smart Lab quiz.",
    "star"
  );
  if (totalPoints > 0 && score >= totalPoints) {
    await insertAchievement(
      supabase,
      userId,
      "Perfect Score",
      "Perfect score on a lab quiz.",
      "trophy"
    );
  }

  // --- Speed Learner Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: dailyCount } = await supabase
    .from("user_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", true)
    .gte("completed_at", today.toISOString());

  if (dailyCount && dailyCount >= 3) {
    await insertAchievement(
      supabase,
      userId,
      "Speed Learner",
      "Finished three lab quizzes in one day.",
      "zap"
    );
  }

  // --- Subject Master Logic ---
  const { data: lab } = await supabase
    .from("labs")
    .select("subject_id")
    .eq("id", labId)
    .single();

  if (lab?.subject_id) {
    const [{ count: subjectLabsTotal }, { count: userSubjectLabsDone }] = await Promise.all([
      supabase
        .from("labs")
        .select("*", { count: "exact", head: true })
        .eq("subject_id", lab.subject_id),
      supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true)
        .in("lab_id", (
          await supabase.from("labs").select("id").eq("subject_id", lab.subject_id)
        ).data?.map(l => l.id) || []),
    ]);

    if (subjectLabsTotal && userSubjectLabsDone && userSubjectLabsDone >= subjectLabsTotal) {
      await insertAchievement(
        supabase,
        userId,
        "Subject Master",
        "Completed every lab in one subject.",
        "medal"
      );
    }
  }
}
