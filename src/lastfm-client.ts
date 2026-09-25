import { MemoryCache, stableCacheKey } from './cache.js';
import type { ArtistHistory, LastfmPeriod, RecentScrobble, TopItem, TopKind } from './types.js';

const API_ROOT = 'https://ws.audioscrobbler.com/2.0/';

type JsonObject = Record<string, any>;

export class LastfmApiError extends Error {
  constructor(message: string, readonly code?: number) {
    super(message);
    this.name = 'LastfmApiError';
  }
}

export class LastfmClient {
  constructor(
    private readonly apiKey: string,
    private readonly userAgent: string,
    private readonly cache: MemoryCache,
    private readonly defaultTtlSeconds: number,
  ) {}

  private async request<T extends JsonObject>(
    method: string,
    params: Record<string, string | number | undefined>,
    fallbackTtlSeconds = this.defaultTtlSeconds,
  ): Promise<T> {
    const key = stableCacheKey(method, params);
    const cached = this.cache.get<T>(key);
    if (cached) return cached;

    const url = new URL(API_ROOT);
    url.searchParams.set('method', method);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('format', 'json');
    for (const [name, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(name, String(value));
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new LastfmApiError(`Last.fm HTTP ${response.status}: ${response.statusText}`);
    }

    const payload = (await response.json()) as T & { error?: number; message?: string };
    if (payload.error) {
      throw new LastfmApiError(payload.message || 'Last.fm API error', payload.error);
    }

    const cacheControl = response.headers.get('cache-control');
    const maxAge = cacheControl?.match(/max-age=(\d+)/i)?.[1];
    const ttl = maxAge ? Number.parseInt(maxAge, 10) : fallbackTtlSeconds;
    this.cache.set(key, payload, ttl);
    return payload;
  }

  async getRecentScrobbles(username: string, limit = 50, from?: number, to?: number): Promise<RecentScrobble[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const data = await this.request<JsonObject>(
      'user.getrecenttracks',
      { user: username, limit: safeLimit, from, to, extended: 0 },
      Math.min(this.defaultTtlSeconds, 60),
    );

    const tracks = data.recenttracks?.track ?? [];
    return (Array.isArray(tracks) ? tracks : [tracks]).map((item: JsonObject) => {
      const unixTime = item.date?.uts ? Number.parseInt(item.date.uts, 10) : undefined;
      return {
        artist: typeof item.artist === 'string' ? item.artist : item.artist?.['#text'] ?? item.artist?.name ?? '',
        track: item.name ?? '',
        album: item.album?.['#text'] || undefined,
        url: item.url || undefined,
        nowPlaying: item['@attr']?.nowplaying === 'true',
        playedAt: unixTime ? new Date(unixTime * 1000).toISOString() : undefined,
        unixTime,
      };
    });
  }

  async getTopItems(username: string, kind: TopKind, period: LastfmPeriod, limit = 20): Promise<TopItem[]> {
    const method = {
      artist: 'user.gettopartists',
      album: 'user.gettopalbums',
      track: 'user.gettoptracks',
    }[kind];
    const container = {
      artist: 'topartists',
      album: 'topalbums',
      track: 'toptracks',
    }[kind];
    const itemKey = kind;
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const ttl = period === 'overall' ? Math.max(this.defaultTtlSeconds, 1800) : Math.max(this.defaultTtlSeconds, 600);
    const data = await this.request<JsonObject>(method, { user: username, period, limit: safeLimit }, ttl);
    const raw = data[container]?.[itemKey] ?? [];

    return (Array.isArray(raw) ? raw : [raw]).map((item: JsonObject, index: number) => ({
      rank: Number.parseInt(item['@attr']?.rank ?? String(index + 1), 10),
      name: item.name ?? '',
      artist: kind === 'artist'
        ? undefined
        : (typeof item.artist === 'string' ? item.artist : item.artist?.name ?? item.artist?.['#text'] ?? ''),
      playcount: Number.parseInt(item.playcount ?? '0', 10),
      url: item.url || undefined,
    }));
  }

  async getArtistHistory(username: string, artist: string): Promise<ArtistHistory> {
    const data = await this.request<JsonObject>(
      'artist.getinfo',
      { artist, username, autocorrect: 1 },
      Math.max(this.defaultTtlSeconds, 900),
    );
    const resolvedName = data.artist?.name ?? artist;
    const playcount = Number.parseInt(data.artist?.stats?.userplaycount ?? '0', 10);
    return {
      artist: resolvedName,
      username,
      playcount,
      listened: playcount > 0,
      url: data.artist?.url || undefined,
      note: playcount > 0
        ? `${username} has scrobbled ${resolvedName} about ${playcount.toLocaleString('en-GB')} times.`
        : `${username} has no recorded Last.fm scrobbles for ${resolvedName}.`,
    };
  }
}
