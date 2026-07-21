import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";
import { AiTutorClient } from "./AiTutorClient";

export default async function AiTutorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", user!.id)
    .single();

  const label =
    profile?.full_name?.trim() ||
    profile?.email?.trim()?.split("@")[0] ||
    user.email?.split("@")[0] ||
    "You";
  const userInitials = label.slice(0, 2).toUpperCase() || "?";

  const userAvatarUrl = profileAvatarPublicUrl(
    supabase,
    profile?.avatar_url ?? null
  );

  return (
    <AiTutorClient userAvatarUrl={userAvatarUrl} userInitials={userInitials} />
  );
}
