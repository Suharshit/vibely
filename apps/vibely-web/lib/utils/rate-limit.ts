// ============================================================
// apps/web/lib/rate-limit.ts
// ============================================================
// Reusable rate limiter using Upstash Redis.
//
// WHY Upstash Redis for rate limiting?
// - Free tier: 10,000 commands/day — more than enough for MVP
// - Serverless-friendly: HTTP-based, no persistent connection
//   needed (works in Next.js Edge/Serverless functions)
// - Atomic: uses Redis INCR + EXPIRE which are atomic operations
//   so there are no race conditions in concurrent requests
//
// HOW it works (sliding window counter):
// 1. Build a Redis key: "rl:{identifier}:{windowStart}"
//    where windowStart = floor(now / windowMs) * windowMs
// 2. INCR the key (atomic — safe under concurrent requests)
// 3. On first increment, set TTL = windowMs so it auto-expires
// 4. If count > limit, reject the request
//
// Usage in an API route:
//   const result = await rateLimit(request, 'upload', { limit: 20, windowMs: 60_000 });
//   if (!result.success) return result.response; // 429 Too Many Requests
// ============================================================

import { NextResponse } from "next/server";

// ── Upstash Redis client (HTTP-based, no persistent connection) ──

const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

async function redisCommand<T>(command: string[]): Promise<T> {
  const res = await fetch(`${UPSTASH_REDIS_URL}/${command.join("/")}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_TOKEN}` },
  });
  const data = await res.json();
  return data.result as T;
}

// ── Rate limit options ────────────────────────────────────────

interface RateLimitOptions {
  limit: number; // max requests allowed in the window
  windowMs: number; // window duration in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // unix timestamp when the window resets
  response?: NextResponse; // 429 response if success=false
}

// ── Core rate limiter ─────────────────────────────────────────

export async function rateLimit(
  request: Request,
  namespace: string, // e.g. 'upload', 'guest-session', 'join'
  options: RateLimitOptions,
  identifier?: string // custom identifier (defaults to IP)
): Promise<RateLimitResult> {
  // If Upstash isn't configured (local dev), skip rate limiting
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) {
    return { success: true, remaining: options.limit, reset: 0 };
  }

  // Determine the identifier (IP address by default)
  const id =
    identifier ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Sliding window: bucket by windowStart
  const windowStart =
    Math.floor(Date.now() / options.windowMs) * options.windowMs;
  const key = `rl:${namespace}:${id}:${windowStart}`;
  const reset = windowStart + options.windowMs;
  const ttlSeconds = Math.ceil(options.windowMs / 1000);

  // INCR — atomically increment the counter
  const count = await redisCommand<number>(["INCR", key]);

  // On first increment, set expiry so the key auto-cleans
  if (count === 1) {
    await redisCommand(["EXPIRE", key, String(ttlSeconds)]);
  }

  const remaining = Math.max(0, options.limit - count);
  const success = count <= options.limit;

  if (!success) {
    return {
      success: false,
      remaining: 0,
      reset,
      response: new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please slow down.",
          retry_after: Math.ceil((reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(options.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(reset / 1000)),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      ),
    };
  }

  return { success: true, remaining, reset };
}

// ── Pre-configured limiters for each use case ─────────────────
// These are the specific limits we apply across Phase 11.
// Defined here so limits are in one place, easy to tune.

/** Upload photos: 20 per user/guest per hour */
export const uploadRateLimit = (req: Request, userId: string) =>
  rateLimit(req, "upload", { limit: 20, windowMs: 60 * 60 * 1000 }, userId);

/** Guest session creation: 5 per IP per 15 minutes */
export const guestSessionRateLimit = (req: Request) =>
  rateLimit(req, "guest-session", { limit: 5, windowMs: 15 * 60 * 1000 });

/** Join event: 10 per IP per minute */
export const joinEventRateLimit = (req: Request) =>
  rateLimit(req, "join-event", { limit: 10, windowMs: 60 * 1000 });

/** Auth attempts: 10 per IP per 15 minutes */
export const authRateLimit = (req: Request) =>
  rateLimit(req, "auth", { limit: 10, windowMs: 15 * 60 * 1000 });
