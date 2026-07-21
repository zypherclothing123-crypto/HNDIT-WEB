"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";

/** Resolve `profiles.avatar_url`: storage path or absolute URL. */
export function resolveProfileAvatarUrl(
  avatarUrl: string | null | undefined,
  client: SupabaseClient = createClient()
): string | null {
  return profileAvatarPublicUrl(client, avatarUrl);
}

export function avatarObjectPath(userId: string): string {
  return `${userId}/avatar`;
}

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
