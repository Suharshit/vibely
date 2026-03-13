"use client";

import { useState, useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { createClient } from "@/lib/supabase/client";

// New Components
import OverviewHeader from "@/components/dashboard/OverviewHeader";
import KPIGroup from "@/components/dashboard/KPIGroup";
import EventGrid from "@/components/events/EventGrid";
import CreateEventCard from "@/components/events/CreateEventCard";
import EventCard from "@/components/events/EventCard";
import { isEventExpired } from "@shared/utils/invite";

export default function DashboardPage() {
  const { events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const {
    totalPhotos,
    formattedSize,
    isLoading: statsLoading,
  } = useDashboardStats();
  const [userName, setUserName] = useState("User");

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

  return (
    <div className="w-full h-full flex flex-col gap-10 pb-16">
      {/* Top Section: Greeting & KPIs */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <OverviewHeader userName={userName} />
        {statsLoading || eventsLoading ? (
          <div className="flex gap-4 animate-pulse">
            <div className="h-10 w-28 bg-gray-200 rounded-full"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-full"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-full"></div>
          </div>
        ) : (
          <KPIGroup
            totalEvents={events.length}
            totalPhotos={totalPhotos}
            formattedSize={formattedSize}
          />
        )}
      </section>

      {/* Main Grid Section */}
      <section className="w-full">
        {eventsError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-6">
            {eventsError}
          </div>
        )}

        <EventGrid>
          {/* Always show the Create card first */}
          <CreateEventCard />

          {/* Skeleton Loaders */}
          {eventsLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="w-full aspect-[1/2] sm:aspect-auto sm:h-[480px] rounded-[32px] bg-gray-200 animate-pulse"
              />
            ))}

          {/* Render real events */}
          {!eventsLoading &&
            events.map((event) => {
              const expired =
                isEventExpired(event.expires_at) || event.status !== "active";

              // Mocking specific design elements that might not be in DB yet
              // Fallback cover image if none is provided
              const coverImg =
                event.cover_image_url ||
                "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop";
              const formattedDate = new Date(
                event.created_at
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  dateStr={formattedDate}
                  description={
                    event.description ||
                    "Capture every moment, curate every memory with Vibely."
                  }
                  imageUrl={coverImg}
                  status={expired ? "EXPIRED" : "ACTIVE"}
                  tags={
                    expired
                      ? ["Professional", "Archive"]
                      : ["Outdoor", "Social"]
                  }
                />
              );
            })}
        </EventGrid>
      </section>
    </div>
  );
}
