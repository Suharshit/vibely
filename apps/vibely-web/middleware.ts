// ============================================================
// apps/web/middleware.ts
// ============================================================
// WHY does Next.js need middleware for auth?
// Supabase issues JWTs that expire every hour. When a JWT expires,
// the Supabase client automatically uses the refresh token to get
// a new JWT — but this only happens in client-side code by default.
//
// In App Router, Server Components render before any client JS
// runs. So if a user visits a page after their JWT expired, the
// Server Component would see them as logged out even though they
// have a valid refresh token.
//
// The middleware runs on EVERY request, BEFORE rendering. It
// silently refreshes the session if needed, then writes the new
// tokens to cookies. By the time Server Components render, the
// session is fresh.
//
// WHY does it also handle redirects?
// Rather than checking auth in every Server Component separately,
// we centralize protected route logic here. One place to maintain,
// consistent behavior everywhere.
//
// IMPORTANT: The middleware file MUST live at the root of your app
// (same level as app/), NOT inside the app/ directory.
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/events", "/vault", "/profile"];

// Routes that should redirect authenticated users AWAY
// (e.g. don't show login page to someone already logged in)
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  // We must return this response object and have Supabase mutate
  // it (add/update cookies) rather than creating a new response
  // mid-flight. Creating a new response would lose the cookies.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: write to request (so later middleware can read them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Step 2: rebuild the response with updated request
          supabaseResponse = NextResponse.next({ request });
          // Step 3: write to response (so the browser receives them)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // DO NOT add any code between createServerClient and getUser().
  // The auth token refresh is triggered inside getUser() — anything
  // between them could interfere with the cookie timing.
  //
  // We use getUser() not getSession() because getUser() re-validates
  // the JWT against Supabase's server. getSession() trusts the
  // cookie blindly without re-validation — a security risk.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Guard: redirect unauthenticated users from protected routes ─
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    // Remember where they were trying to go so we can redirect
    // them there after a successful login.
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Guard: redirect authenticated users away from auth pages ────
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // IMPORTANT: Always return supabaseResponse, never a new
  // NextResponse. The cookies Supabase set above live on
  // supabaseResponse — losing them breaks the auth session.
  return supabaseResponse;
}

// The matcher tells Next.js which routes to run middleware on.
// We exclude static assets and Next internals for performance.
// The regex: match everything EXCEPT _next/static, _next/image,
// favicon.ico, and common image extensions.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
