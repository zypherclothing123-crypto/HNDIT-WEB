import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin-setup
 * Sets role = 'admin' on the profile for the currently logged-in user.
 * Now purely Supabase-based — no Clerk involved.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const origin = request.nextUrl.origin;

  if (!user) {
    return NextResponse.redirect(new URL("/auth/admin-login", origin));
  }

  // Upsert profile with admin role
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      role: "admin",
    },
    { onConflict: "id" }
  );

  return NextResponse.redirect(new URL("/admin/dashboard", origin));
}
