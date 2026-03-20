// ============================================================
// lib/fetchCache.ts
// Lightweight in-memory cache with stale-while-revalidate,
// request deduplication, prefetch, and LRU eviction.
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const MAX_CACHE_SIZE = 50;
const DEFAULT_TTL_MS = 120_000; // 2 minutes

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

// ── LRU eviction ──────────────────────────────────────────────
// Map preserves insertion order. On access, we re-insert the key
// to move it to the end (most-recently-used). When evicting, we
// delete from the front (least-recently-used).

function touchKey(key: string, entry: CacheEntry<unknown>) {
  cache.delete(key);
  cache.set(key, entry);
}

function evictIfNeeded() {
  while (cache.size > MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
}

// ── Core fetch with SWR ───────────────────────────────────────

/**
 * Fetches data with an in-memory cache.
 *
 * - Returns cached data instantly if within `ttlMs`.
 * - If stale, returns stale data AND revalidates in background.
 * - Deduplicates concurrent requests for the same key.
 * - Evicts least-recently-used entries when cache exceeds MAX_CACHE_SIZE.
 *
 * @param key     Unique cache key (e.g. "/api/vault")
 * @param fetcher Async function that returns the data
 * @param ttlMs   Time-to-live in milliseconds (default 120s)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (entry) {
    touchKey(key, entry);

    if (Date.now() - entry.timestamp < ttlMs) {
      // Fresh — return immediately
      return entry.data;
    }

    // Stale — return stale data now, revalidate in background
    if (!inflight.has(key)) {
      const bgPromise = fetcher()
        .then((data) => {
          cache.set(key, { data, timestamp: Date.now() });
          inflight.delete(key);
        })
        .catch(() => {
          inflight.delete(key);
        });
      inflight.set(key, bgPromise);
    }
    return entry.data;
  }

  // No cache — deduplicate or fetch fresh
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, timestamp: Date.now() });
      evictIfNeeded();
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

// ── Prefetch ──────────────────────────────────────────────────

/**
 * Preload data into cache without blocking. Useful for hover/focus.
 * Will not re-fetch if data is already cached and fresh.
 */
export function prefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS
): void {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < ttlMs) return; // already fresh
  if (inflight.has(key)) return; // already fetching

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, timestamp: Date.now() });
      evictIfNeeded();
      inflight.delete(key);
    })
    .catch(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
}

// ── Invalidation ──────────────────────────────────────────────

/**
 * Invalidate one or all cache entries.
 * Call after mutations to force a fresh fetch.
 */
export function invalidateCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// ── Synchronous access ────────────────────────────────────────

/**
 * Get cached data synchronously (for instant initial render).
 * Returns undefined if nothing is cached.
 */
export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (entry) touchKey(key, entry);
  return entry?.data;
}
