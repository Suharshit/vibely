"use client";

// ============================================================
// apps/web/app/forgot-password/page.tsx
// ============================================================
// Sends a password reset email via Supabase Auth.
// The user clicks the link in the email → Supabase redirects
// to /auth/callback → the user can set a new password.
// ============================================================

import { Suspense, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Zap, Mail, ArrowRight, ArrowLeft, Key, Check } from "lucide-react";

function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/auth/callback` }
    );

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setIsSent(true);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen flex flex-col">
      <header className="w-full px-6 py-8 flex justify-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl shadow-neo-button text-violet-600 bg-violet-600">
            <Zap className="text-white w-5 h-5" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 drop-shadow-sm">
            Vibely
          </h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="neo-card w-full max-w-[480px] p-8 sm:p-10 flex flex-col items-center border border-white/50 bg-background-light rounded-2xl">
          {isSent ? (
            <div className="flex flex-col items-center text-center w-full">
              <div className="mb-8 p-5 rounded-full shadow-neo-inset text-emerald-500 bg-background-light">
                <Check className="w-10 h-10" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
                Check your email
              </h2>
              <p className="text-slate-500 text-center mb-10 leading-relaxed max-w-[340px]">
                We&apos;ve sent a password reset link to{" "}
                <strong className="text-slate-800">{email}</strong>. Click the
                link to set a new password.
              </p>
              <Link
                href="/login"
                className="shadow-neo-button w-full h-14 bg-violet-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <span>Back to sign in</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="mb-8 p-5 rounded-full shadow-neo-inset text-violet-600 bg-background-light flex items-center justify-center">
                <Key className="w-10 h-10" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3 text-center tracking-tight">
                Forgot Password?
              </h2>
              <p className="text-slate-500 text-center mb-8 leading-relaxed max-w-[340px] text-sm sm:text-base">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>

              {error && (
                <div className="mb-6 w-full p-3 rounded-xl shadow-neo-inset bg-background-light border border-red-200 text-sm text-red-600 text-center font-medium">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-600 ml-1"
                  >
                    Email Address
                  </label>
                  <div className="relative group flex items-center">
                    <Mail
                      className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-violet-600 transition-colors pointer-events-none"
                      strokeWidth={2.5}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="e.g. name@example.com"
                      className="shadow-neo-inset bg-background-light w-full h-14 pl-12 pr-4 rounded-xl text-slate-800 placeholder:text-slate-400 font-medium border-none outline-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#E8EDF2_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shadow-neo-button w-full h-14 bg-violet-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 focus:outline-none mt-2 group"
                >
                  <span>{isSubmitting ? "Sending..." : "Send Reset Link"}</span>
                  {!isSubmitting && (
                    <ArrowRight
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              </form>

              <div className="mt-8">
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-slate-500 hover:text-violet-600 font-bold transition-colors group text-sm"
                >
                  <ArrowLeft
                    className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                    strokeWidth={3}
                  />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full py-6 text-center text-slate-400 text-sm font-medium">
        <p>© {new Date().getFullYear()} Vibely Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-light" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
