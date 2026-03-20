"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { Tables } from "@repo/supabase/types";

type UploadPermission = "open" | "restricted";

interface EditEventFormProps {
  event: Tables<"events">;
  onUpdate: (
    data: Partial<Tables<"events">>
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
}

export function EditEventForm({
  event,
  onUpdate,
  onDelete,
}: EditEventFormProps) {
  const [form, setForm] = useState({
    title: event.title,
    description: event.description || "",
    event_date: event.event_date
      ? new Date(event.event_date).toISOString().slice(0, 16)
      : "",
    upload_permission: (event.upload_permission as UploadPermission) || "open",
    status: event.status,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cover image state
  const [coverPreview, setCoverPreview] = useState<string | null>(
    event.cover_image_url || null
  );
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await onUpdate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      event_date: form.event_date
        ? new Date(form.event_date).toISOString()
        : undefined,
      upload_permission: form.upload_permission,
      status: form.status as Tables<"events">["status"],
    });

    setSaving(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Failed to save changes");
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
    setError(null);

    try {
      // Step 1: Get signed URL
      const initRes = await fetch(`/api/events/${event.id}/cover`, {
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
      const completeRes = await fetch(
        `/api/events/${event.id}/cover/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storage_key }),
        }
      );
      if (!completeRes.ok) throw new Error("Failed to save cover");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
      setCoverPreview(event.cover_image_url); // revert preview
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-hidden focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/40 hover:bg-white/10 text-sm";
  const labelClasses =
    "block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-3 ml-1";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form onSubmit={handleSave} className="space-y-8">
        {/* Cover Image Section */}
        <div className="space-y-4">
          <label className={labelClasses}>Cover Image</label>
          <div
            className="relative h-48 w-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer group"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverPreview ? (
              <Image
                src={coverPreview}
                alt="Event cover"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant opacity-40">
                <span className="material-symbols-outlined text-4xl mb-2">
                  image
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  No cover image
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white/90 text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                {coverUploading ? (
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-lg">
                    photo_camera
                  </span>
                )}
                {coverUploading ? "Uploading..." : "Change Cover"}
              </div>
            </div>
          </div>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 md:col-span-2">
            <label className={labelClasses}>Event Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClasses}
              placeholder="e.g. Summer Wedding 2024"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className={labelClasses}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={`${inputClasses} min-h-[120px] resize-none`}
              placeholder="Tell guests what to expect..."
            />
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Event Date & Time</label>
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Event Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputClasses}
            >
              <option value="active">Active (Public)</option>
              <option value="draft">Draft (Private)</option>
              <option value="completed">Completed (Archived)</option>
            </select>
          </div>

          {/* Upload Permissions */}
          <div className="md:col-span-2 space-y-4">
            <label className={labelClasses}>Who can upload photos?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "open",
                  label: "Everyone",
                  icon: "public",
                  desc: "Guests can upload without an account",
                },
                {
                  id: "restricted",
                  label: "Members",
                  icon: "person",
                  desc: "Requires an account to upload",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      upload_permission: opt.id as UploadPermission,
                    })
                  }
                  className={`flex items-start gap-4 p-5 rounded-3xl border transition-all text-left group ${
                    form.upload_permission === opt.id
                      ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                      form.upload_permission === opt.id
                        ? "bg-primary text-white"
                        : "bg-white/5 text-on-surface-variant group-hover:bg-white/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {opt.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-black text-xs uppercase tracking-widest mb-1 ${
                        form.upload_permission === opt.id
                          ? "text-primary"
                          : "text-white"
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed opacity-70">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
            <span className="material-symbols-outlined">check_circle</span>
            Changes saved successfully!
          </div>
        )}

        <div className="pt-6 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 h-16 bg-primary text-white font-black rounded-2xl hover:bg-primary-dim transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined">save</span>
            )}
            Save Changes
          </button>

          <button
            type="button"
            onClick={async () => {
              if (confirm("Are you sure you want to delete this event?")) {
                setDeleting(true);
                const result = await onDelete();
                if (result.success) window.location.href = "/dashboard";
                setDeleting(false);
              }
            }}
            disabled={deleting}
            className="sm:px-10 h-16 bg-white/5 border border-white/10 text-error font-black rounded-2xl hover:bg-error/10 hover:border-error/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {deleting ? (
              <span className="w-5 h-5 border-2 border-error/30 border-t-error rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined">delete</span>
            )}
            Delete Event
          </button>
        </div>
      </form>
    </div>
  );
}
