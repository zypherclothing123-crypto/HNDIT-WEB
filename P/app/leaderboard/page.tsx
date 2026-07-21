import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { fetchLeaderboardEntries } from "@/lib/leaderboard-stats";
import { ClanSeasonNotificationPing } from "@/components/notifications/ClanSeasonNotificationPing";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const entries = await fetchLeaderboardEntries(supabase);

  return (
    <>
      <ClanSeasonNotificationPing />
      <LeaderboardView entries={entries} currentUserId={user!.id} />
    </>
  );
}
