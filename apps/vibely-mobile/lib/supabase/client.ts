// ============================================================
// Mobile Supabase Client
//
// WHY AsyncStorage?
// React Native has no localStorage. The Supabase JS client
// accepts a custom storage adapter. We pass AsyncStorage so
// auth tokens are persisted across app restarts.
//
// WHY detectSessionInUrl: false?
// On web, Supabase reads the OAuth callback token from the URL
// hash. On React Native, deep links work differently and this
// auto-detection causes crashes.
// ============================================================
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/../../packages/shared/types/database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
});
