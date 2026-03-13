"use client";

// ============================================================
// apps/web/app/(auth)/login/page.tsx
// ============================================================
// Neumorphic Login page preserving existing Supabase auth flow.
// ============================================================

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="font-display text-slate-900 bg-background-light min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[480px]">
        {/* Main Neumorphic Card */}
        <div className="neo-card bg-background-light p-6 sm:p-8 rounded-xl flex flex-col gap-6 border border-white/50">
          {/* Header Section */}
          <div className="flex flex-col gap-1.5 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-violet-600 rounded-full flex items-center justify-center shadow-neo-button">
                <Zap className="text-white w-7 h-7" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-[#130e1b] text-3xl font-black leading-tight tracking-tight">
              Welcome Back
            </h1>
            <p className="text-violet-600/80 text-base font-medium">
              Log in to your vault
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-5">
            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl shadow-neo-inset bg-background-light border border-red-200 text-sm text-red-600 text-center font-medium">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-600 px-1"
              >
                Email Address
              </label>
              <div className="shadow-neo-inset rounded-xl bg-background-light px-4 py-0.5 flex items-center border border-white/30 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                <Mail
                  className="w-5 h-5 text-slate-400 mr-3 shrink-0"
                  strokeWidth={2.5}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full h-11 text-slate-800 placeholder:text-slate-400 font-medium p-0 shadow-none [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#E8EDF2_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b]"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-600"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-violet-600 text-xs font-bold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="shadow-neo-inset rounded-xl bg-background-light px-4 py-0.5 flex items-center border border-white/30 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                <Lock
                  className="w-5 h-5 text-slate-400 mr-3 shrink-0"
                  strokeWidth={2.5}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full h-11 text-slate-800 placeholder:text-slate-400 font-medium p-0 tracking-wide shadow-none [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#E8EDF2_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-violet-600 transition-colors p-2 -mr-2 shrink-0 rounded-full focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl shadow-neo-button hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 focus:outline-none"
              >
                <span>{isSubmitting ? "Logging In..." : "Log In"}</span>
                {!isSubmitting && (
                  <ArrowRight
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <div className="text-center pt-2">
            <p className="text-slate-500 text-sm font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-violet-600 font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Social Login Hint */}
        <div className="mt-8 flex flex-col items-center gap-5">
          <div className="flex items-center gap-4 w-full">
            <div className="h-[2px] bg-slate-300 shadow-sm flex-1 rounded-full"></div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Or connect with
            </span>
            <div className="h-[2px] bg-slate-300 shadow-sm flex-1 rounded-full"></div>
          </div>

          <div className="flex justify-center flex-1">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-14 h-14 rounded-full shadow-neo-flat bg-background-light flex items-center justify-center border border-white/40 active:shadow-neo-inset focus:outline-none transition-all group"
            >
              <svg
                className="w-6 h-6 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                viewBox="0 0 24 24"
              >
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-light" />}>
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
