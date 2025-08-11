type Counter = { count: number; resetAt: number };

const store = new Map<string, Counter>();

export function getClientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("user-agent") || "unknown";
}

// Minimal API: returns true if within limit, false if blocked.
export function rateLimitHit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count < limit) {
    bucket.count += 1;
    return true;
  }
  return false;
}
