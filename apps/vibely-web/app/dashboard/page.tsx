"use client";

// ============================================================
// apps/web/app/dashboard/page.tsx
// ============================================================
// Main dashboard: shows all events the user belongs to,
// separated into "upcoming" and "past" sections.
// Has a prominent "Create event" CTA.
//
// WHY 'use client' here?
// The useEvents hook uses useState/useEffect — Client Component
// territory. For a larger app, you'd fetch the initial events
// list in a Server Component and pass it as props to avoid the
// loading flicker. We keep it simple here for the MVP.
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { isEventExpired } from "@shared/utils/invite";

export default function DashboardPage() {
  const { events, isLoading, error, deleteEvent } = useEvents();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;

    // Simple browser confirm — Phase 14 (polish) will replace with a modal
    const confirmed = window.confirm(
      `Delete "${event.title}"? This will permanently delete all photos. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    await deleteEvent(id);
    setDeletingId(null);
  };

  // Split events into upcoming (active) and past (expired/archived)
  const upcoming = events.filter(
    (e) => !isEventExpired(e.expires_at) && e.status === "active"
  );
  const past = events.filter(
    (e) => isEventExpired(e.expires_at) || e.status !== "active"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
            <p className="mt-1 text-sm text-gray-500">
              {events.length === 0
                ? "No events yet"
                : `${events.length} event${events.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <Link
            href="/events/create"
            className="flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-violet-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create event
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-32 bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && events.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No events yet
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Create your first event and start collecting photos from everyone
              there.
            </p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors"
            >
              Create your first event
            </Link>
          </div>
        )}

        {/* Upcoming events */}
        {!isLoading && upcoming.length > 0 && (
          <section className="mb-10">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Upcoming
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((event) => (
                <div
                  key={event.id}
                  className={
                    deletingId === event.id
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                >
                  <EventCard event={event} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past events */}
        {!isLoading && past.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Past events
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {past.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
