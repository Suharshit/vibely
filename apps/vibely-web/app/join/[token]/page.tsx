"use client";

// ============================================================
// apps/web/app/join/[token]/page.tsx
// ============================================================
// Landing page for invite links: /join/:token
//
// Flow:
//  1. Load event preview (unauthenticated API call)
//  2. If user is not logged in → show event info + login/signup CTA
//  3. If user IS logged in → show event info + "Join" button
//  4. After joining → redirect to /events/:id
//
// WHY show event info to non-members?
// This is the primary sharing surface. Someone receives the link
// at a wedding, opens it on their phone, and needs to see what
// they're about to join BEFORE creating an account. Showing a
// login wall first is bad UX.
// ============================================================

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { formatEventDate } from "@shared/utils/invite";

type PageProps = { params: Promise<{ token: string }> };

interface EventPreview {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string;
  expires_at: string;
  status: string;
  upload_permission: string;
  invite_token: string;
  member_count: number;
  host: { id: string; name: string; avatar_url: string | null };
}

export default function JoinEventPage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [event, setEvent] = useState<EventPreview | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [eventError, setEventError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Step 1: load event preview (no auth needed)
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        // We need the event ID from the token — use a lookup endpoint
        // that resolves token → event preview
        const res = await fetch(`/api/events/by-token/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setEventError(data.error ?? "Invalid invite link");
          return;
        }
        const data = await res.json();
        setEvent(data.event);
      } catch {
        setEventError("Failed to load event. Please try again.");
      } finally {
        setIsLoadingEvent(false);
      }
    };

    fetchPreview();
  }, [token]);

  const handleJoin = async () => {
    if (!event) return;
    setIsJoining(true);
    setJoinError("");

    try {
      const res = await fetch(`/api/events/${event.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_token: token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setJoinError(data.error ?? "Failed to join event");
        return;
      }

      // Joined! Redirect to the event page
      router.push(`/events/${event.id}`);
    } catch {
      setJoinError("Network error. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  // Loading state
  if (isLoadingEvent || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Link not found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {eventError || "This invite link may have expired or been revoked."}
          </p>
          <Link
            href="/"
            className="text-violet-600 text-sm font-medium hover:underline"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Event preview card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {/* Cover */}
          <div className="h-32 bg-linear-to-br from-violet-200 to-pink-100">
            {event.cover_image_url && (
              <Image
                src={event.cover_image_url}
                alt={event.title}
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 448px"
              />
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              {event.host.avatar_url ? (
                <Image
                  src={event.host.avatar_url}
                  alt=""
                  className="w-5 h-5 rounded-full"
                  width={20}
                  height={20}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-xs text-violet-700 font-medium">
                  {event.host.name[0]}
                </div>
              )}
              <span className="text-xs text-gray-500">
                {event.host.name} is inviting you
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mt-2">
              {event.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {formatEventDate(event.event_date)}
            </p>

            {event.description && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {event.description}
              </p>
            )}

            <div className="mt-4 flex gap-4 text-xs text-gray-400">
              <span>👥 {event.member_count} members</span>
              <span>
                {event.upload_permission === "open"
                  ? "🌐 Anyone can upload"
                  : "🔒 Members only upload"}
              </span>
            </div>
          </div>
        </div>

        {/* Action area */}
        {joinError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            {joinError}
          </div>
        )}

        {user ? (
          // Logged-in user: show Join button
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full py-3.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {isJoining ? "Joining…" : `Join "${event.title}"`}
          </button>
        ) : (
          // Logged-out user: show auth options
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Join this event
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Sign in or create a free account to join and contribute photos.
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href={`/login?redirectTo=/join/${token}`}
                className="w-full py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors text-center"
              >
                Sign in to join
              </Link>
              <Link
                href={`/signup?redirectTo=/join/${token}`}
                className="w-full py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
              >
                Create a free account
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400 text-center">
                Just want to upload photos?{" "}
                {event.upload_permission === "open" ? (
                  <Link
                    href={`/guest/${token}`}
                    className="text-violet-600 font-medium hover:underline"
                  >
                    Continue as guest →
                  </Link>
                ) : (
                  <span>Guest upload is disabled for this event.</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
