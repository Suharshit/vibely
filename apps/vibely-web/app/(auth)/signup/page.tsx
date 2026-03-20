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

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

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
    <div className="bg-background text-on-surface min-h-screen flex items-center justify-center p-4 md:p-8 selection:bg-primary/30 font-body">
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-[2rem] bg-surface/60 backdrop-blur-[20px] border border-outline-variant/30 shadow-[0_0_30px_-10px_rgba(189,157,255,0.2)]">
        {/* Left Side: Editorial Abstract Section */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-surface-container-low relative overflow-hidden">
          <div className="z-10">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tighter text-primary font-headline mb-12 block"
            >
              Vibely
            </Link>
            <h1 className="font-headline text-5xl font-extrabold text-on-surface leading-tight tracking-tight mb-6">
              Preserve every <br />
              <span className="text-primary italic">shared moment.</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md">
              Join the private gallery where memories are suspended in
              high-fidelity digital keepsakes.
            </p>
          </div>

          {/* Abstract Gradient Decoration */}
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full filter pointer-events-none"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full filter pointer-events-none"></div>

          <div className="z-10 mt-auto">
            <div className="flex -space-x-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-10 h-10 rounded-full border-2 border-surface-container-low object-cover"
                alt="User 1"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6QRoRrsi-qGvT_ntyKkn666Jx2E6HbhUXuvcw3i3PgGdrjbfWoktrSwqDRHt2G9j8Vw1QO92MXB5mDADzGDQq8It5lbhc3LGA_Mg7jB_VQjqEOpriTSuY2m7-UvW2IWSzBL_1H4tK9F0VyvlnFFHWaAX9LZakjkFl2Mf4qyotA1FCdCFtjiCBcPj5ued1RdP1KYSJYOxIJle3qaE053K6TeG8f8VlA5TcYrmfu-E_Vnl-v8nYQpFW-l9ZmVhgF1J3A-_FuddTRhiz"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-10 h-10 rounded-full border-2 border-surface-container-low object-cover"
                alt="User 2"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVbSituYBh8tA55CEEDPgJS-78PZuNJOO8o5om1VfNXtKwONPsKLEojOlvhGQrQ1iVn1rPZK5QCMPzEWf-7_zT_1wEg1BeLklypEC8jEzg5oC_6O4XACCWDg6CYnBBpgoAW_2E_ioK1E1Tui-Wbpo0JQi9s5oWaB9osNjMsuGipf8BMIN0yVtg6a6lskkhWxmWuGugY83HG9WPtYjvSjX1eH7dXbJzhWAHEKAJPyn8ILd7Y5TL5xVe6N1hAZf-haccv2HHE4u0bARY"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-10 h-10 rounded-full border-2 border-surface-container-low object-cover"
                alt="User 3"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO5jwVIkxUX1esz6112B5C0PlNFy0l9chY1Xs-H0LJI0FcpvAqpWduAbAr8AF-dmnxfV6GZs5HQGwYk_J8SZCuMs4SJ9hkG6uJA81HM9RicPXNN5q0eoqvi2El3p4i-kWVTLzWlMM53UZY_I_CrrfJtFdqBw-06ddmKjG9tS5728u4YDbuiGS008vRzcaBb5MzfFXRTn-IJ8XrfMi8Tr2wvvaYLsbe7JvjcHnArMVh9SmZEr3Jfp7f1Gw5q0et7vyR-4y9RsitxO7m"
              />
              <div className="w-10 h-10 rounded-full border-2 border-surface-container-low bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant font-label tracking-widest uppercase">
                +2k
              </div>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-on-surface-variant font-label">
              Trusted by creators worldwide
            </span>
          </div>
        </div>

        {/* Right Side: Signup Form Section */}
        <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center bg-surface-container relative z-10">
          <div className="mb-10 lg:hidden flex justify-between items-center">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tighter text-primary font-headline"
            >
              Vibely
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              Login
            </Link>
          </div>

          <div className="max-w-md w-full mx-auto">
            <header className="mb-10">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">
                Create Account
              </h2>
              <p className="text-on-surface-variant">
                Enter your details to start your journey.
              </p>
            </header>

            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error text-center font-medium">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 text-center font-medium leading-relaxed">
                  {successMessage}
                </div>
              )}

              {!successMessage && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant ml-1 font-label">
                      Full Name
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] transition-colors group-focus-within:text-primary">
                        person
                      </span>
                      <input
                        className="w-full h-14 bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-12 pr-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all outline-none shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.6)]"
                        placeholder="Alex Rivera"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant ml-1 font-label">
                      Email Address
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] transition-colors group-focus-within:text-primary">
                        mail
                      </span>
                      <input
                        className="w-full h-14 bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-12 pr-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all outline-none shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.6)]"
                        placeholder="alex@vibely.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant ml-1 font-label">
                      Secure Password
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] transition-colors group-focus-within:text-primary">
                        lock
                      </span>
                      <input
                        className="w-full h-14 bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-12 pr-12 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all outline-none tracking-wider shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.6)]"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant ml-1 font-label">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] transition-colors group-focus-within:text-primary">
                        lock
                      </span>
                      <input
                        className="w-full h-14 bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-12 pr-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all outline-none tracking-wider shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.6)]"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      className="w-full h-14 bg-gradient-to-r from-primary to-primary-dim text-on-primary-container font-extrabold rounded-xl shadow-[0_8px_30px_rgb(189,157,255,0.15)] hover:shadow-[0_8px_30px_rgb(189,157,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-headline tracking-tight disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </>
              )}
            </form>

            <footer className="mt-10 text-center space-y-4">
              <p className="text-sm text-on-surface-variant font-body">
                Already have an account?
                <Link
                  className="text-primary font-semibold hover:text-primary-dim hover:underline decoration-primary/30 underline-offset-4 transition-all ml-1"
                  href="/login"
                >
                  Login
                </Link>
              </p>
              <p className="text-[11px] text-outline leading-relaxed max-w-xs mx-auto font-body">
                By signing up, you agree to our
                <Link
                  className="text-on-surface-variant hover:text-on-surface underline decoration-outline-variant underline-offset-2 mx-1"
                  href="/terms"
                >
                  Terms of Service
                </Link>
                and
                <Link
                  className="text-on-surface-variant hover:text-on-surface underline decoration-outline-variant underline-offset-2 mx-1"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </footer>
          </div>
        </div>
      </main>
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
