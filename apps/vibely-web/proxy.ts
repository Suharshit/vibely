// ============================================================
// apps/web/proxy.ts
// ============================================================
// Next.js proxy runs on every matched request BEFORE the
// page or API route handler. We use it to:
//   1. Redirect unauthenticated users away from protected routes
//   2. Redirect authenticated users away from auth pages
//
// WHY middleware instead of checking auth in every page?
// Middleware runs at the Edge — before the page JS bundle is
// even loaded. This means unauthenticated users never see a
// flash of protected content. It's also one central place to
// manage auth redirects instead of copy-pasting checks.
//
// HOW Supabase auth works in middleware:
// The Supabase SSR package reads the auth cookie from the request
// and verifies the session. If valid, the user is authenticated.
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/events",
  "/vault",
  "/profile",
  "/photos",
];

// Routes only for unauthenticated users
const AUTH_ONLY_ROUTES = ["/login", "/signup"];

// Routes that are always public (no redirect either way)
const PUBLIC_ROUTES = [
  "/join", // invite landing page
  "/guest", // guest upload page
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  // (API routes handle their own auth)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Build a response to pass cookies through
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create Supabase client that can read/write cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session (extends expiry) and get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_ROUTES.some((p) => pathname.startsWith(p));
  const isPublic = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));

  // Public routes — no redirect
  if (isPublic) return response;

  // Unauthenticated user trying to access a protected route
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname); // redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access auth pages
  if (isAuthOnly && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  // Run proxy on all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
