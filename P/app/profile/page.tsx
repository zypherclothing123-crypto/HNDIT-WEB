import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileCustomization } from "@/components/profile/ProfileCustomization";
import { levelFromXp } from "@/lib/leaderboard-stats";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url, role")
    .eq("id", user.id)
    .single();

  const { data: progress } = await supabase
    .from("user_progress")
    .select("score")
    .eq("user_id", user.id);

  const totalXp =
    progress?.reduce((acc, p) => acc + (p.score ?? 0), 0) ?? 0;
  const { level } = levelFromXp(totalXp);

  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, title, description, badge_icon")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  const displayName =
    profile?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    (profile?.role === "admin" ? "Admin" : "Student");

  const avatarPath = profile?.avatar_url ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <ProfileCustomization
        userId={user.id}
        initialFullName={displayName}
        email={profile?.email ?? user.email}
        level={level}
        achievements={achievements ?? []}
        initialAvatarPath={avatarPath}
      />
    </div>
  );
}
