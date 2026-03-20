"use client";

import { useState } from "react";
import Image from "next/image";
import { useProgressiveImage } from "@/hooks/useProgressiveImage";

interface VaultCardProps {
  entry?: {
    vault_entry_id: string;
    photo: {
      id: string;
      thumbnail_url: string;
      original_filename: string;
      preview_url: string;
      fallback_url: string | null;
    };
  };
  // Option to pass photo directly for Event Gallery usage
  photo?: {
    id: string;
    thumbnail_url: string;
    original_filename: string;
    preview_url: string;
    fallback_url: string | null;
    saved_by_me?: boolean;
  };
  eventTitle: string;
  onUnsave?: () => void;
  onSave?: () => void;
  onOpen: () => void;
  forceShort?: boolean;
}

export default function VaultCard({
  entry,
  photo,
  eventTitle,
  onUnsave,
  onSave,
  onOpen,
  forceShort = false,
}: VaultCardProps) {
  // Normalize data between entry and photo props
  const activePhoto = photo || entry?.photo;

  const [triedFallback, setTriedFallback] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Progressive image loading: thumbnail → high-res preview
  const {
    src,
    isHighRes,
    ref: progressiveRef,
  } = useProgressiveImage({
    thumbnail: activePhoto?.thumbnail_url || "",
    preview: activePhoto?.preview_url || "",
  });

  // If entry exists, it's definitely in vault. If photo exists, use saved_by_me.
  const isCurrentlySaved = entry ? true : !!photo?.saved_by_me;

  if (!activePhoto) return null;

  // Deterministic masonry height based on ID
  const heights = [
    "masonry-item-short",
    "masonry-item-med",
    "masonry-item-tall",
  ];
  const heightClass = forceShort
    ? "masonry-item-short"
    : heights[
        activePhoto.id.charCodeAt(activePhoto.id.length - 1) % heights.length
      ];

  return (
    <div
      ref={progressiveRef}
      className={`${heightClass} group relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(189,157,255,0.25)] hover:border-primary/30 cursor-pointer`}
      onClick={onOpen}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 z-10 pointer-events-none"></div>

      {!imgError ? (
        <Image
          src={src}
          alt={activePhoto.original_filename}
          className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${
            isHighRes ? "blur-0" : "blur-[0.5px]"
          }`}
          loading="lazy"
          onError={() => {
            if (!triedFallback && activePhoto.fallback_url) {
              setTriedFallback(true);
              // fallback handled by progressive hook reset
              return;
            }
            setImgError(true);
          }}
          fill
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high/50 text-on-surface-variant/30">
          <span className="material-symbols-outlined text-4xl mb-2">
            broken_image
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase">
            Lost in space
          </span>
        </div>
      )}

      {/* Hover Overlay - Ultra Glassmorphic */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 z-20">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex justify-between items-end bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl">
          <div className="flex flex-col gap-0.5 overflow-hidden pr-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-primary-fixed-dim font-black truncate drop-shadow-sm">
              {eventTitle}
            </span>
            <p className="text-on-surface text-sm font-semibold truncate leading-tight">
              {activePhoto.original_filename}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <a
              href={activePhoto.preview_url}
              download={activePhoto.original_filename}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-on-surface hover:text-primary transition-all active:scale-90"
              title="Download"
            >
              <span className="material-symbols-outlined text-lg">
                download
              </span>
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isCurrentlySaved) {
                  onUnsave?.();
                } else {
                  onSave?.();
                }
              }}
              className={`w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-90 ${
                isCurrentlySaved
                  ? "text-primary hover:text-error hover:bg-error/10"
                  : "text-on-surface-variant hover:text-primary hover:bg-white/20"
              }`}
              title={isCurrentlySaved ? "Remove from vault" : "Save to vault"}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{
                  fontVariationSettings: isCurrentlySaved
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                star
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Persistent corner icon (visible when not hovered) */}
      <div className="absolute top-4 right-4 group-hover:opacity-0 transition-all duration-300 z-10 bg-black/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/5">
        <span
          className="material-symbols-outlined text-on-surface/60 text-sm"
          style={{
            fontVariationSettings: isCurrentlySaved ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      </div>
    </div>
  );
}
