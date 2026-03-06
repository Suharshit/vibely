"use client";

// ============================================================
// apps/web/app/vault/page.tsx
// ============================================================

import Link from "next/link";
import { useState } from "react";
import { useVault } from "@/hooks/useVault";
import Image from "next/image";

export default function VaultPage() {
  const { groups, total, isLoading, error, unsave } = useVault();
  const [view, setView] = useState<"grouped" | "grid">("grouped");
  const [lightbox, setLightbox] = useState<{
    url: string;
    name: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Vault</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {total} saved photo{total !== 1 ? "s" : ""}
            </p>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["grouped", "grid"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  view === v
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {v === "grouped" ? "≡ Events" : "⊞ Grid"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && total === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-5xl mb-4">🔖</div>
            <h2 className="text-base font-semibold text-gray-700 mb-2">
              Your vault is empty
            </h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Save photos from your events by hovering over them and clicking
              the bookmark icon.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-6 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors"
            >
              Browse events →
            </Link>
          </div>
        )}

        {/* Grouped view */}
        {!isLoading && view === "grouped" && groups.length > 0 && (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.event.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Link
                      href={`/events/${group.event.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-violet-600 transition-colors"
                    >
                      {group.event.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {group.photos.length} saved photo
                      {group.photos.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/events/${group.event.id}`}
                    className="text-xs text-violet-600 hover:underline"
                  >
                    View event →
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {group.photos.map((entry) => (
                    <VaultCard
                      key={entry.vault_entry_id}
                      entry={entry}
                      onUnsave={() => unsave(entry.photo.id)}
                      onOpen={() =>
                        setLightbox({
                          url: entry.photo.preview_url,
                          name: entry.photo.original_filename,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Flat grid view */}
        {!isLoading && view === "grid" && groups.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {groups
              .flatMap((g) => g.photos)
              .map((entry) => (
                <VaultCard
                  key={entry.vault_entry_id}
                  entry={entry}
                  onUnsave={() => unsave(entry.photo.id)}
                  onOpen={() =>
                    setLightbox({
                      url: entry.photo.preview_url,
                      name: entry.photo.original_filename,
                    })
                  }
                />
              ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <Image
            src={lightbox.url}
            alt={lightbox.name}
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
            fill
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Vault Card ────────────────────────────────────────────────

function VaultCard({
  entry,
  onUnsave,
  onOpen,
}: {
  entry: {
    vault_entry_id: string;
    photo: {
      id: string;
      thumbnail_url: string;
      original_filename: string;
      preview_url: string;
    };
  };
  onUnsave: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer">
      <Image
        src={entry.photo.thumbnail_url}
        alt={entry.photo.original_filename}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        onClick={onOpen}
        fill
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
          {/* Download */}
          <a
            href={entry.photo.preview_url}
            download={entry.photo.original_filename}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
            title="Download"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
          {/* Unsave */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Remove from vault?")) onUnsave();
            }}
            className="p-1.5 rounded-lg bg-white/80 text-red-500 hover:bg-white backdrop-blur-sm transition-colors"
            title="Remove from vault"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
