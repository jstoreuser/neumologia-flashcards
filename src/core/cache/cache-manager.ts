/**
 * Cache Manager — versioned, domain-partitioned, cross-tab aware.
 *
 * Uses BroadcastChannel to invalidate cache across tabs when data changes.
 * Each domain has its own cache key with version included to prevent stale data
 * after schema migrations.
 *
 * Cache keys follow: barcl:v{version}:{domain}:{discriminator}
 */

const CACHE_VERSION = 1;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  version: number;
}

interface CacheStore {
  [key: string]: CacheEntry<unknown>;
}

type InvalidationMessage = {
  type: 'invalidate';
  domain: string;
};

// In-memory store (Map is slightly faster than object for frequent reads)
const memoryCache = new Map<string, CacheEntry<unknown>>();

// BroadcastChannel for cross-tab cache invalidation
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel('barcl:cache');
    channel.onmessage = (event: MessageEvent<InvalidationMessage>) => {
      if (event.data.type === 'invalidate') {
        invalidateByDomain(event.data.domain, /* broadcast= */ false);
      }
    };
  }
  return channel;
}

function buildKey(domain: string, discriminator: string): string {
  return `barcl:v${CACHE_VERSION}:${domain}:${discriminator}`;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export function cacheGet<T>(domain: string, discriminator: string): T | null {
  const key = buildKey(domain, discriminator);
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (!entry) return null;

  // Reject entries from a different schema version
  if (entry.version !== CACHE_VERSION) {
    memoryCache.delete(key);
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export function cacheSet<T>(
  domain: string,
  discriminator: string,
  data: T,
  ttlMs: number = DEFAULT_TTL_MS,
): void {
  const key = buildKey(domain, discriminator);
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttlMs,
    version: CACHE_VERSION,
  };
  memoryCache.set(key, entry as CacheEntry<unknown>);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

/**
 * Invalidates all cache entries for a given domain.
 * Optionally broadcasts the invalidation to other tabs.
 */
export function invalidateByDomain(domain: string, broadcast = true): void {
  const prefix = `barcl:v${CACHE_VERSION}:${domain}:`;
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  if (broadcast) {
    const ch = getChannel();
    if (ch) {
      const msg: InvalidationMessage = { type: 'invalidate', domain };
      ch.postMessage(msg);
    }
  }
}

export function invalidateAll(): void {
  memoryCache.clear();
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const FlashcardCache = {
  get: (specialty: string, page: number) =>
    cacheGet<unknown[]>('flashcards', `${specialty}:p${page}`),

  set: (specialty: string, page: number, data: unknown[]) =>
    cacheSet('flashcards', `${specialty}:p${page}`, data),

  invalidate: () => invalidateByDomain('flashcards'),
};

export const ProgressCache = {
  get: (uid: string) =>
    cacheGet<Record<string, unknown>>('progress', uid),

  set: (uid: string, data: Record<string, unknown>) =>
    cacheSet('progress', uid, data),

  invalidate: (uid: string) => invalidateByDomain(`progress`),
};
