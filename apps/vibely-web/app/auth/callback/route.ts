// ============================================================
// apps/web/app/auth/callback/route.ts
// ============================================================
// WHY does this route exist?
// OAuth (Google) and magic-link flows work like this:
//   1. User clicks "Continue with Google"
//   2. Browser redirects to Google's login page
//   3. Google redirects back to YOUR app at this URL, with a
//      one-time "code" in the query string
//   4. THIS ROUTE exchanges that code for a real Supabase
//      session (access token + refresh token stored in cookies)
//   5. We then redirect the user to their intended destination
//
// Without this exchange step, the user would arrive at your app
// with a code in the URL but no actual session — they'd appear
// logged out even though Google authenticated them successfully.
//
// This is the PKCE (Proof Key for Code Exchange) flow. It's more
// secure than the implicit flow because the token never appears
// in the URL — it's exchanged server-side.
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 'next' is the page the user was trying to visit before being
  // redirected to login. We'll bounce them there after auth.
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    // No code means something went wrong upstream (user cancelled,
    // network error, etc.). Redirect to login with an error param.
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

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

  // Exchange the one-time code for a session.
  // This sets the auth cookies on the response automatically.
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback] Code exchange failed:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=session_exchange_failed`
    );
  }

  // Successful auth — redirect to the intended destination.
  // We use the origin from the request to handle both localhost
  // and production domains correctly.
  return NextResponse.redirect(`${origin}${next}`);
}
