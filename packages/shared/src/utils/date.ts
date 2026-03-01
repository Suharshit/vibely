/**
 * Date Utility Functions
 */

/**
 * Check if a date string is in the past
 */
export function isExpired(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Calculate days until a date
 */
export function daysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date to ISO string for API
 */
export function toISOString(date: Date | string): string {
  return new Date(date).toISOString();
}

/**
 * Format date for display (human-readable)
 */
export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return new Date(dateString).toLocaleDateString(undefined, defaultOptions);
}

/**
 * Format date and time for display
 */
export function formatDateTime(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };
  return new Date(dateString).toLocaleString(undefined, defaultOptions);
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSecs = Math.floor(Math.abs(diffMs) / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isPast = diffMs < 0;
  const suffix = isPast ? "ago" : "from now";

  if (diffSecs < 60) {
    return `${diffSecs} second${diffSecs !== 1 ? "s" : ""} ${suffix}`;
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ${suffix}`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ${suffix}`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ${suffix}`;
  }
}