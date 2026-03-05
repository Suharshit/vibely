// ============================================================
// apps/web/hooks/usePhotos.ts
// ============================================================
// Manages the full photo lifecycle:
//   - Fetching paginated gallery
//   - Initiating uploads (getting signed URL)
//   - Tracking per-file upload progress
//   - Completing uploads (activating photo record)
//   - Deleting and saving/unsaving photos
// ============================================================

import { useState, useEffect, useCallback } from "react";

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

export function usePhotos(eventId: string): UsePhotosReturn {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  // ── Fetch gallery ─────────────────────────────────────────

  const fetchPage = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/events/${eventId}/gallery?page=${page}&limit=20`
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to load gallery");
        }
        const data = await res.json();
        setPhotos(data.photos ?? []);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    if (eventId) fetchPage(1);
  }, [eventId, fetchPage]);

  // ── Upload pipeline ──────────────────────────────────────
  // For each file:
  //   1. POST /api/photos/upload → get signed URL + photo_id
  //   2. PUT to signed URL with progress tracking (XMLHttpRequest)
  //   3. POST /api/photos/:id/complete → activate the photo
  //   4. Prepend to photos state so it appears immediately

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
        // Step 1: Get signed upload URL
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

        // Step 2: Upload directly to Supabase Storage with progress
        // WHY XMLHttpRequest instead of fetch?
        // fetch() doesn't expose upload progress. XHR has onprogress
        // for upload events — essential for showing progress bars.
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 90); // cap at 90% until complete
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
          xhr.timeout = 120_000; // 2 minutes
          xhr.send(file);
        });

        // Step 3: Activate the photo record
        updateStatus({ status: "completing", progress: 95 });

        const completeRes = await fetch(`/api/photos/${photo_id}/complete`, {
          method: "POST",
        });

        if (!completeRes.ok) {
          throw new Error("Upload completed but failed to activate photo");
        }

        const { photo: activatedPhoto } = await completeRes.json();
        updateStatus({ status: "done", progress: 100 });

        // Step 4: Prepend the new photo to the gallery
        if (activatedPhoto) {
          setPhotos((prev) => [activatedPhoto, ...prev]);
        }
      } catch (err) {
        updateStatus({
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    },
    []
  );

  const uploadFiles = useCallback(
    async (files: File[], eventId: string, guestToken?: string) => {
      // Initialize upload items for all files
      const newUploads: UploadItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "pending",
        progress: 0,
      }));

      // Append upload rows (pure updater, no side effects)
      setUploads((prev) => [...prev, ...newUploads]);

      // Start uploads outside setState updater. In React Strict Mode,
      // updater functions can run twice in development; side effects here
      // would duplicate uploads/photos.
      await Promise.all(
        newUploads.map((item) =>
          uploadSingleFile(item.file, eventId, item.id, guestToken)
        )
      );
    },
    [uploadSingleFile]
  );

  // ── Delete ───────────────────────────────────────────────

  const deletePhoto = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

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
