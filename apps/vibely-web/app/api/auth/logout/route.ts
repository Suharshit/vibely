// ============================================================
// apps/web/app/api/auth/logout/route.ts
// ============================================================
// WHY a server-side logout route?
// supabase.auth.signOut() on the client removes the session
// from the browser. But we also need to invalidate the server-
// side session cookies that were set by @supabase/ssr.
//
// If we only call signOut() client-side, the browser cookies
// with the old tokens might persist. Server Components rendering
// on the NEXT request would still see a "logged in" user until
// the cookies expire naturally.
//
// This route kills the session on BOTH sides atomically.
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // This invalidates the refresh token on Supabase's server
  // AND clears the session cookies via the setAll callback above
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
