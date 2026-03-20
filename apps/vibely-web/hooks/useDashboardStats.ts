import { useState, useEffect, useCallback } from "react";
import { cachedFetch, getCached } from "@/lib/fetchCache";

export function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const STATS_CACHE_KEY = "dashboard-stats";

export function useDashboardStats() {
  const cached = getCached<{ totalPhotos: number; totalBytes: number }>(
    STATS_CACHE_KEY
  );
  const [totalPhotos, setTotalPhotos] = useState(cached?.totalPhotos ?? 0);
  const [totalBytes, setTotalBytes] = useState(cached?.totalBytes ?? 0);
  const [formattedSize, setFormattedSize] = useState(
    cached ? formatBytes(cached.totalBytes) : "0 Bytes"
  );
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cachedFetch(STATS_CACHE_KEY, async () => {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        return res.json();
      });
      setTotalPhotos(data.totalPhotos || 0);
      setTotalBytes(data.totalBytes || 0);
      setFormattedSize(formatBytes(data.totalBytes || 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    totalPhotos,
    totalBytes,
    formattedSize,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
