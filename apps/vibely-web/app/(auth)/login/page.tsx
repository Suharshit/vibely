"use client";

// ============================================================
// apps/web/app/(auth)/login/page.tsx
// ============================================================
// WHY is this in an (auth) route group?
// Route groups (parentheses) let you organize routes without
// affecting the URL structure. /app/(auth)/login/page.tsx
// becomes /login — the (auth) folder is invisible in the URL.
// This is useful because we want a different layout for auth
// pages (no nav bar, centered card) vs dashboard pages.
//
// The (auth)/layout.tsx we'll create handles that shared
// auth-page wrapper so we don't repeat it on login + signup.
// ============================================================

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read the redirectTo param set by middleware
  // e.g. /login?redirectTo=/events/abc
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  // Read error params set by the OAuth callback route
  const callbackError = searchParams.get("error");

  useEffect(() => {
    if (callbackError === "oauth_failed") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Google sign-in was cancelled or failed. Please try again.");
    } else if (callbackError === "session_exchange_failed") {
      setError("Something went wrong completing sign-in. Please try again.");
    }
  }, [callbackError]);

  // If user is already authenticated (e.g. they navigated to /login
  // manually), redirect them away. The middleware does this too but
  // this is a client-side safety net for cases where middleware
  // might not have caught it yet.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn(email, password);

    if (!result.success) {
      // Supabase returns technical error messages — map them to
      // user-friendly language. Never expose raw Postgres errors.
      const friendlyError = mapAuthError(result.error ?? "");
      setError(friendlyError);
      setIsSubmitting(false);
      return;
    }

    // onAuthStateChange in AuthContext will update state.
    // The useEffect above will then trigger the redirect.
    router.replace(redirectTo);
  };

  const handleGoogleLogin = async () => {
    setError("");
    const result = await signInWithGoogle();
    if (!result.success) {
      setError("Failed to start Google sign-in. Please try again.");
    }
    // If successful, browser navigates to Google — no further action needed
  };

  if (isLoading) return null; // Let middleware handle the redirect

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vibely</h1>
          <p className="mt-2 text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Error banner */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Google OAuth button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {/* Google SVG icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-3">or continue with email</span>
            </div>
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-gray-900 font-medium hover:underline"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  );
}

// ── Error message mapping ─────────────────────────────────────
// Supabase returns error messages like "Invalid login credentials"
// which are fine, but some are cryptic. We normalize them here
// so users always get a consistent, friendly message.
function mapAuthError(error: string): string {
  if (error.includes("Invalid login credentials")) {
    return "Email or password is incorrect. Please check and try again.";
  }
  if (error.includes("Email not confirmed")) {
    return "Please check your email and click the confirmation link first.";
  }
  if (error.includes("Too many requests")) {
    return "Too many sign-in attempts. Please wait a few minutes and try again.";
  }
  if (error.includes("User not found")) {
    return "No account found with this email address.";
  }
  // Fall back to the original message for any unhandled cases
  return error;
}
