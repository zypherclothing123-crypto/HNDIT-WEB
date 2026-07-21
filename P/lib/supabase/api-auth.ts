import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Resolves the Supabase user for Route Handlers.
 */
export async function getRouteUser(_request: Request): Promise<{
  supabase: SupabaseClient;
  user: { id: string; email?: string } | null;
  authError: Error | null;
}> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { supabase, user: null, authError: error };
    }

    return {
      supabase,
      user: { id: user.id, email: user.email },
      authError: null,
    };
  } catch (error) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });
    return { supabase, user: null, authError: error as Error };
  }
}
