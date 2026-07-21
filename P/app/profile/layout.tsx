import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";
import { StudentShell } from "@/components/layout/StudentShell";
import { AdminAppChrome } from "@/components/layout/AdminAppChrome";
import { loadNavbarNotifications } from "@/lib/navbar-notifications";

export default async function ProfileLayout({
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

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "Learner";

  const avatarPublicUrl = profileAvatarPublicUrl(
    supabase,
    profile?.avatar_url ?? null
  );

  if (profile?.role === "admin") {
    const { items: notificationItems, unreadCount: notificationUnreadCount } =
      await loadNavbarNotifications(supabase, user.id);

    return (
      <AdminAppChrome
        userName={displayName}
        avatarPublicUrl={avatarPublicUrl}
        navTitle="My profile"
        navSubtitle="Account, photo & badges"
        notificationItems={notificationItems}
        notificationUnreadCount={notificationUnreadCount}
      >
        {children}
      </AdminAppChrome>
    );
  }

  return <StudentShell>{children}</StudentShell>;
}
