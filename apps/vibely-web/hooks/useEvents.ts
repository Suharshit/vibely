// ============================================================
// apps/web/hooks/useEvents.ts
// ============================================================
// WHY a custom hook instead of fetching in components?
// Centralizing data fetching logic means:
// 1. Multiple components can share the same events data without
//    re-fetching (the hook caches in state at the component or
//    context level)
// 2. Loading/error/data states are handled consistently
// 3. Mutations (create, update, delete) automatically refresh
//    the list so the UI stays in sync
//
// In a larger app you'd use SWR or React Query for caching and
// background revalidation. This hook gives you the same patterns
// but without the extra dependency — easy to migrate later.
// ============================================================

import { useState, useEffect, useCallback } from "react";
import type { Tables } from "@repo/supabase/types";
import { cachedFetch, invalidateCache, getCached } from "@/lib/fetchCache";

// The event row augmented with the current user's role
export type EventWithRole = Tables<"events"> & {
  user_role: "host" | "contributor" | "viewer";
  host: Pick<Tables<"users">, "id" | "name" | "avatar_url">;
};

// The full event detail including members
export type EventDetail = EventWithRole & {
  event_members: Array<{
    id: string;
    role: string;
    joined_at: string;
    is_guest: boolean;
    user: Pick<Tables<"users">, "id" | "name" | "avatar_url"> | null;
  }>;
};

interface UseEventsReturn {
  events: EventWithRole[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createEvent: (
    data: CreateEventData
  ) => Promise<{ success: boolean; event?: EventWithRole; error?: string }>;
  updateEvent: (
    id: string,
    data: UpdateEventData
  ) => Promise<{ success: boolean; error?: string }>;
  deleteEvent: (id: string) => Promise<{ success: boolean; error?: string }>;
}

interface CreateEventData {
  title: string;
  description?: string | null;
  event_date: string;
  expires_at?: string;
  upload_permission?: "open" | "restricted";
}

interface UpdateEventData {
  title?: string;
  description?: string | null;
  event_date?: string;
  expires_at?: string;
  upload_permission?: "open" | "restricted";
  status?: "active" | "expired" | "archived";
}

const EVENTS_CACHE_KEY = "events";

export function useEvents(): UseEventsReturn {
  const cached = getCached<{ events: EventWithRole[] }>(EVENTS_CACHE_KEY);
  const [events, setEvents] = useState<EventWithRole[]>(cached?.events ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await cachedFetch(EVENTS_CACHE_KEY, async () => {
        const res = await fetch("/api/events");
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Failed to fetch events");
        }
        return res.json();
      });
      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ── Create ────────────────────────────────────────────────

  const createEvent = useCallback(
    async (data: CreateEventData) => {
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const json = await res.json();

        if (!res.ok) {
          return {
            success: false,
            error: json.error ?? "Failed to create event",
          };
        }

        // Optimistically prepend to local state, then refetch for accuracy
        invalidateCache(EVENTS_CACHE_KEY);
        await fetchEvents();
        return { success: true, event: json.event };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
    [fetchEvents]
  );

  // ── Update ────────────────────────────────────────────────

  const updateEvent = useCallback(async (id: string, data: UpdateEventData) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: json.error ?? "Failed to update event",
        };
      }

      // Update in local state without full refetch for responsiveness
      invalidateCache(EVENTS_CACHE_KEY);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...json.event } : e))
      );
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  // ── Delete ────────────────────────────────────────────────

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: json.error ?? "Failed to delete event",
        };
      }

      // Remove immediately from local state
      invalidateCache(EVENTS_CACHE_KEY);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

// ── Single Event Hook ─────────────────────────────────────────

export function useEvent(id: string) {
  const cacheKey = `event:${id}`;
  const cached = getCached<{ event: EventDetail; user_role: string }>(cacheKey);

  const [event, setEvent] = useState<EventDetail | null>(cached?.event ?? null);
  const [userRole, setUserRole] = useState<string | null>(
    cached?.user_role ?? null
  );
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await cachedFetch(cacheKey, async () => {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error ?? "Event not found");
        }
        return res.json();
      });
      setEvent(data.event);
      setUserRole(data.user_role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [id, cacheKey]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const updateEvent = useCallback(
    async (data: Partial<Tables<"events">>) => {
      try {
        const res = await fetch(`/api/events/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) return { success: false, error: json.error };
        await fetchEvent();
        return { success: true };
      } catch {
        return { success: false, error: "Network error" };
      }
    },
    [id, fetchEvent]
  );

  const deleteEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error };
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, [id]);

  const joinEvent = useCallback(
    async (token: string) => {
      try {
        const res = await fetch(`/api/events/${id}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invite_token: token }),
        });
        const json = await res.json();
        if (!res.ok) return { success: false, error: json.error };
        await fetchEvent();
        return { success: true };
      } catch {
        return { success: false, error: "Network error" };
      }
    },
    [id, fetchEvent]
  );

  return {
    event,
    userRole,
    isLoading,
    error,
    refetch: fetchEvent,
    joinEvent,
    updateEvent,
    deleteEvent,
  };
}
