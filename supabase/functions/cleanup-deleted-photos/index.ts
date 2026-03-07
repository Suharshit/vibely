// ============================================================
// supabase/functions/cleanup-deleted-photos/index.ts
// ============================================================
// Supabase Edge Function that runs on a schedule to hard-delete
// files from storage for photos that have been soft-deleted
// for more than 7 days.
//
// WHY an Edge Function for storage deletion instead of pg_cron?
// pg_cron runs SQL — it can UPDATE rows but it cannot call the
// Supabase Storage API to delete actual files. The Storage API
// is HTTP — only an Edge Function (or external service) can
// make those HTTP calls. So we use pg_cron to mark rows as
// 'deleted', and an Edge Function to do the actual file removal.
//
// HOW to invoke on a schedule:
// Option A: Supabase Dashboard → Edge Functions → add a cron
//   trigger. Set it to run daily at 02:00 UTC.
// Option B: Add a pg_cron job that calls the function via HTTP:
// --   SELECT cron.schedule('cleanup-storage', '0 2 * * *',
// --     $$ SELECT net.http_post(
// --       url := current_setting('app.edge_function_url') || '/cleanup-deleted-photos',
// --       headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
// --     ) $$
// --   );
// For simplicity, use the Dashboard trigger (Option A).
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BATCH_SIZE = 100; // process N files per invocation to stay within timeout
const DELETE_AFTER_DAYS = 7;

Deno.serve(async (req) => {
  // Allow invocation via cron (Supabase internal) or manual HTTP call
  // Require the service role key as a Bearer token for manual calls
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (authHeader && authHeader !== `Bearer ${serviceKey}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  const cutoff = new Date(
    Date.now() - DELETE_AFTER_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  // Fetch batch of soft-deleted photos older than cutoff
  const { data: photos, error: fetchError } = await supabase
    .from("photos")
    .select("id, storage_key")
    .eq("status", "deleted")
    .lt("deleted_at", cutoff)
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error("Failed to fetch deleted photos:", fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!photos || photos.length === 0) {
    return new Response(
      JSON.stringify({ deleted: 0, message: "Nothing to clean up" }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const storageKeys = photos.map((p) => p.storage_key);
  const photoIds = photos.map((p) => p.id);

  // Hard-delete files from Supabase Storage
  // remove() accepts an array of paths — one API call for the whole batch
  const { error: storageError } = await supabase.storage
    .from("event-photos")
    .remove(storageKeys);

  if (storageError) {
    console.error("Storage deletion error:", storageError);
    // Abort — if we delete DB rows now we lose storage_key references
    // and those orphaned files can never be cleaned up. Retry next run.
    return new Response(
      JSON.stringify({
        error:
          "Storage deletion failed, skipping DB cleanup to avoid orphaned files",
        detail: storageError.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Hard-delete the DB rows (they've been soft-deleted for 7+ days)
  const { error: dbError } = await supabase
    .from("photos")
    .delete()
    .in("id", photoIds);

  if (dbError) {
    console.error("DB deletion error:", dbError);
    return new Response(JSON.stringify({ error: dbError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`Cleaned up ${photos.length} photos from storage and DB`);

  return new Response(
    JSON.stringify({
      deleted: photos.length,
      storage_keys: storageKeys,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});
