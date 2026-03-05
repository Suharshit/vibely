// ============================================================
// apps/mobile/hooks/useEvents.ts
// ============================================================
// Mobile version of the events hook.
// Key difference from web: instead of fetch('/api/events'), we
// call Supabase directly from the mobile client. No API layer
// is needed for read operations — the JS client with RLS handles
// security.
//
// For writes (create/update/delete) we also call Supabase
// directly. We only need the Next.js API for operations requiring
// the service role key (guest sessions, cron jobs, etc.).
//
// WHY call Supabase directly from mobile instead of your API?
// 1. Fewer hops: mobile → Supabase vs mobile → your API → Supabase
// 2. RLS on Supabase handles auth — you don't need to re-implement
//    it in your API layer for standard CRUD
// 3. Supabase JS client handles auth token automatically
// The tradeoff: business logic must be split between client and
// server. Complex multi-step operations still go through the API.
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { generateInviteToken, defaultExpiresAt } from "@shared/utils/invite";

export type EventWithRole = {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  host_id: string;
  invite_token: string;
  event_date: string;
  expires_at: string;
  status: "active" | "expired" | "archived";
  upload_permission: "open" | "restricted";
  created_at: string;
  user_role: "host" | "contributor" | "viewer";
  host: { id: string; name: string; avatar_url: string | null } | null;
};

export function useEvents() {
  const [events, setEvents] = useState<EventWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: queryError } = await supabase
        .from("event_members")
        .select(
          `
          role,
          events (
            id, title, description, cover_image_url,
            host_id, invite_token, event_date, expires_at,
            status, upload_permission, created_at,
            host:users!host_id ( id, name, avatar_url )
          )
        `
        )
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });

      if (queryError) throw queryError;

      const flattened: EventWithRole[] = (data ?? [])
        .map(({ role, events: event }: any) => {
          if (!event) return null;
          return { ...event, user_role: role };
        })
        .filter(Boolean);

      setEvents(flattened);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(
    async (data: {
      title: string;
      description?: string | null;
      event_date: string;
      upload_permission?: "open" | "restricted";
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const inviteToken = generateInviteToken();
      const eventDate = new Date(data.event_date);

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          title: data.title,
          description: data.description ?? null,
          host_id: user.id,
          invite_token: inviteToken,
          event_date: eventDate.toISOString(),
          expires_at: defaultExpiresAt(eventDate).toISOString(),
          upload_permission: data.upload_permission ?? "open",
          status: "active",
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      await fetchEvents();
      return { success: true, event };
    },
    [fetchEvents]
  );

  const joinEvent = useCallback(
    async (token: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // Look up event by token
      const { data: event, error: lookupError } = await supabase
        .from("events")
        .select("id, title, status")
        .eq("invite_token", token)
        .single();

      if (lookupError || !event)
        return { success: false, error: "Invalid invite link" };
      if (event.status !== "active")
        return { success: false, error: "This event has ended" };

      // Check existing membership
      const { data: existing } = await supabase
        .from("event_members")
        .select("id, role")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .single();

      if (existing)
        return {
          success: true,
          event,
          role: existing.role,
          alreadyMember: true,
        };

      const { error: joinError } = await supabase.from("event_members").insert({
        event_id: event.id,
        user_id: user.id,
        role: "contributor",
        is_guest: false,
      });

      if (joinError) return { success: false, error: joinError.message };

      await fetchEvents();
      return { success: true, event, role: "contributor" };
    },
    [fetchEvents]
  );

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    setEvents((prev) => prev.filter((e) => e.id !== id));
    return { success: true };
  }, []);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
    createEvent,
    joinEvent,
    deleteEvent,
  };
}
