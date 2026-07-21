import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";
import { AdminAppChrome } from "@/components/layout/AdminAppChrome";
import { loadNavbarNotifications } from "@/lib/navbar-notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── 1. Must be authenticated ─────────────────────────────────────────────
  if (!user) redirect("/auth/admin-login");

  // ── 2. Check Supabase profile for admin role ─────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  // ── 3. Load display data ─────────────────────────────────────────────────
  const displayName = profile?.full_name?.trim() || user.email?.split("@")[0] || "Admin";

  const avatarPublicUrl = profileAvatarPublicUrl(
    supabase,
    profile?.avatar_url ?? null
  );

  const { items: notificationItems, unreadCount: notificationUnreadCount } =
    await loadNavbarNotifications(supabase, user.id);

  return (
    <AdminAppChrome
      userName={displayName}
      avatarPublicUrl={avatarPublicUrl}
      notificationItems={notificationItems}
      notificationUnreadCount={notificationUnreadCount}
    >
      {children}
    </AdminAppChrome>
  );
}
