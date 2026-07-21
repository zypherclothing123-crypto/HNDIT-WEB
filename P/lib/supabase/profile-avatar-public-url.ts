import type { SupabaseClient } from "@supabase/supabase-js";

/** Resolve `profiles.avatar_url` to a displayable URL (works on server or client). */
export function profileAvatarPublicUrl(
  supabase: SupabaseClient,
  raw: string | null | undefined
): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  const { data } = supabase.storage.from("avatars").getPublicUrl(t);
  return data.publicUrl;
}
