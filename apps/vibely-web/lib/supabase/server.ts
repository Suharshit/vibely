// ============================================================
// Server client — used in Server Components, Route Handlers,
// Server Actions, and Middleware
//
// WHY cookies()?
// In App Router, we can't use localStorage server-side.
// @supabase/ssr reads/writes the auth session from HTTP cookies
// so the server knows who the user is on every request.
// ============================================================
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@repo/supabase/types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll() is called from Server Components where setting
            // cookies isn't allowed. Safe to ignore — middleware handles refresh.
          }
        },
      },
    }
  );
}

// ============================================================
// ADMIN client — bypasses RLS entirely
// ONLY use this in API Route Handlers for operations that
// legitimately need elevated access (e.g. guest session creation,
// cron cleanup). NEVER import this in client components.
// ============================================================
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← server-only env var
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}
