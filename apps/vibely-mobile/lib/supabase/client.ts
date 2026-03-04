// ============================================================
// apps/mobile/lib/supabase/client.ts
// ============================================================
// React Native Supabase client.
// Key differences from the web client:
//
// 1. Singleton export (not a function): React Native doesn't
//    have the same SSR/multi-request concerns as Next.js.
//    A module-level singleton is fine and actually preferable
//    because it ensures the same client instance (and its
//    real-time subscriptions) is reused throughout the app.
//
// 2. AsyncStorage: The auth session tokens are persisted to
//    device storage so users stay logged in across app restarts.
//
// 3. detectSessionInUrl: false: Prevents the client from trying
//    to parse tokens from the URL (which doesn't apply on mobile).
// ============================================================

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@repo/supabase/types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Export as a named singleton so all imports share the same instance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
