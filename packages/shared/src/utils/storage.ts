// ============================================================
// packages/shared/src/utils/storage.ts
// ============================================================
// WHY centralize storage key logic in shared/?
// Both the web API and mobile call Supabase Storage and ImageKit.
// If the key format changes (e.g. adding a subfolder), you update
// one file instead of hunting down every place that builds paths.
//
// KEY FORMAT: events/{eventId}/{photoId}/{filename}
//   events/        → top-level namespace
//   {eventId}/     → groups all photos for an event together
//                    (enables efficient cleanup by event in Phase 12)
//   {photoId}/     → UUID for this specific photo
//   {filename}     → sanitized original filename
//
// WHY include photoId in the path?
// Two guests uploading "photo.jpg" at the same event won't
// collide because each upload gets its own photoId subfolder.
// ============================================================

import { customAlphabet } from "nanoid";

const idAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
export const generatePhotoId = customAlphabet(idAlphabet, 21); // same entropy as UUID

// ── Storage key helpers ───────────────────────────────────────

/**
 * Build the Supabase Storage object key for a photo.
 * e.g. "events/abc123/xyz789/birthday-party.jpg"
 */
export function buildStorageKey(
  eventId: string,
  photoId: string,
  filename: string
): string {
  return `events/${eventId}/${photoId}/${sanitizeFilename(filename)}`;
}

/**
 * Sanitize a filename: lowercase, replace spaces with hyphens,
 * strip special characters. Keeps the extension.
 */
export function sanitizeFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const base = filename
    .replace(/\.[^/.]+$/, "") // strip extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "") // strip leading/trailing hyphens
    .slice(0, 50); // max 50 chars for the base
  return `${base || "photo"}.${ext}`;
}

/**
 * Extract the eventId from a storage key.
 * "events/abc123/xyz789/photo.jpg" → "abc123"
 */
export function eventIdFromStorageKey(storageKey: string): string {
  return storageKey.split("/")[1] ?? "";
}

// ── ImageKit URL builders ─────────────────────────────────────
// WHY ImageKit on top of Supabase Storage?
// Supabase Storage serves the original file. ImageKit sits in
// front as a CDN + real-time image transformation layer.
// We store the raw file in Supabase; ImageKit serves resized,
// compressed, WebP-converted versions at the edge — globally fast.
//
// HOW it works:
// 1. ImageKit is configured with Supabase Storage's public URL
//    as its "origin"
// 2. When a user requests an ImageKit URL, ImageKit fetches the
//    original from Supabase, transforms it, caches it at the edge
// 3. Subsequent requests serve from cache — near-zero latency
//
// ImageKit transformation format: ?tr=<transforms>
// or inline: /tr:<transforms>/ before the filename in the path

const IMAGEKIT_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ??
  process.env.EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT ??
  "";

/**
 * Build an ImageKit delivery URL with optional transformations.
 *
 * @param storageKey  The Supabase Storage object key
 * @param transforms  ImageKit transformation string (e.g. "w-800,q-80")
 *
 * Transformation reference:
 *   w-N         width in px
 *   h-N         height in px
 *   q-N         quality 1-100
 *   f-webp      force WebP output
 *   c-at_max    contain: resize but never exceed w×h
 *   c-at_least  cover: resize to fill w×h
 *   fo-auto     smart crop focus (face/object detection)
 *   bl-N        blur (0-100)
 */
export function imagekitUrl(storageKey: string, transforms?: string): string {
  if (!IMAGEKIT_ENDPOINT) {
    // Fallback during local dev before ImageKit is configured
    return storageKey;
  }
  const base = `${IMAGEKIT_ENDPOINT.replace(/\/$/, "")}/${storageKey}`;
  if (!transforms) return base;
  return `${base}?tr=${transforms}`;
}

// ── Preset URLs ───────────────────────────────────────────────
// Pre-defined sizes used consistently across web and mobile.
// Define them here once so the same sizes are always requested.

/** 400×400 thumbnail for gallery grids */
export function thumbnailUrl(storageKey: string): string {
  return imagekitUrl(storageKey, "w-400,h-400,c-at_max,q-75,f-webp");
}

/** 1200px wide preview for lightbox / full screen */
export function previewUrl(storageKey: string): string {
  return imagekitUrl(storageKey, "w-1200,q-85,f-webp");
}

/** Original quality, just compression */
export function fullUrl(storageKey: string): string {
  return imagekitUrl(storageKey, "q-90,f-webp");
}

// ── Validation helpers ────────────────────────────────────────

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateImageFile(file: { type: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  if (
    !ALLOWED_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Use JPEG, PNG, WebP, or HEIC.`,
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `File is ${sizeMB}MB. Maximum allowed size is 10MB.`,
    };
  }
  return { valid: true };
}
