/**
 * In-memory rate limiter для auth endpoints.
 * Ограничивает: 10 попыток за 15 минут с одного IP.
 * Примечание: работает в рамках одного Node.js процесса.
 * Для multi-instance деплоя замените на Redis-based решение.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Периодически чистим устаревшие записи (каждые 5 минут)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export interface RateLimitOptions {
  /** Максимальное количество попыток за окно */
  limit: number;
  /** Длина окна в миллисекундах */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // Первый запрос или окно истекло — сбрасываем
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.limit - 1, resetAt };
  }

  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: options.limit - entry.count, resetAt: entry.resetAt };
}

/** Получить IP из заголовков (с учётом Nginx X-Forwarded-For) */
export function getClientIp(request: Request): string {
  const forwarded = (request.headers as Headers).get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return (request.headers as Headers).get("x-real-ip") || "unknown";
}
