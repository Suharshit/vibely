/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

// ============================================================
// apps/web/app/guest/[token]/page.tsx
// ============================================================
// The guest upload experience. Two states:
//
// State A — "Name entry": Guest arrives via invite link.
//   They haven't entered their name yet (no stored session).
//   Shows: event name, name input, "Start uploading" button.
//
// State B — "Upload": Guest has a valid session.
//   Shows: greeting, PhotoUploader, their uploaded photos count.
//
// The invite token in the URL is the EVENT invite token (12-char),
// not the guest session token. We use it to fetch the event info
// before asking for the guest's name.
//
// WHY not just use the /join/[token] page?
// /join is for authenticated users who join as members.
// /guest is a lighter, purpose-built UI: no nav, no account CTAs,
// just the upload experience. Guests don't need anything else.
// ============================================================

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import { usePhotos } from "@/hooks/usePhotos";

const STORAGE_KEY = "vibely_guest_session";

interface GuestSession {
  session_token: string;
  display_name: string;
  event_id: string;
  event_title: string;
}

interface EventPreview {
  id: string;
  title: string;
  status: string;
  host: { name: string; avatar_url: string | null } | null;
}

export default function GuestUploadPage() {
  const { token } = useParams<{ token: string }>();

  const [phase, setPhase] = useState<
    "loading" | "name-entry" | "uploading" | "error"
  >("loading");
  const [session, setSession] = useState<GuestSession | null>(null);
  const [eventPreview, setEventPreview] = useState<EventPreview | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── On mount: check for existing session ────────────────────
  useEffect(() => {
    const init = async () => {
      // Check if we have a stored session token
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed: GuestSession = JSON.parse(stored);
          // Validate the stored session against the API
          const res = await fetch(`/api/guest/session/${parsed.session_token}`);
          if (res.ok) {
            const data = await res.json();
            // Make sure the stored session matches this event's invite token
            // (user might visit a different event's guest link)
            setSession(parsed);
            setPhase("uploading");
            return;
          }
        } catch {
          // Stored session invalid — clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // No valid stored session — fetch event info for name-entry screen
      try {
        // Use the invite preview endpoint (doesn't require auth)
        const res = await fetch(`/api/events/by-token/${token}`);
        if (!res.ok) {
          setErrorMsg("This invite link is invalid or has expired.");
          setPhase("error");
          return;
        }
        const data = await res.json();
        setEventPreview(data.event);
        setPhase("name-entry");
      } catch {
        setErrorMsg("Could not load event. Please check your connection.");
        setPhase("error");
      }
    };
    init();
  }, [token]);

  // ── Name entry submit ────────────────────────────────────────
  const handleStartUploading = async () => {
    if (!nameInput.trim() || !eventPreview) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/guest/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventPreview.id,
          display_name: nameInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to start session. Please try again.");
        return;
      }

      const newSession: GuestSession = {
        session_token: data.session_token,
        display_name: data.display_name,
        event_id: data.event_id,
        event_title: data.event_title,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setPhase("uploading");
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Upload hook (only active after session is set) ───────────
  // We pass a dummy eventId when no session yet — it won't be used
  const { uploads, uploadFiles } = usePhotos(session?.event_id ?? "");

  // ── Render ───────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 to-pink-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Link unavailable
          </h1>
          <p className="text-sm text-gray-500">{errorMsg}</p>
        </div>
      </div>
    );
  }

  // ── State A: Name entry ──────────────────────────────────────
  if (phase === "name-entry" && eventPreview) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 to-pink-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-sm border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {eventPreview.title}
            </h1>
            {eventPreview.host && (
              <p className="text-sm text-gray-400 mt-1">
                hosted by {eventPreview.host.name}
              </p>
            )}
          </div>

          {/* Name input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What&apos;s your name?
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartUploading()}
                placeholder="e.g. Maria"
                maxLength={50}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Your name will appear on photos you upload
              </p>
            </div>

            {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

            <button
              onClick={handleStartUploading}
              disabled={!nameInput.trim() || isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Setting up…" : "Start uploading →"}
            </button>
          </div>

          {/* Account CTA */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Have an account?{" "}
            <a
              href="/auth/login"
              className="text-violet-600 font-medium hover:underline"
            >
              Sign in to join the event
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── State B: Upload UI ───────────────────────────────────────
  if (phase === "uploading" && session) {
    const doneUploads = uploads.filter((u) => u.status === "done").length;

    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 to-pink-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-sm border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">👋</div>
            <h1 className="text-lg font-bold text-gray-900">
              Hey {session.display_name}!
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Upload your photos from{" "}
              <strong className="text-gray-600">{session.event_title}</strong>
            </p>
          </div>

          {/* Uploader */}
          <PhotoUploader
            eventId={session.event_id}
            onUpload={uploadFiles}
            uploads={uploads}
            guestToken={session.session_token}
          />

          {/* Count */}
          {doneUploads > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-emerald-600 font-medium">
                ✓ {doneUploads} photo{doneUploads !== 1 ? "s" : ""} uploaded
              </p>
            </div>
          )}

          {/* Sign up CTA */}
          <div className="mt-6 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400 mb-2">
              Want to save photos to your personal vault?
            </p>
            <a
              href="/auth/register"
              className="text-xs font-medium text-violet-600 hover:underline"
            >
              Create a free account →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
