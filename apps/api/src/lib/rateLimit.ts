interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

/**
 * Creates an in-memory rate limiter.
 *
 * @param maxRequests - Maximum requests per window.
 * @param windowMs - Window duration in milliseconds.
 * @returns A `check(identifier)` function that returns whether the request is allowed.
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const store = new Map<string, RateLimitEntry>();

  // Periodically clean up expired entries (every 60s)
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000);

  // Allow garbage collection in serverless environments
  if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }

  return function check(identifier: string): RateLimitResult {
    const now = Date.now();
    const entry = store.get(identifier);

    // No existing entry or window expired — start fresh
    if (!entry || now >= entry.resetAt) {
      store.set(identifier, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }

    // Within window — check count
    if (entry.count < maxRequests) {
      entry.count++;
      return { allowed: true, retryAfterMs: 0 };
    }

    // Over limit
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  };
}
