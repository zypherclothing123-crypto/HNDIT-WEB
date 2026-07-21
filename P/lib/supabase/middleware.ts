import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session — do NOT remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth-only routes — redirect unauthenticated users to login
  const authRequiredPaths = [
    "/dashboard",
    "/labs",
    "/ai-tutor",
    "/achievements",
    "/leaderboard",
    "/profile",
    "/quiz",
    "/admin",
  ];

  const isAuthRequired = authRequiredPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Already-logged-in users shouldn't see login/register pages
  const isAuthPage = [
    "/auth/login",
    "/auth/register",
    "/auth/admin-login",
  ].some((path) => request.nextUrl.pathname.startsWith(path));

  if (!user && isAuthRequired) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
