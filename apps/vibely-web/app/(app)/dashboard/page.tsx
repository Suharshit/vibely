"use client";

import { useState, useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import EventCard from "@/components/events/EventCard";

export default function DashboardPage() {
  const { events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const {
    totalPhotos,
    formattedSize,
    isLoading: statsLoading,
  } = useDashboardStats();
  const [userName, setUserName] = useState("Host");

  // Fetch user for the greeting
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data && data.name) {
            // Pick first name
            setUserName(data.name.split(" ")[0]);
          }
        });
    });
  }, []);

  const upcomingCount = events.filter(
    (e) => new Date(e.event_date) > new Date()
  ).length;

  return (
    <>
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
            Welcome, {userName}
          </h2>
          <p className="text-on-surface-variant max-w-md">
            Your collective galleries are flourishing with new memories.
          </p>
        </div>

        <div className="absolute top-0 right-0 md:relative md:top-auto md:right-auto">
          <button className="w-12 h-12 rounded-2xl bg-surface/30 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-on-surface hover:bg-primary/10 hover:text-primary transition-all duration-300 shadow-2xl group">
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
              notifications
            </span>
            <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-background"></div>
          </button>
        </div>
      </header>

      {/* Bento Grid for Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Photos Stat */}
        <div className="bg-surface/30 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl group hover:border-primary/20 transition-all duration-500 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">
                photo_library
              </span>
            </span>
            <span className="text-xs font-label text-primary font-bold tracking-widest">
              +12%
            </span>
          </div>
          <h3 className="text-on-surface-variant text-sm font-label uppercase tracking-widest mb-1">
            Total Photos
          </h3>
          <p className="text-3xl font-headline font-extrabold text-on-surface">
            {statsLoading ? "..." : totalPhotos.toLocaleString()}
          </p>
        </div>

        {/* Storage Stat */}
        <div className="bg-surface/30 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl group hover:border-secondary/20 transition-all duration-500 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 blur-3xl rounded-full group-hover:bg-secondary/10 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 rounded-2xl bg-secondary-container/10 text-secondary">
              <span className="material-symbols-outlined text-2xl">
                cloud_done
              </span>
            </span>
          </div>
          <h3 className="text-on-surface-variant text-sm font-label uppercase tracking-widest mb-1">
            Storage Used
          </h3>
          <p className="text-3xl font-headline font-extrabold text-on-surface">
            {statsLoading ? "..." : formattedSize}
          </p>
        </div>

        {/* Upcoming Events Stat */}
        <div className="bg-surface/30 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl group hover:border-tertiary/20 transition-all duration-500 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 blur-3xl rounded-full group-hover:bg-tertiary/10 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 rounded-2xl bg-tertiary-container/10 text-tertiary">
              <span className="material-symbols-outlined text-2xl">event</span>
            </span>
          </div>
          <h3 className="text-on-surface-variant text-sm font-label uppercase tracking-widest mb-1">
            Upcoming Events
          </h3>
          <p className="text-3xl font-headline font-extrabold text-on-surface">
            {eventsLoading ? "..." : upcomingCount}
          </p>
        </div>
      </div>

      <div className="w-full">
        {/* Active Events Canvas */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
            Active Galleries
          </h3>
          <Link
            href="/dashboard/events"
            className="text-primary text-sm font-semibold hover:underline decoration-2 underline-offset-4 flex items-center gap-1 group"
          >
            See all archives
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        {eventsError && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-sm text-error mb-6 backdrop-blur-xl">
            {eventsError}
          </div>
        )}

        {!eventsLoading && events.length === 0 ? (
          /* Empty State */
          <div className="mt-4 flex flex-col items-center justify-center p-16 bg-surface/20 backdrop-blur-3xl border border-white/5 rounded-3xl text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="w-24 h-24 mb-6 relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
              <span className="material-symbols-outlined text-6xl text-primary relative z-10">
                auto_awesome
              </span>
            </div>
            <h4 className="text-2xl font-bold font-headline text-on-surface mb-2 relative z-10">
              No Events Yet
            </h4>
            <p className="text-on-surface-variant max-w-xs mb-8 relative z-10">
              Ready to start capturing memories? Your first gallery is just a
              few clicks away.
            </p>
            <Link
              href="/events/create"
              className="px-8 py-4 bg-primary hover:bg-primary-dim text-on-primary-container rounded-2xl font-bold font-headline shadow-xl shadow-primary/20 active:scale-95 transition-all relative z-10"
            >
              Create First Event
            </Link>
          </div>
        ) : (
          /* Events Grid - Redesigned with Glassmorphism */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="w-full h-80 rounded-3xl bg-white/5 animate-pulse border border-white/5"
                  />
                ))
              : events.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    event_date={event.event_date}
                    description={event.description}
                    cover_image_url={event.cover_image_url}
                    status={event.status}
                    expires_at={event.expires_at}
                  />
                ))}
          </div>
        )}
      </div>
    </>
  );
}
