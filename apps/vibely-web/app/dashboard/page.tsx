// ============================================================
// apps/web/app/dashboard/page.tsx
// ============================================================
// Temporary placeholder — Phase 8 builds the real dashboard.
// This confirms auth + middleware are working correctly.
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // In Server Components we use the server client directly —
  // no hooks needed. If getUser() fails, middleware should have
  // already redirected, but we add a safety net here.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's profile from public.users
  const { data: profile } = await supabase
    .from("users")
    .select("name, email, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
        Welcome, {profile?.name ?? user.email} 🎉
      </h1>
      <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
        Auth is working! Dashboard coming in Phase 8.
      </p>
      <pre
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "#f3f4f6",
          borderRadius: "8px",
          fontSize: "0.75rem",
        }}
      >
        {JSON.stringify(
          { id: user.id, email: user.email, provider: profile },
          null,
          2
        )}
      </pre>
    </main>
  );
}
