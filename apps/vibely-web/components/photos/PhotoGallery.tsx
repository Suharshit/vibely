/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

// ============================================================
// apps/web/components/photos/PhotoGallery.tsx
// ============================================================
// Masonry-style responsive photo grid with:
//   - Lazy-loaded thumbnails
//   - Hover overlay with save/delete actions
//   - Click to open lightbox preview
//   - Pagination controls
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GalleryPhoto } from "@/hooks/usePhotos";
import Image from "next/image";

// ── Photo Card ────────────────────────────────────────────────

interface PhotoCardProps {
  photo: GalleryPhoto;
  onSave: (id: string) => void;
  onUnsave: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (photo: GalleryPhoto) => void;
}

export function PhotoCard({
  photo,
  onSave,
  onUnsave,
  onDelete,
  onOpen,
}: PhotoCardProps) {
  const [imgError, setImgError] = useState(false);
  const [src, setSrc] = useState(photo.thumbnail_url);
  const [triedFallback, setTriedFallback] = useState(false);

  return (
    <div
      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
      onClick={() => onOpen(photo)}
    >
      {/* Thumbnail */}
      {!imgError ? (
        <Image
          src={src}
          alt={photo.original_filename}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          width={100}
          height={100}
          onError={() => {
            if (!triedFallback && photo.fallback_url) {
              setTriedFallback(true);
              setSrc(photo.fallback_url);
              return;
            }
            setImgError(true);
          }}
        />
      ) : (
        // Fallback when ImageKit isn't configured yet
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <svg
            className="w-8 h-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
            />
          </svg>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200">
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Save / Unsave */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              photo.saved_by_me ? onUnsave(photo.id) : onSave(photo.id);
            }}
            title={photo.saved_by_me ? "Remove from vault" : "Save to vault"}
            className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors ${
              photo.saved_by_me
                ? "bg-amber-400/90 text-white"
                : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill={photo.saved_by_me ? "currentColor" : "none"}
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
          </button>

          {/* Delete — only if this is the user's own photo */}
          {photo.is_mine && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this photo? This cannot be undone.")) {
                  onDelete(photo.id);
                }
              }}
              title="Delete photo"
              className="p-1.5 rounded-lg bg-white/80 text-red-500 hover:bg-white transition-colors backdrop-blur-sm"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Uploader name at bottom */}
        {photo.uploader && (
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-white/90 truncate">
              {photo.uploader.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Gallery Grid ──────────────────────────────────────────────

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  isLoading: boolean;
  pagination: {
    page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
  onPageChange: (page: number) => void;
  onSave: (id: string) => void;
  onUnsave: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PhotoGallery({
  photos,
  isLoading,
  pagination,
  onPageChange,
  onSave,
  onUnsave,
  onDelete,
}: PhotoGalleryProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
        <div className="text-4xl mb-3">📷</div>
        <p className="text-sm font-medium text-gray-600">No photos yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Be the first to upload a photo!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onSave={onSave}
            onUnsave={onUnsave}
            onDelete={onDelete}
            onOpen={(openedPhoto) => router.push(`/photos/${openedPhoto.id}`)}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.has_prev}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.total_pages}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.has_next}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

    </>
  );
}
