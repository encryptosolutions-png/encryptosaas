const buckets = new Map<string, { count: number; resetAt: number }>()

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, remaining: limit - 1 }
  }

  if (current.count >= limit) {
    return { limited: true, remaining: 0, retryAfterMs: current.resetAt - now }
  }

  current.count += 1
  return { limited: false, remaining: limit - current.count }
}
