// ============================================================
// apps/web/hooks/usePhotos.ts
// ============================================================
// Manages the full photo lifecycle:
//   - Fetching paginated gallery (with caching)
//   - Initiating uploads (getting signed URL)
//   - Tracking per-file upload progress
//   - Completing uploads (activating photo record)
//   - Deleting and saving/unsaving photos
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { cachedFetch, invalidateCache, getCached } from "@/lib/fetchCache";

// ── Types ─────────────────────────────────────────────────────

export interface GalleryPhoto {
  id: string;
  event_id: string;
  storage_key: string;
  original_filename: string;
  file_size: number;
  is_saved_to_vault: boolean;
  created_at: string;
  thumbnail_url: string;
  preview_url: string;
  fallback_url?: string | null;
  saved_by_me: boolean;
  is_mine: boolean;
  uploader: { id: string; name: string; avatar_url: string | null } | null;
}

export interface UploadItem {
  id: string;
  file: File;
  status: "pending" | "uploading" | "completing" | "done" | "error";
  progress: number; // 0–100
  error?: string;
  photo_id?: string;
}

interface Pagination {
  page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface UsePhotosReturn {
  photos: GalleryPhoto[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  fetchPage: (page: number) => Promise<void>;
  uploadFiles: (
    files: File[],
    eventId: string,
    guestToken?: string
  ) => Promise<void>;
  uploads: UploadItem[];
  deletePhoto: (id: string) => Promise<{ success: boolean; error?: string }>;
  savePhoto: (id: string) => Promise<void>;
  unsavePhoto: (id: string) => Promise<void>;
}

// ── Upload concurrency limiter ────────────────────────────────
const MAX_CONCURRENT_UPLOADS = 3;

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

export function usePhotos(eventId: string): UsePhotosReturn {
  const galleryCacheKey = useCallback(
    (page: number) => `photos:${eventId}:${page}`,
    [eventId]
  );
  const cached = getCached<{ photos: GalleryPhoto[]; pagination: Pagination }>(
    galleryCacheKey(1)
  );

  const [photos, setPhotos] = useState<GalleryPhoto[]>(cached?.photos ?? []);
  const [pagination, setPagination] = useState<Pagination | null>(
    cached?.pagination ?? null
  );
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch gallery (cached) ──────────────────────────────────

  const fetchPage = useCallback(
    async (page = 1) => {
      // Abort any previous in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      try {
        const key = galleryCacheKey(page);
        const data = await cachedFetch(key, async () => {
          const res = await fetch(
            `/api/events/${eventId}/gallery?page=${page}&limit=20`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error ?? "Failed to load gallery");
          }
          return res.json();
        });
        if (!controller.signal.aborted) {
          setPhotos(data.photos ?? []);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [eventId, galleryCacheKey]
  );

  useEffect(() => {
    if (eventId) fetchPage(1);
    return () => abortRef.current?.abort();
  }, [eventId, fetchPage]);

  // ── Upload pipeline (concurrency-limited) ───────────────────

  const uploadSingleFile = useCallback(
    async (
      file: File,
      eventId: string,
      uploadId: string,
      guestToken?: string
    ) => {
      const updateStatus = (patch: Partial<UploadItem>) => {
        setUploads((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, ...patch } : u))
        );
      };

      try {
        updateStatus({ status: "uploading", progress: 0 });

        const initRes = await fetch("/api/photos/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: eventId,
            filename: file.name,
            content_type: file.type,
            file_size: file.size,
            ...(guestToken && { guest_token: guestToken }),
          }),
        });

        if (!initRes.ok) {
          const data = await initRes.json();
          throw new Error(data.error ?? "Failed to initiate upload");
        }

        const { photo_id, upload_url } = await initRes.json();
        updateStatus({ photo_id });

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 90);
              updateStatus({ progress: pct });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: HTTP ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.ontimeout = () => reject(new Error("Upload timed out"));

          xhr.open("PUT", upload_url);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.timeout = 120_000;
          xhr.send(file);
        });

        updateStatus({ status: "completing", progress: 95 });

        const completeRes = await fetch(`/api/photos/${photo_id}/complete`, {
          method: "POST",
        });

        if (!completeRes.ok) {
          throw new Error("Upload completed but failed to activate photo");
        }

        const { photo: activatedPhoto } = await completeRes.json();
        updateStatus({ status: "done", progress: 100 });

        if (activatedPhoto) {
          setPhotos((prev) => [activatedPhoto, ...prev]);
        }

        // Invalidate gallery cache so next visit gets fresh data
        invalidateCache(galleryCacheKey(1));
      } catch (err) {
        updateStatus({
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    },
    [galleryCacheKey]
  );

  const uploadFiles = useCallback(
    async (files: File[], eventId: string, guestToken?: string) => {
      const newUploads: UploadItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "pending",
        progress: 0,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Run uploads with concurrency limit instead of Promise.all
      const tasks = newUploads.map(
        (item) => () =>
          uploadSingleFile(item.file, eventId, item.id, guestToken)
      );
      await runWithConcurrency(tasks, MAX_CONCURRENT_UPLOADS);
    },
    [uploadSingleFile]
  );

  // ── Delete ───────────────────────────────────────────────

  const deletePhoto = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error };
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        invalidateCache(galleryCacheKey(1));
        return { success: true };
      } catch {
        return { success: false, error: "Network error" };
      }
    },
    [galleryCacheKey]
  );

  // ── Save / Unsave ────────────────────────────────────────

  const savePhoto = useCallback(async (id: string) => {
    await fetch(`/api/photos/${id}/save`, { method: "POST" });
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved_by_me: true } : p))
    );
  }, []);

  const unsavePhoto = useCallback(async (id: string) => {
    await fetch(`/api/photos/${id}/save`, { method: "DELETE" });
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved_by_me: false } : p))
    );
  }, []);

  return {
    photos,
    pagination,
    isLoading,
    error,
    fetchPage,
    uploadFiles,
    uploads,
    deletePhoto,
    savePhoto,
    unsavePhoto,
  };
}
