import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/api-auth";
import { runNavbarSearch, type SearchVariant } from "@/lib/navbar-search";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { user, supabase } = await getRouteUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const variantParam = url.searchParams.get("variant");
  const variant: SearchVariant = variantParam === "admin" ? "admin" : "user";

  if (variant === "admin") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const results = await runNavbarSearch(supabase, variant, q);
  return NextResponse.json({ results });
}
