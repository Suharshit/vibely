"use client";

// ============================================================
// apps/web/app/events/[id]/page.tsx  (updated for Phase 9)
// ============================================================

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEvent } from "@/hooks/useEvents";
import { usePhotos } from "@/hooks/usePhotos";
import { QRCodeDisplay } from "@/components/events/QRCodeDisplay";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import {
  formatEventDate,
  relativeTime,
  isEventExpired,
} from "@shared/utils/invite";

type PageProps = { params: Promise<{ id: string }> };

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    event,
    userRole,
    isLoading: eventLoading,
    error: eventError,
  } = useEvent(id);
  const {
    photos,
    pagination,
    isLoading: photosLoading,
    uploads,
    fetchPage,
    uploadFiles,
    deletePhoto,
    savePhoto,
    unsavePhoto,
  } = usePhotos(id);

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            {eventError ?? "Event not found"}
          </p>
          <Link
            href="/dashboard"
            className="text-violet-600 text-sm font-medium hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isHost = userRole === "host";
  const expired = isEventExpired(event.expires_at);
  const canUpload = !expired && event.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover banner */}
      <div className="h-48 sm:h-64 bg-linear-to-br from-violet-200 via-purple-100 to-pink-100 relative">
        {event.cover_image_url && (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            fill
            sizes="100vw"
          />
        )}
        <Link
          href="/dashboard"
          className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        {isHost && (
          <div className="absolute top-4 right-4">
            <Link
              href={`/events/${event.id}/edit`}
              className="text-sm font-medium px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors text-gray-700"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 pb-16">
        {/* Event meta card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {event.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {formatEventDate(event.event_date)}
              </p>
            </div>
            <span
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
                expired || event.status !== "active"
                  ? "bg-gray-50 text-gray-500 border-gray-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
              }`}
            >
              {expired ? "Ended" : "Active"}
            </span>
          </div>

          {event.description && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-4 text-xs text-gray-400">
            <span>
              Hosted by{" "}
              <strong className="text-gray-600">{event.host?.name}</strong>
            </span>
            <span>·</span>
            <span>{event.event_members?.length ?? 0} members</span>
            <span>·</span>
            <span>{photos.length} photos</span>
            <span>·</span>
            <span>Expires {relativeTime(event.expires_at)}</span>
          </div>
        </div>

        {/* Side-by-side: invite QR + members */}
        {!expired && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Invite guests
              </h2>
              <QRCodeDisplay
                inviteToken={event.invite_token}
                eventTitle={event.title}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Members ({event.event_members?.length ?? 0})
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {event.event_members?.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      {member.user?.avatar_url ? (
                        <Image
                          src={member.user.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <span className="text-xs font-medium text-violet-700">
                          {(member.user?.name ?? "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.user?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Photo upload + gallery */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              Photos{" "}
              {photos.length > 0 && (
                <span className="text-gray-400 font-normal">
                  ({pagination?.total ?? photos.length})
                </span>
              )}
            </h2>
          </div>

          {canUpload && (
            <div className="mb-6">
              <PhotoUploader
                eventId={id}
                onUpload={uploadFiles}
                uploads={uploads}
              />
            </div>
          )}

          {expired && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
              This event has ended. Photos are view-only. Save any photos to
              your vault before they expire.
            </div>
          )}

          <PhotoGallery
            photos={photos}
            isLoading={photosLoading}
            pagination={pagination}
            onPageChange={fetchPage}
            onSave={savePhoto}
            onUnsave={unsavePhoto}
            onDelete={async (id) => {
              await deletePhoto(id);
            }}
          />
        </div>
      </div>
    </div>
  );
}
