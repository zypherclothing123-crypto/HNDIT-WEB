"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Sends the current access token on `/api/*` so Route Handlers can auth + run
 * queries as that user. Refreshes the session if the tab only has a stale session.
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const supabase = createClient();
  // Validates / refreshes auth with the server; avoids relying on stale storage-only state.
  await supabase.auth.getUser();

  let {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const { data } = await supabase.auth.refreshSession();
    session = data.session ?? null;
  }

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
