"use client";

// ============================================================
// apps/web/app/(auth)/login/page.tsx
// ============================================================
// Glassmorphism Login page preserving existing Supabase auth flow.
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

  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const callbackError = searchParams.get("error");

  useEffect(() => {
    if (callbackError === "oauth_failed") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Google sign-in was cancelled or failed. Please try again.");
    } else if (callbackError === "session_exchange_failed") {
      setError("Something went wrong completing sign-in. Please try again.");
    }
  }, [callbackError]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }

    setIsSubmitting(true);

    const result = await signIn(email, password);

    if (!result.success) {
      const friendlyError = mapAuthError(result.error ?? "");
      setError(friendlyError);
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectTo);
  };

  const handleGoogleLogin = async () => {
    setError("");
    const result = await signInWithGoogle();
    if (!result.success) {
      setError("Failed to start Google sign-in. Please try again.");
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background text-on-surface">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[80px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary-container/10 blur-[80px] -z-10"></div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-transparent backdrop-blur-xl">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter text-primary font-headline"
        >
          Vibely
        </Link>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer hover:text-primary-dim transition-colors">
            help_outline
          </span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center w-full px-6 pt-24 pb-12">
        {/* Centered Neumorphic Login Card */}
        <div className="glass-card w-full max-w-[440px] p-10 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* Branding & Greeting */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container-high mb-6 shadow-lg border border-outline-variant/10">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline mb-2">
              Welcome Back
            </h1>
            <p className="text-on-surface-variant font-body">
              Enter your details to access your curated gallery.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-medium tracking-widest text-on-surface-variant uppercase font-label px-1">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  alternate_email
                </span>
                <input
                  className="w-full h-14 bg-surface-container-lowest border border-transparent rounded-xl pl-12 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.6)] transition-all placeholder:text-outline/40 font-medium"
                  placeholder="name@domain.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-medium tracking-widest text-on-surface-variant uppercase font-label">
                  Password
                </label>
                <Link
                  className="text-[10px] font-bold tracking-widest text-[#bd9dff] uppercase font-label hover:text-primary-dim transition-colors"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  className="w-full h-14 bg-surface-container-lowest border border-transparent rounded-xl pl-12 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.6)] transition-all placeholder:text-outline/40 font-medium tracking-wider"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-4">
              <button
                className="w-full h-14 bg-gradient-to-r from-primary to-primary-dim text-on-primary-container font-extrabold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-outline-variant/10"></div>
                <span className="flex-shrink mx-4 text-[10px] text-on-surface-variant uppercase tracking-widest font-label">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-outline-variant/10"></div>
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleGoogleLogin}
                className="w-full h-14 flex items-center justify-center gap-3 bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold rounded-xl transition-all border border-outline-variant/10 disabled:opacity-70"
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>

          {/* Card Footer */}
          <div className="mt-10 text-center">
            <p className="text-on-surface-variant text-sm font-body">
              New to Vibely?{" "}
              <Link
                className="text-[#bd9dff] font-semibold hover:text-[#b28cff] transition-colors"
                href="/signup"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center mt-auto">
        <div className="flex justify-center gap-8 mb-4">
          <Link
            className="text-[10px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest font-label"
            href="#"
          >
            Privacy Policy
          </Link>
          <Link
            className="text-[10px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest font-label"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-[10px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest font-label"
            href="#"
          >
            Support
          </Link>
        </div>
        <div className="text-[10px] text-outline/40 uppercase tracking-[0.2em] font-label">
          © 2024 VIBELY CREATIVE SYSTEMS
        </div>
      </footer>

      {/* Decorative Image Overlays (Invisible but present for structure as per mandate) */}
      <div
        className="fixed top-20 left-10 w-32 h-32 rounded-3xl opacity-5 rotate-12 -z-10 bg-surface-container"
        data-alt="Abstract dark geometric shape gradient"
      ></div>
      <div
        className="fixed bottom-40 right-10 w-48 h-48 rounded-3xl opacity-5 -rotate-12 -z-10 bg-surface-container-high"
        data-alt="Soft blurry violet light orb"
      ></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}

// ── Error message mapping ─────────────────────────────────────
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
  return error;
}
