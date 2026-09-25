interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private readonly entries = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    if (ttlSeconds <= 0) return;
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  size(): number {
    return this.entries.size;
  }
}

export function stableCacheKey(namespace: string, params: Record<string, string | number | undefined>): string {
  const normalized = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `${namespace}:${JSON.stringify(normalized)}`;
}
