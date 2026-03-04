// ============================================================
// packages/shared/utils/invite.ts
// ============================================================
// WHY nanoid for tokens?
// Math.random() is NOT cryptographically secure — an attacker
// could predict tokens by observing a few samples. nanoid uses
// the Web Crypto API (crypto.getRandomValues) which is
// cryptographically random. A 12-char token from a 64-char
// alphabet gives 64^12 = ~1.3 × 10^21 possible values —
// effectively brute-force proof.
//
// WHY 12 chars?
// Short enough to type manually if needed, long enough to be
// safe. The alphabet excludes similar-looking chars (0/O, 1/I/l)
// so tokens are easier to read and transcribe correctly.
// ============================================================

import { customAlphabet } from 'nanoid';

// 62-char alphabet: uppercase + lowercase + digits
// Excludes: 0, O, 1, I, l to avoid visual confusion
const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

// 12-char invite tokens: typed into URLs and QR codes
export const generateInviteToken = customAlphabet(INVITE_ALPHABET, 12);

// 32-char guest session tokens: stored server-side, never typed
export const generateGuestToken = customAlphabet(INVITE_ALPHABET, 32);

// ── Event date/expiry helpers ────────────────────────────────

/**
 * Default expiry: 30 days after the event date.
 * Photos are auto-deleted after this — users can save to vault before then.
 * We give 30 days (not 24h) because people often view event photos
 * over the following weeks, not just the day of.
 */
export function defaultExpiresAt(eventDate: Date): Date {
  const expiry = new Date(eventDate);
  expiry.setDate(expiry.getDate() + 30);
  return expiry;
}

/**
 * Returns true if the event has passed its expiry date.
 * Use this on the client for UI hints; the DB cron job is
 * the authoritative source of truth for status changes.
 */
export function isEventExpired(expiresAt: string | Date): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Returns a human-readable relative time string.
 * e.g. "in 3 days", "2 hours ago", "yesterday"
 */
export function relativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffMins = Math.round(diffMs / (1000 * 60));

  if (Math.abs(diffMins) < 1) return 'just now';
  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins}m` : `${-diffMins}m ago`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours}h` : `${-diffHours}h ago`;
  }
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  if (diffDays > 1 && diffDays <= 30) return `in ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -30) return `${-diffDays} days ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Formats a date for display in event cards and detail pages.
 * e.g. "Saturday, March 15, 2025 · 7:00 PM"
 */
export function formatEventDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}