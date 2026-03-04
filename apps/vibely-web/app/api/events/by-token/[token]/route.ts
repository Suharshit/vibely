// ============================================================
// apps/web/app/api/events/by-token/[token]/route.ts
// ============================================================
// GET /api/events/by-token/:token
//
// WHY a separate token-lookup endpoint?
// The join page (/join/:token) only has the token, not the event
// ID. This endpoint resolves a token to the full event preview.
// It's intentionally public (no auth) since it's the entry point
// for guests and new members who don't have an account yet.
// We limit returned fields to only what the preview page needs.
// ============================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

type RouteParams = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { token } = await params;

  if (!token || token.length !== 12) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      cover_image_url,
      event_date,
      expires_at,
      status,
      upload_permission,
      invite_token,
      host:users!host_id (
        id,
        name,
        avatar_url
      )
    `)
    .eq('invite_token', token)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
  }

  if (event.status !== 'active') {
    return NextResponse.json({ error: 'This event has ended' }, { status: 410 });
  }

  // Get member count for social proof on the invite page
  const { count: memberCount } = await supabase
    .from('event_members')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', event.id);

  return NextResponse.json({
    event: { ...event, member_count: memberCount ?? 0 },
  });
}