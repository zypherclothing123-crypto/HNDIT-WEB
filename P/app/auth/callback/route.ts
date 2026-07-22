import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route";

/**
 * OAuth PKCE + email magic links (signup confirm, password recovery).
 * Supabase redirects here with ?code=… Add this URL to Supabase Auth → URL config.
 */
function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  const login = new URL("/auth/login", url.origin);
  login.searchParams.set(
    "error",
    "Could not verify email or complete sign-in. Try again or request a new link."
  );
  return NextResponse.redirect(login);
}
