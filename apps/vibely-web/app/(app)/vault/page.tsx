"use client";

// ============================================================
// apps/web/app/(app)/vault/page.tsx
// ============================================================

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVault } from "@/hooks/useVault";
import VaultCard from "@/components/vault/VaultCard";
import VaultFilters from "@/components/vault/VaultFilters";

export default function VaultPage() {
  const router = useRouter();
  const { groups, total, isLoading, error, unsave } = useVault();

  // Flatten the groups into a single array of photos for the masonry grid
  const allPhotos = groups.flatMap((group) =>
    group.photos.map((photo) => ({
      ...photo,
      event: group.event,
    }))
  );

  return (
    <>
      {/* Header & Filter Pills */}
      <section className="mb-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
                Personal Archive
              </h2>
              <p className="text-on-surface-variant font-body max-w-xl">
                A curated collection of your most precious moments, synchronized
                across all your hosted events.
              </p>
            </div>
          </div>

          <VaultFilters />
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="masonry-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl bg-surface-container animate-pulse border border-white/5 ${
                i % 3 === 0
                  ? "masonry-item-tall"
                  : i % 2 === 0
                    ? "masonry-item-med"
                    : "masonry-item-short"
              }`}
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-sm text-error mb-6 backdrop-blur-xl">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && total === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center p-16 bg-surface/20 backdrop-blur-3xl border border-white/5 rounded-3xl text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
            <span
              className="material-symbols-outlined text-6xl text-primary relative z-10"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>
          <h4 className="text-2xl font-bold font-headline text-on-surface mb-2 relative z-10">
            Your Vault is Empty
          </h4>
          <p className="text-on-surface-variant max-w-xs mb-8 relative z-10">
            Save photos from your events by hovering over them and clicking the
            star icon.
          </p>
          <Link
            href="/dashboard/events"
            className="px-8 py-4 bg-primary hover:bg-primary-dim text-on-primary-container rounded-2xl font-bold font-headline shadow-xl shadow-primary/20 active:scale-95 transition-all relative z-10"
          >
            Browse Events
          </Link>
        </div>
      )}

      {/* Masonry Gallery */}
      {!isLoading && allPhotos.length > 0 && (
        <div className="masonry-grid">
          {allPhotos.map((entry) => (
            <VaultCard
              key={entry.vault_entry_id}
              entry={entry}
              eventTitle={entry.event.title}
              onUnsave={() => unsave(entry.photo.id)}
              onOpen={() => router.push(`/photos/${entry.photo.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination or Load More - only visible if we have photos */}
      {!isLoading && allPhotos.length > 0 && (
        <div className="flex justify-center mt-16 mb-8">
          <button className="px-8 py-3 rounded-xl border border-outline-variant/20 bg-surface-container hover:bg-surface-bright text-on-surface font-semibold transition-all flex items-center gap-3 active:scale-95 shadow-lg">
            <span className="material-symbols-outlined">expand_more</span>
            Show More Memories
          </button>
        </div>
      )}
    </>
  );
}
