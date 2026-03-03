// ============================================================
// Browser client — used in "use client" components
// Uses the user's JWT → RLS is enforced
// ============================================================
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/../../packages/shared/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
