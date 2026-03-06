"use client";

// ============================================================
// apps/web/app/events/[id]/edit/page.tsx
// ============================================================
// Edit event form: title, description, upload_permission,
// event_date, expires_at, and cover image upload.
// Pre-fills from the existing event data.
// ============================================================

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEvent } from "@/hooks/useEvents";
import { useEvents } from "@/hooks/useEvents";
import Image from "next/image";

type PageProps = { params: Promise<{ id: string }> };
type UploadPermission = "open" | "restricted";

function toUploadPermission(
  value: string | null | undefined
): UploadPermission {
  return value === "restricted" ? "restricted" : "open";
}

export default function EditEventPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { event, userRole, isLoading } = useEvent(id);
  const { updateEvent } = useEvents();

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    upload_permission: "open" as UploadPermission,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Cover image state
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form when event loads
  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description ?? "",
        event_date: event.event_date
          ? new Date(event.event_date).toISOString().slice(0, 16)
          : "",
        upload_permission: toUploadPermission(event.upload_permission),
      });
      setCoverPreview(event.cover_image_url ?? null);
    }
  }, [event]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Redirect non-hosts
  if (!isLoading && userRole !== "host") {
    router.replace(`/events/${id}`);
    return null;
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");

    const result = await updateEvent(id, {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      event_date: form.event_date
        ? new Date(form.event_date).toISOString()
        : undefined,
      upload_permission: form.upload_permission,
    });

    setSaving(false);

    if (result.success) {
      showToast("Event updated!");
      setTimeout(() => router.push(`/events/${id}`), 1000);
    } else {
      setError(result.error ?? "Failed to save event");
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setCoverUploading(true);
    try {
      // Step 1: Get signed URL
      const initRes = await fetch(`/api/events/${id}/cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: file.type, file_size: file.size }),
      });
      const { upload_url, storage_key } = await initRes.json();
      if (!initRes.ok) throw new Error("Failed to get upload URL");

      // Step 2: Upload
      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload failed");

      // Step 3: Save URL
      const completeRes = await fetch(`/api/events/${id}/cover/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_key }),
      });
      if (!completeRes.ok) throw new Error("Failed to save cover");

      showToast("Cover image updated!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
      setCoverPreview(event?.cover_image_url ?? null); // revert preview
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/events/${id}`}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        </div>

        {/* Cover image */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div
            className="h-40 bg-linear-to-br from-violet-100 to-pink-100 relative cursor-pointer group"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverPreview && (
              <Image
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover"
                width={800}
                height={400}
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                {coverUploading ? (
                  <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                  </svg>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {coverUploading
                    ? "Uploading…"
                    : coverPreview
                      ? "Change cover"
                      : "Add cover image"}
                </span>
              </div>
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleCoverChange}
          />
        </div>

        {/* Event details form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Event date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event date & time
            </label>
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, event_date: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Upload permission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can upload photos?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "open",
                  label: "Everyone",
                  desc: "Guests can upload without an account",
                },
                {
                  value: "restricted",
                  label: "Members only",
                  desc: "Requires an account to upload",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      upload_permission: opt.value as "open" | "restricted",
                    }))
                  }
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.upload_permission === opt.value
                      ? "border-violet-500 bg-violet-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <Link
              href={`/events/${id}`}
              className="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
