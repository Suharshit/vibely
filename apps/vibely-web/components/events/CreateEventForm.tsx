"use client";

// ============================================================
// apps/web/components/events/CreateEventForm.tsx
// ============================================================
// Controlled form for creating a new event. Uses the
// createEventSchema for client-side validation before sending
// to the API (which re-validates with the same schema server-side).
//
// WHY datetime-local input?
// The HTML datetime-local input gives a native date+time picker
// in the browser without a library. The value is a string in
// "YYYY-MM-DDTHH:mm" format — we convert it to ISO 8601 before
// sending to the API.
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useEvents";
import { defaultExpiresAt } from "@shared/utils/invite";

// Format a Date to the value format expected by datetime-local
function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Default event date: tomorrow at noon
function defaultEventDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return toDatetimeLocal(d);
}

export function CreateEventForm() {
  const router = useRouter();
  const { createEvent } = useEvents();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(defaultEventDate);
  const [uploadPermission, setUploadPermission] = useState<
    "open" | "restricted"
  >("open");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters.";
    }
    if (title.trim().length > 100) {
      newErrors.title = "Title must be under 100 characters.";
    }
    if (description.length > 500) {
      newErrors.description = "Description must be under 500 characters.";
    }
    if (!eventDate) {
      newErrors.event_date = "Please pick an event date.";
    } else if (new Date(eventDate) <= new Date()) {
      newErrors.event_date = "Event date must be in the future.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setIsSubmitting(true);

    const eventDateISO = new Date(eventDate).toISOString();
    const expiresAtISO = defaultExpiresAt(new Date(eventDate)).toISOString();

    const result = await createEvent({
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDateISO,
      expires_at: expiresAtISO,
      upload_permission: uploadPermission,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    // Redirect to the new event's detail page
    router.push(`/events/${result.event?.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Event name <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Sarah's Wedding, Friday Game Night"
          maxLength={100}
          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 ${
            errors.title
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-white"
          }`}
        />
        {errors.title && (
          <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-gray-400 text-right">
          {title.length}/100
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Description{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell guests what to expect…"
          rows={3}
          maxLength={500}
          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none ${
            errors.description
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-white"
          }`}
        />
        {errors.description && (
          <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400 text-right">
          {description.length}/500
        </p>
      </div>

      {/* Event Date */}
      <div>
        <label
          htmlFor="event_date"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Date & time <span className="text-red-500">*</span>
        </label>
        <input
          id="event_date"
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          min={toDatetimeLocal(new Date())}
          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 ${
            errors.event_date
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-white"
          }`}
        />
        {errors.event_date && (
          <p className="mt-1.5 text-xs text-red-600">{errors.event_date}</p>
        )}
        <p className="mt-1.5 text-xs text-gray-400">
          Photos will auto-expire 30 days after this date.
        </p>
      </div>

      {/* Upload Permission */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-3">
          Who can upload photos?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {/* Open */}
          <label
            className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              uploadPermission === "open"
                ? "border-violet-500 bg-violet-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <input
              type="radio"
              name="upload_permission"
              value="open"
              checked={uploadPermission === "open"}
              onChange={() => setUploadPermission("open")}
              className="sr-only"
            />
            <span className="text-xl">🌐</span>
            <span className="font-medium text-sm text-gray-900">
              Anyone with link
            </span>
            <span className="text-xs text-gray-500">
              Guests can upload without an account
            </span>
          </label>

          {/* Restricted */}
          <label
            className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              uploadPermission === "restricted"
                ? "border-violet-500 bg-violet-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <input
              type="radio"
              name="upload_permission"
              value="restricted"
              checked={uploadPermission === "restricted"}
              onChange={() => setUploadPermission("restricted")}
              className="sr-only"
            />
            <span className="text-xl">🔒</span>
            <span className="font-medium text-sm text-gray-900">
              Members only
            </span>
            <span className="text-xs text-gray-500">
              Only registered members can upload
            </span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating…" : "Create event"}
        </button>
      </div>
    </form>
  );
}
