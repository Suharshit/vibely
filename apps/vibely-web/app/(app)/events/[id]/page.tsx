"use client";

// ============================================================
// apps/web/app/(app)/events/[id]/page.tsx
// ============================================================

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvent } from "@/hooks/useEvents";
import { usePhotos } from "@/hooks/usePhotos";
import { isEventExpired } from "@shared/utils/invite";

import { EventHero } from "@/components/events/EventHero";
import { EventTabs, EventTabId } from "@/components/events/EventTabs";
import { EventActionBar } from "@/components/events/EventActionBar";
import { EventGallery } from "@/components/events/EventGallery";
import { EventQRPanel } from "@/components/events/EventQRPanel";
import { EventStatsCard } from "@/components/events/EventStatsCard";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import { EditEventForm } from "@/components/events/EditEventForm";

export type EventPageProps = { params: Promise<{ id: string }> };

export default function EventDetailPage({ params }: EventPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const {
    event,
    userRole,
    isLoading: eventLoading,
    error: eventError,
    updateEvent,
    deleteEvent,
  } = useEvent(id);

  const {
    photos,
    pagination,
    isLoading: photosLoading,
    uploads,
    fetchPage,
    uploadFiles,
    savePhoto,
    unsavePhoto,
  } = usePhotos(id);

  const [activeTab, setActiveTab] = useState<EventTabId>("gallery");
  const [showUploader, setShowUploader] = useState(false);

  if (eventLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="glass-card p-12 rounded-[3rem] text-center border border-white/5">
          <h2 className="text-2xl font-black font-headline text-white mb-2">
            Event Not Found
          </h2>
          <p className="text-on-surface-variant mb-8 max-w-sm">
            {eventError ??
              "The event you are looking for doesn't exist or you don't have access."}
          </p>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-primary hover:bg-primary-dim text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary/20"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isHost = userRole === "host";
  const expired = event.expires_at ? isEventExpired(event.expires_at) : false;
  const canUpload = !expired && event.status === "active";

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30 selection:text-white antialiased">
      {/* Header: Hero Section */}
      <EventHero
        id={event.id}
        title={event.title}
        date={event.event_date}
        guestCount={event.event_members?.length ?? 0}
        coverImageUrl={event.cover_image_url}
        status={event.status}
        expiresAt={event.expires_at ?? null}
        isHost={isHost}
      />

      <div className="px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 pb-24">
        {/* Left Column: Tabs & Gallery */}
        <div className="col-span-1 lg:col-span-8">
          <EventTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            photoCount={pagination?.total ?? photos.length}
            guestCount={event.event_members?.length ?? 0}
          />

          {activeTab === "gallery" && (
            <>
              <EventActionBar
                title="Recent Uploads"
                subtitle="Photos showing the latest moments"
                onBulkSelect={() => console.log("Bulk Select clicked")}
                onDownloadAll={() => console.log("Download All clicked")}
                onUpload={() => setShowUploader(!showUploader)}
              />

              {canUpload && showUploader && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <PhotoUploader
                    eventId={id}
                    onUpload={uploadFiles}
                    uploads={uploads}
                  />
                </div>
              )}

              {expired && (
                <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-sm font-medium text-amber-500 backdrop-blur-md">
                  This event has ended. Photos are view-only. Save any photos to
                  your vault before they expire.
                </div>
              )}

              <EventGallery
                photos={photos}
                eventTitle={event.title}
                isLoading={photosLoading}
                pagination={pagination}
                onPageChange={fetchPage}
                onOpenPhoto={(photo) => router.push(`/photos/${photo.id}`)}
                onSavePhoto={savePhoto}
                onUnsavePhoto={unsavePhoto}
              />
            </>
          )}

          {activeTab === "guests" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-bold text-white">Guest List</h3>
                <span className="text-sm text-on-surface-variant">
                  {event.event_members?.length ?? 0} total
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.event_members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                      {member.user?.name
                        ? member.user.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">
                        {member.user?.name ?? "Unknown Guest"}
                      </p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md">
                        {member.role === "host" ? "Host" : "Guest"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="px-2">
                <h3 className="text-xl font-bold text-white mb-2">
                  Event Settings
                </h3>
                <p className="text-on-surface-variant text-sm">
                  Update your event details, change visibility, or delete this
                  event.
                </p>
              </div>

              <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-white/[0.02]">
                {isHost ? (
                  <EditEventForm
                    event={event}
                    onUpdate={updateEvent}
                    onDelete={deleteEvent}
                  />
                ) : (
                  <div className="text-center py-10 opacity-60">
                    <span className="material-symbols-outlined text-5xl mb-4">
                      lock
                    </span>
                    <p>Only the event host can modify these settings.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Widgets */}
        <aside className="col-span-1 lg:col-span-4 space-y-8">
          {!expired && <EventQRPanel inviteToken={event.invite_token} />}
          <EventStatsCard members={event.event_members ?? []} />
        </aside>
      </div>
    </div>
  );
}
