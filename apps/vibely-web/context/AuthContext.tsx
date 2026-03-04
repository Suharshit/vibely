"use client";

// ============================================================
// apps/web/context/AuthContext.tsx
// ============================================================
// WHY a Context for auth?
// Supabase's getUser() is async and must be awaited on every
// render. Without a context, every component that needs the
// user would independently fire that async call, causing
// waterfall fetches and flicker. Instead, we fetch ONCE at
// the top of the component tree and fan the result outward
// via React Context.
//
// WHY useEffect + onAuthStateChange?
// The initial getUser() gets the user from the current session
// cookie. But what about tab switching, token refresh, logout
// in another tab? onAuthStateChange is a real-time listener
// that fires whenever the auth state changes anywhere — it's
// how we keep the UI in sync without polling.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
  // isLoading is true only during the *initial* auth check on
  // mount. After that it stays false. Use this to gate rendering
  // of protected content (show a spinner, not a flash of login page).
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    bio?: string;
    avatar_url?: string;
  }) => Promise<AuthResult>;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

// ── Context ──────────────────────────────────────────────────

// We export the context itself so advanced use cases can
// consume it with useContext directly. Most code uses useAuth().
export const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true, // Start as true — we don't know yet
    isAuthenticated: false,
  });

  // ── Server-side session validation ───────────────────────────
  // getUser() makes a network call to Supabase to re-validate the
  // JWT. This is more secure than relying solely on the local
  // session from onAuthStateChange (which trusts the stored token
  // without server re-validation). If the server says the user is
  // invalid, we override the local state to unauthenticated.
  const validateUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        // Server says the token is invalid/expired — force logout
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
      // If valid, the onAuthStateChange handler already set the correct state
    } catch {
      // Network error — trust the local session (already set by
      // INITIAL_SESSION). Just ensure isLoading is cleared.
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [supabase]);

  useEffect(() => {
    // ── Auth state listener (single source of truth) ────────
    // onAuthStateChange fires INITIAL_SESSION immediately upon
    // registration with the locally stored session. This gives us
    // a fast initial load. It then continues to listen for future
    // events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED.
    //
    // We handle ALL events generically by checking session presence
    // instead of individual event names — this is more robust and
    // future-proof against new Supabase event types.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setState({
          user: session.user,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    // After the fast INITIAL_SESSION sets state, kick off a
    // background server validation for extra security. If the
    // server says the token is invalid, we'll flip to logged-out.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    validateUser();

    return () => subscription.unsubscribe();
  }, [validateUser, supabase]);

  // ── Auth actions ────────────────────────────────────────────

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // This metadata flows into the handle_new_user() trigger
          // we wrote in the DB migration — it populates users.name
          data: { full_name: name },
          // After email confirmation, redirect here
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      // Network errors (502, CORS, offline) throw instead of
      // returning { error }. Catch them so the UI stays usable.
      const message = err instanceof Error ? err.message : "Network error";
      return { success: false, error: message };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      return { success: false, error: message };
    }
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // After Google redirects back, this route exchanges the
        // code for a session cookie (see auth/callback/route.ts)
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          // Forces Google to show the account picker even if
          // the user is already signed into one Google account.
          // Prevents users from being silently signed in as the
          // wrong account.
          prompt: "select_account",
        },
      },
    });

    if (error) return { success: false, error: error.message };
    // No success state here — the browser will navigate away to Google
    return { success: true };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    // onAuthStateChange fires 'SIGNED_OUT' and updates state
  };

  const updateProfile = async (data: {
    name?: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<AuthResult> => {
    if (!state.user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("users")
      .update({
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatar_url && { avatar_url: data.avatar_url }),
      })
      .eq("id", state.user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

// This is the hook your components actually use:
//   const { user, signIn, isLoading } = useAuth();
//
// The null check ensures we always call it inside <AuthProvider>.
// Failing loudly here is better than a confusing undefined error
// somewhere deep in a component.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth() must be used within an <AuthProvider>");
  }
  return context;
}
