import { useState, useEffect, useCallback } from "react";

export function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function useDashboardStats() {
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [formattedSize, setFormattedSize] = useState("0 Bytes");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const data = await res.json();
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
