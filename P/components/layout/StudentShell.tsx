import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";
import { StudentResponsiveChrome } from "@/components/layout/StudentResponsiveChrome";
import { loadNavbarNotifications } from "@/lib/navbar-notifications";

/** Shared student chrome (sidebar gradient + top bar). Admins are redirected. */
export async function StudentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("/admin/dashboard");

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "Student";

  const avatarPublicUrl = profileAvatarPublicUrl(
    supabase,
    profile?.avatar_url ?? null
  );

  const { items: notificationItems, unreadCount: notificationUnreadCount } =
    await loadNavbarNotifications(supabase, user.id);

  return (
    <StudentResponsiveChrome
      userName={displayName}
      avatarPublicUrl={avatarPublicUrl}
      notificationItems={notificationItems}
      notificationUnreadCount={notificationUnreadCount}
    >
      {children}
    </StudentResponsiveChrome>
  );
}
