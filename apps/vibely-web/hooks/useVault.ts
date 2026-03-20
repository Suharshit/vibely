// ============================================================
// apps/web/hooks/useVault.ts
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { cachedFetch, invalidateCache, getCached } from "@/lib/fetchCache";

export interface VaultPhoto {
  vault_entry_id: string;
  saved_at: string;
  photo: {
    id: string;
    storage_key: string;
    original_filename: string;
    file_size: number;
    created_at: string;
    thumbnail_url: string;
    preview_url: string;
    fallback_url: string | null;
    event: { id: string; title: string; event_date: string } | null;
    uploader: { id: string; name: string; avatar_url: string | null } | null;
  };
}

export interface VaultGroup {
  event: { id: string; title: string; event_date: string };
  photos: VaultPhoto[];
}

interface UseVaultReturn {
  photos: VaultPhoto[];
  groups: VaultGroup[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  unsave: (photoId: string) => Promise<void>;
}

const VAULT_CACHE_KEY = "vault";

export function useVault(): UseVaultReturn {
  // Pre-populate from cache for instant render
  const cached = getCached<{
    photos: VaultPhoto[];
    groups: VaultGroup[];
    total: number;
  }>(VAULT_CACHE_KEY);
  const [photos, setPhotos] = useState<VaultPhoto[]>(cached?.photos ?? []);
  const [groups, setGroups] = useState<VaultGroup[]>(cached?.groups ?? []);
  const [total, setTotal] = useState(cached?.total ?? 0);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cachedFetch(VAULT_CACHE_KEY, async () => {
        const res = await fetch("/api/vault");
        if (!res.ok) throw new Error("Failed to load vault");
        return res.json();
      });
      setPhotos(data.photos ?? []);
      setGroups(data.groups ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unsave = useCallback(async (photoId: string) => {
    await fetch(`/api/photos/${photoId}/save`, { method: "DELETE" });
    invalidateCache(VAULT_CACHE_KEY);
    setPhotos((prev) => prev.filter((e) => e.photo.id !== photoId));
    setGroups((prev) =>
      prev
        .map((g) => ({
          ...g,
          photos: g.photos.filter((e) => e.photo.id !== photoId),
        }))
        .filter((g) => g.photos.length > 0)
    );
    setTotal((prev) => prev - 1);
  }, []);

  return { photos, groups, total, isLoading, error, refresh, unsave };
}
