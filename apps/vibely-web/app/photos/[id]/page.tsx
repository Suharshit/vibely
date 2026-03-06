"use client";

// ============================================================
// apps/web/app/photos/[id]/page.tsx
// ============================================================
// Shows all details about a single photo:
//   - Full-size preview via ImageKit
//   - Uploaded by (name + avatar)
//   - Upload date
//   - Which event it belongs to (linked)
//   - Whether the current user has saved it to their vault
//   - Download button (triggers signed URL endpoint)
// ============================================================

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { previewUrl } from "@shared/utils/storage";
import Image from "next/image";

type PageProps = { params: Promise<{ id: string }> };

interface PhotoDetail {
  id: string;
  event_id: string;
  storage_key: string;
  original_filename: string;
  file_size: number;
  created_at: string;
  status: string;
  saved_by_me: boolean;
  is_mine: boolean;
  uploader: { id: string; name: string; avatar_url: string | null } | null;
  guest_uploader: { display_name: string } | null;
  event: { id: string; title: string; event_date: string } | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PhotoDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [photo, setPhoto] = useState<PhotoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/photos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setPhoto(data.photo);
        setSaved(data.photo.saved_by_me);
      })
      .catch(() => setError("Failed to load photo"))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSave = async () => {
    const method = saved ? "DELETE" : "POST";
    await fetch(`/api/photos/${id}/save`, { method });
    setSaved(!saved);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/photos/${id}/download`);
      const data = await res.json();
      if (data.download_url) {
        // Trigger download by opening the signed URL
        const a = document.createElement("a");
        a.href = data.download_url;
        a.download = photo?.original_filename ?? "photo";
        a.click();
      }
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/60 mb-4">{error || "Photo not found"}</p>
          <Link
            href="/dashboard"
            className="text-violet-400 text-sm hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const uploaderName =
    photo.uploader?.name ?? photo.guest_uploader?.display_name ?? "Unknown";
  const uploaderAvatar = photo.uploader?.avatar_url;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col lg:flex-row">
      {/* Left: photo preview */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-black relative">
        {/* Back button */}
        <Link
          href={photo.event ? `/events/${photo.event.id}` : "/dashboard"}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
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

        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white/60" />
          </div>
        )}
        <Image
          src={previewUrl(photo.storage_key)}
          alt={photo.original_filename}
          className={`max-w-full max-h-[85vh] object-contain rounded-xl transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          width={800}
          height={600}
          onLoad={() => setImgLoaded(true)}
        />
      </div>

      {/* Right: metadata panel */}
      <div className="w-full lg:w-80 bg-gray-900 border-l border-white/10 flex flex-col">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                saved
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={saved ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {downloading ? "Getting link…" : "Download"}
            </button>
          </div>

          {/* Uploader */}
          <div>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-3">
              Uploaded by
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-800 overflow-hidden shrink-0">
                {uploaderAvatar ? (
                  <Image
                    src={uploaderAvatar}
                    alt={uploaderName}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-violet-200">
                    {uploaderName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{uploaderName}</p>
                {!photo.uploader && photo.guest_uploader && (
                  <p className="text-xs text-white/40">Guest</p>
                )}
              </div>
            </div>
          </div>

          {/* Event */}
          {photo.event && (
            <div>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-3">
                Event
              </p>
              <Link
                href={`/events/${photo.event.id}`}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-900 flex items-center justify-center shrink-0">
                  <span className="text-sm">🎉</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">
                    {photo.event.title}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(photo.event.event_date).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" }
                    )}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-white/30 group-hover:text-white/60 ml-auto transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}

          {/* Details */}
          <div>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-3">
              Details
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Filename", value: photo.original_filename },
                { label: "Uploaded", value: formatDate(photo.created_at) },
                { label: "File size", value: formatBytes(photo.file_size) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-white/40">{item.label}</p>
                  <p className="text-sm text-white/80 mt-0.5 break-all">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
