import type { SupabaseClient } from "@supabase/supabase-js";

export type NavbarNotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export async function loadNavbarNotifications(
  supabase: SupabaseClient,
  userId: string
): Promise<{ items: NavbarNotificationRow[]; unreadCount: number }> {
  const [listRes, unreadRes] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
  ]);

  if (listRes.error) {
    return { items: [], unreadCount: 0 };
  }

  return {
    items: (listRes.data ?? []) as NavbarNotificationRow[],
    unreadCount: unreadRes.error ? 0 : unreadRes.count ?? 0,
  };
}
