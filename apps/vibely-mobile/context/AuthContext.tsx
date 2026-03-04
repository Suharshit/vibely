// ============================================================
// apps/mobile/context/AuthContext.tsx
// ============================================================
// This is the React Native equivalent of the web AuthContext.
// The logic is almost identical — the key differences are:
//
// 1. NO cookies: React Native uses AsyncStorage via the Supabase
//    client config we set up in lib/supabase/client.ts
//
// 2. NO redirectTo URLs: OAuth callbacks on mobile use deep links
//    (e.g. vibely://auth/callback) not HTTP URLs. The Expo
//    AuthSession module handles this.
//
// 3. AppState listener: When the mobile app returns from background
//    (user switched apps, then came back), we need to refresh the
//    session. Browsers handle this automatically; React Native doesn't.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
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
  signOut: () => Promise<void>;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

// ── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadSession = useCallback(async () => {
    // On React Native, getSession() reads from AsyncStorage.
    // It's synchronous in terms of loading the stored token
    // but we still need to call refreshSession() to verify it
    // with Supabase's server.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setState({
      user: session?.user ?? null,
      session,
      isLoading: false,
      isAuthenticated: !!session?.user,
    });
  }, []);

  useEffect(() => {
    loadSession();

    // ── Auth state listener ─────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session?.user,
      });
    });

    // ── AppState listener ───────────────────────────────────
    // WHY: When the app moves to background and comes back, the
    // JWT might have expired. We call startAutoRefresh/stopAutoRefresh
    // to let Supabase manage token refresh only while app is active.
    // This avoids unnecessary background network calls and battery drain.
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, [loadSession]);

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
          data: { full_name: name },
          // On mobile, we don't have a web URL for email redirect.
          // We use a deep link scheme instead — configure this in
          // your Supabase project under Auth → URL Configuration
          emailRedirectTo: "vibely://auth/callback",
        },
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: msg };
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
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: msg };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    // onAuthStateChange fires and resets state
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth() must be used within an <AuthProvider>");
  }
  return context;
}
