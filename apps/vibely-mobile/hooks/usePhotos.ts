// ============================================================
// apps/mobile/hooks/usePhotos.ts
// ============================================================
// Mobile photo hook.
//
// Upload flow on mobile differs from web:
//   Web:   XHR PUT to signed URL (progress via onprogress event)
//   Mobile: fetch() with no native progress → we use Expo's
//           FileSystem.uploadAsync which gives upload progress
//           via a callback. This is why mobile needs its own hook.
//
// For reads we query Supabase directly (same as useEvents).
// For writes (upload initiation, completion) we call the Next.js
// API — the API holds our service role key, mobile never does.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase/client';
import { thumbnailUrl, previewUrl } from '@shared/utils/storage';

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
  saved_by_me: boolean;
  is_mine: boolean;
  uploader: { id: string; name: string; avatar_url: string | null } | null;
}

export interface MobileUploadItem {
  uri: string;
  filename: string;
  status: 'pending' | 'uploading' | 'completing' | 'done' | 'error';
  progress: number;
  error?: string;
  photo_id?: string;
}

// Base URL of your Next.js API — change for production
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function usePhotos(eventId: string) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<MobileUploadItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // ── Fetch gallery ─────────────────────────────────────────

  const fetchPhotos = useCallback(async (pageNum = 1, append = false) => {
    setIsLoading(true);
    try {
      // Get auth token for the API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(
        `${API_BASE}/api/events/${eventId}/gallery?page=${pageNum}&limit=20`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      if (!res.ok) throw new Error('Failed to load photos');
      const data = await res.json();

      setPhotos(prev => append ? [...prev, ...(data.photos ?? [])] : (data.photos ?? []));
      setHasMore(data.pagination?.has_next ?? false);
      setPage(pageNum);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchPhotos(1);
  }, [eventId, fetchPhotos]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) fetchPhotos(page + 1, true);
  }, [hasMore, isLoading, page, fetchPhotos]);

  // ── Upload ────────────────────────────────────────────────

  const uploadPhoto = useCallback(async (
    uri: string,
    filename: string,
    contentType: string,
    fileSize: number,
    guestToken?: string
  ) => {
    const index = uploads.length;

    // Add upload item to list
    setUploads(prev => [...prev, {
      uri, filename, status: 'pending', progress: 0,
    }]);

    const updateStatus = (patch: Partial<MobileUploadItem>) => {
      setUploads(prev => prev.map((u, i) => i === index ? { ...u, ...patch } : u));
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !guestToken) throw new Error('Not authenticated');

      const authHeaders: Record<string, string> = session
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

      // Step 1: Initiate upload — get signed URL
      updateStatus({ status: 'uploading', progress: 5 });

      const initRes = await fetch(`${API_BASE}/api/photos/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          event_id: eventId,
          filename,
          content_type: contentType,
          file_size: fileSize,
          ...(guestToken && { guest_token: guestToken }),
        }),
      });

      if (!initRes.ok) {
        const data = await initRes.json();
        throw new Error(data.error ?? 'Failed to initiate upload');
      }

      const { photo_id, upload_url } = await initRes.json();
      updateStatus({ photo_id });

      // Step 2: Upload file to Supabase Storage using expo-file-system
      // WHY FileSystem.uploadAsync?
      // React Native's fetch() doesn't support upload progress tracking.
      // expo-file-system's uploadAsync reads the file from the device
      // storage and sends it with real-time progress callbacks.
      const uploadResult = await FileSystem.uploadAsync(upload_url, uri, {
        httpMethod: 'PUT',
        headers: { 'Content-Type': contentType },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        // Progress callback: fires multiple times during upload
        onUploadProgress: (progress) => {
          const pct = Math.round(
            (progress.totalBytesSent / progress.totalBytesExpectedToSend) * 85
          );
          updateStatus({ progress: pct });
        },
      });

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        throw new Error(`Storage upload failed: HTTP ${uploadResult.status}`);
      }

      // Step 3: Activate the photo record
      updateStatus({ status: 'completing', progress: 92 });

      const completeRes = await fetch(`${API_BASE}/api/photos/${photo_id}/complete`, {
        method: 'POST',
        headers: authHeaders,
      });

      if (!completeRes.ok) throw new Error('Failed to activate photo');

      const { photo: activatedPhoto } = await completeRes.json();
      updateStatus({ status: 'done', progress: 100 });

      // Prepend new photo to gallery
      if (activatedPhoto) {
        setPhotos(prev => [{
          ...activatedPhoto,
          thumbnail_url: thumbnailUrl(activatedPhoto.storage_key),
          preview_url: previewUrl(activatedPhoto.storage_key),
          saved_by_me: false,
          is_mine: true,
        }, ...prev]);
      }

    } catch (err: any) {
      updateStatus({
        status: 'error',
        error: err?.message ?? 'Upload failed',
      });
    }
  }, [eventId, uploads.length]);

  // ── Save / Unsave ─────────────────────────────────────────

  const savePhoto = useCallback(async (photoId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(`${API_BASE}/api/photos/${photoId}/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, saved_by_me: true } : p));
  }, []);

  const unsavePhoto = useCallback(async (photoId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(`${API_BASE}/api/photos/${photoId}/save`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, saved_by_me: false } : p));
  }, []);

  // ── Delete ────────────────────────────────────────────────

  const deletePhoto = useCallback(async (photoId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Not authenticated' };

    const res = await fetch(`${API_BASE}/api/photos/${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };

    setPhotos(prev => prev.filter(p => p.id !== photoId));
    return { success: true };
  }, []);

  return {
    photos, isLoading, error, hasMore,
    fetchPhotos, loadMore,
    uploads, uploadPhoto,
    savePhoto, unsavePhoto, deletePhoto,
  };
}