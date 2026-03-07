// ============================================================
// apps/web/app/api/health/route.ts
// ============================================================
// Simple health check endpoint.
// Used by Vercel uptime checks and the vercel.json rewrite for /health.
// Also does a lightweight DB ping to confirm Supabase connectivity.
// ============================================================

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const start = Date.now();

  let dbOk = false;
  try {
    const adminSupabase = createAdminClient();
    // Lightweight query — just checks the connection
    const { error } = await adminSupabase
      .from("events")
      .select("id")
      .limit(1)
      .maybeSingle();
    dbOk = !error;
  } catch {
    dbOk = false;
  }

  const latencyMs = Date.now() - start;
  const status = dbOk ? 200 : 503;

  return NextResponse.json(
    {
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "connected" : "unreachable",
      latency_ms: latencyMs,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
