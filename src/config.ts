export interface Config {
  apiKey: string;
  defaultUsername?: string;
  userAgent: string;
  cacheTtlSeconds: number;
  port: number;
  host: string;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export function loadConfig(): Config {
  const ttlRaw = process.env.LASTFM_CACHE_TTL_SECONDS ?? '300';
  const cacheTtlSeconds = Number.parseInt(ttlRaw, 10);
  if (!Number.isFinite(cacheTtlSeconds) || cacheTtlSeconds < 0) {
    throw new Error('LASTFM_CACHE_TTL_SECONDS must be a non-negative integer');
  }

  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return {
    apiKey: required('LASTFM_API_KEY'),
    defaultUsername: optional('LASTFM_USERNAME'),
    userAgent: optional('LASTFM_USER_AGENT') || 'lastfm-mcp/0.3.0',
    cacheTtlSeconds,
    port,
    host: optional('HOST') || '127.0.0.1',
  };
}
