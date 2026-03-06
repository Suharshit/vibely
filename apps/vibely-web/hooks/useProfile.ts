// ============================================================
// apps/web/hooks/useProfile.ts
// ============================================================

import { useState, useEffect, useCallback } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface ProfileStats {
  events: number;
  photos_uploaded: number;
  vault_size: number;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  stats: ProfileStats | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: {
    name?: string;
    bio?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; error?: string }>;
  avatarUploading: boolean;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data.profile);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (data: { name?: string; bio?: string }) => {
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) return { success: false, error: result.error };
        setProfile(result.profile);
        return { success: true };
      } catch {
        return { success: false, error: "Network error" };
      }
    },
    []
  );

  const uploadAvatar = useCallback(async (file: File) => {
    setAvatarUploading(true);
    try {
      // Step 1: get signed URL
      const initRes = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: file.type, file_size: file.size }),
      });
      const { upload_url, storage_key } = await initRes.json();
      if (!initRes.ok)
        return { success: false, error: "Failed to get upload URL" };

      // Step 2: upload directly to storage
      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) return { success: false, error: "Upload failed" };

      // Step 3: save URL to profile
      const completeRes = await fetch("/api/profile/avatar/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_key }),
      });
      const result = await completeRes.json();
      if (!completeRes.ok) return { success: false, error: result.error };

      setProfile(result.profile);
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    } finally {
      setAvatarUploading(false);
    }
  }, []);

  return {
    profile,
    stats,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    avatarUploading,
  };
}
