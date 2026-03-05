"use client";

// ============================================================
// apps/web/components/events/EventCard.tsx
// ============================================================
// Displays a compact event summary in the dashboard grid.
// Shows: cover image/placeholder, title, date, member count,
// status badge, and the user's role.
// ============================================================

import Link from "next/link";
import {
  formatEventDate,
  relativeTime,
  isEventExpired,
} from "@shared/utils/invite";
import type { EventWithRole } from "@/hooks/useEvents";

interface EventCardProps {
  event: EventWithRole;
  onDelete?: (id: string) => void;
}

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  expired: "bg-gray-50 text-gray-500 border-gray-100",
  archived: "bg-amber-50 text-amber-700 border-amber-100",
} as const;

const ROLE_LABEL = {
  host: "Host",
  contributor: "Member",
  viewer: "Viewer",
} as const;

export function EventCard({ event, onDelete }: EventCardProps) {
  const expired = isEventExpired(event.expires_at);
  const displayStatus = (
    expired && event.status === "active" ? "expired" : event.status
  ) as keyof typeof STATUS_STYLES;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Cover image or gradient placeholder */}
      <div className="h-32 bg-linear-to-br from-violet-100 via-purple-50 to-pink-100 relative overflow-hidden">
        {event.cover_image_url && (
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Status badge overlaid on the image */}
        <span
          className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[displayStatus]}`}
        >
          {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
        </span>

        {/* Role badge */}
        <span className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full bg-black/20 text-white backdrop-blur-sm">
          {ROLE_LABEL[event.user_role]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/events/${event.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-violet-700 transition-colors line-clamp-1 text-base">
            {event.title}
          </h3>
        </Link>

        <p className="mt-1 text-xs text-gray-500 line-clamp-1">
          {formatEventDate(event.event_date)}
        </p>

        {event.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Footer row */}
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {/* Calendar icon */}
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {relativeTime(event.event_date)}
          </div>

          {/* Action buttons — only visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/events/${event.id}`}
              className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View
            </Link>

            {event.user_role === "host" && (
              <>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete?.(event.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
