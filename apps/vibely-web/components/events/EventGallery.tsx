"use client";

import VaultCard from "@/components/vault/VaultCard";
import type { GalleryPhoto } from "@/hooks/usePhotos";

interface EventGalleryProps {
  photos: GalleryPhoto[];
  eventTitle: string;
  isLoading: boolean;
  onOpenPhoto: (photo: GalleryPhoto) => void;
  pagination: {
    page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
  onPageChange: (page: number) => void;
  onSavePhoto: (photoId: string) => void;
  onUnsavePhoto: (photoId: string) => void;
}

export function EventGallery({
  photos,
  eventTitle,
  isLoading,
  onOpenPhoto,
  pagination,
  onPageChange,
  onSavePhoto,
  onUnsavePhoto,
}: EventGalleryProps) {
  if (isLoading) {
    return (
      <div className="masonry-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className={`rounded-3xl bg-surface-container animate-pulse border border-white/5 ${
              i % 3 === 0
                ? "masonry-item-tall"
                : i % 2 === 0
                  ? "masonry-item-med"
                  : "masonry-item-short"
            }`}
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center p-16 bg-surface/20 backdrop-blur-3xl border border-white/5 rounded-3xl text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
          <span
            className="material-symbols-outlined text-6xl text-primary relative z-10"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            photo_library
          </span>
        </div>
        <h4 className="text-2xl font-bold font-headline text-on-surface mb-2 relative z-10">
          No Photos Yet
        </h4>
        <p className="text-on-surface-variant max-w-xs relative z-10">
          Be the first to upload and share memories!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {photos.map((photo) => (
          <VaultCard
            key={photo.id}
            photo={{
              ...photo,
              fallback_url: photo.fallback_url ?? null,
            }}
            eventTitle={eventTitle}
            forceShort={true}
            onOpen={() => onOpenPhoto(photo)}
            onSave={() => onSavePhoto(photo.id)}
            onUnsave={() => onUnsavePhoto(photo.id)}
          />
        ))}
      </div>

      {/* Pagination Load More Style */}
      {pagination && pagination.has_next && (
        <div className="flex justify-center mt-12 mb-8">
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            className="px-8 py-3 rounded-2xl border border-outline-variant/20 bg-surface-container hover:bg-surface-bright text-on-surface font-semibold transition-all flex items-center gap-3 active:scale-95 shadow-lg group"
          >
            <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">
              expand_more
            </span>
            Load More Memories
          </button>
        </div>
      )}
    </>
  );
}
