import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HallOfFameView } from "@/components/achievements/HallOfFameView";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";
import { fetchLeaderboardEntries } from "@/lib/leaderboard-stats";
import { lockedCatalogEntries } from "@/lib/achievement-catalog";
import { fetchUserCollectionStats } from "@/lib/student-stats";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: earned } = await supabase
    .from("achievements")
    .select("title, description, badge_icon, earned_at")
    .eq("user_id", user!.id)
    .order("earned_at", { ascending: false });

  const entries = await fetchLeaderboardEntries(supabase);
  const row = entries.find((e) => e.userId === user!.id);
  const totalXp = row?.totalXp ?? 0;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user!.id)
    .single();

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "Learner";

  const avatarPublicUrl = profileAvatarPublicUrl(
    supabase,
    profile?.avatar_url ?? null
  );

  const collections = await fetchUserCollectionStats(supabase, user!.id);

  const locked = lockedCatalogEntries(
    (earned ?? []).map((a) => a.title)
  );

  return (
    <HallOfFameView
      earned={earned ?? []}
      totalXp={totalXp}
      displayName={displayName}
      avatarPublicUrl={avatarPublicUrl}
      locked={locked}
      collections={collections}
    />
  );
}
