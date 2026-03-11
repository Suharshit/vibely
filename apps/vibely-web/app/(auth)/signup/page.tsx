"use client";

// ============================================================
// apps/web/app/(auth)/signup/page.tsx
// ============================================================
// Neumorphic Signup page preserving existing Supabase auth flow.
// ============================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, isAuthenticated, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(email, password, name.trim());

    if (!result.success) {
      const friendlyError = mapSignupError(result.error ?? "");
      setError(friendlyError);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(
      "Account created! Check your email for a confirmation link, then come back to sign in."
    );
    setIsSubmitting(false);
  };

  if (isLoading) return null;

  return (
    <div className="font-display text-slate-900 bg-background-light min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[480px]">
        {/* Neumorphic Card */}
        <div className="neo-card bg-background-light p-8 sm:p-10 rounded-xl flex flex-col gap-8 border border-white/50 items-center">
          {/* Logo/Icon */}
          <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center shadow-neo-flat mb-2">
            <Zap className="text-violet-600 w-8 h-8" strokeWidth={2.5} />
          </div>

          {/* Header Section */}
          <div className="text-center w-full">
            <h4 className="text-violet-600 text-sm font-bold uppercase tracking-widest mb-2">
              Join Vibely
            </h4>
            <h2 className="text-slate-800 text-3xl font-black tracking-tight leading-tight">
              Start capturing memories
            </h2>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSignup} className="w-full flex flex-col gap-6">
            {error && (
              <div className="p-3 rounded-xl shadow-neo-inset bg-background-light border border-red-200 text-sm text-red-600 text-center font-medium">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-xl shadow-neo-inset bg-background-light border border-green-200 text-sm text-green-700 text-center font-medium leading-relaxed">
                {successMessage}
              </div>
            )}

            {!successMessage && (
              <>
                {/* Full Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-slate-600 px-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="shadow-neo-inset rounded-xl bg-background-light w-full h-12 px-5 text-slate-800 placeholder:text-slate-400 font-medium border-none outline-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#E8EDF2_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b]"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-600 px-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="shadow-neo-inset rounded-xl bg-background-light w-full h-12 px-5 text-slate-800 placeholder:text-slate-400 font-medium border-none outline-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#E8EDF2_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b]"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-600 px-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="shadow-neo-inset rounded-xl bg-background-light w-full h-12 px-5 pr-12 text-slate-800 placeholder:text-slate-400 font-medium tracking-wide border-none outline-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#E8EDF2_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b]"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-slate-600 px-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="shadow-neo-inset rounded-xl bg-background-light w-full h-12 px-5 text-slate-800 placeholder:text-slate-400 font-medium tracking-wide border-none outline-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#E8EDF2_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b]"
                    placeholder="••••••••"
                  />
                </div>

                {/* Disclaimer */}
                <p className="text-slate-500 text-xs text-center px-4 leading-relaxed mt-2">
                  By signing up, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="text-violet-600 font-bold hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-violet-600 font-bold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 w-full h-14 bg-violet-600 text-white font-bold text-lg rounded-xl shadow-neo-button hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 focus:outline-none flex items-center justify-center"
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </>
            )}
          </form>

          {/* Bottom Link */}
          <div className="mt-2 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-violet-600 font-bold hover:underline ml-1"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} Vibely Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function mapSignupError(error: string): string {
  if (!error || error === "{}") {
    return "Something went wrong. Please check your connection and try again.";
  }
  if (error.includes("User already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (error.includes("Password should be")) {
    return "Password must be at least 8 characters long.";
  }
  if (error.includes("Unable to validate email")) {
    return "Please enter a valid email address.";
  }
  if (
    error.includes("Failed to fetch") ||
    error.includes("NetworkError") ||
    error.includes("Bad Gateway")
  ) {
    return "Unable to reach the server. Please check your connection and try again.";
  }
  return error;
}
