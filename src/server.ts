import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { findRediscoveryCandidates } from './rediscovery.js';
import type { LastfmClient } from './lastfm-client.js';
import type { UserResolver } from './types.js';

const periodSchema = z.enum(['overall', '7day', '1month', '3month', '6month', '12month']);
const topKindSchema = z.enum(['artist', 'album', 'track']);
const usernameSchema = z.string().min(1).max(100).optional().describe('Last.fm username. Optional only when the server has a local default configured.');

function toolResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data as Record<string, unknown>,
  };
}

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  };
}

export function createServer(client: LastfmClient, userResolver: UserResolver): McpServer {
  const server = new McpServer({ name: 'lastfm-listening-history', version: '0.3.0' });

  server.registerTool(
    'recent_scrobbles',
    {
      description: 'Get a Last.fm user’s most recent scrobbles. Read-only. Pass a username unless the server has a local default.',
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
      inputSchema: z.object({
        username: usernameSchema,
        limit: z.number().int().min(1).max(200).default(50).describe('Number of scrobbles to return (1-200).'),
        from: z.number().int().positive().optional().describe('Optional UNIX timestamp; only return scrobbles after this time.'),
        to: z.number().int().positive().optional().describe('Optional UNIX timestamp; only return scrobbles before this time.'),
      }),
    },
    async ({ username: requestedUsername, limit, from, to }) => {
      try {
        const { username } = await userResolver.resolve(requestedUsername);
        const scrobbles = await client.getRecentScrobbles(username, limit, from, to);
        return toolResult({ username, count: scrobbles.length, scrobbles });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'top_items',
    {
      description: 'Get top artists, albums, or tracks for a Last.fm user over a selectable period. Pass a username unless the server has a local default.',
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
      inputSchema: z.object({
        username: usernameSchema,
        kind: topKindSchema.describe('Whether to return artists, albums, or tracks.'),
        period: periodSchema.default('overall'),
        limit: z.number().int().min(1).max(200).default(20),
      }),
    },
    async ({ username: requestedUsername, kind, period, limit }) => {
      try {
        const { username } = await userResolver.resolve(requestedUsername);
        const items = await client.getTopItems(username, kind, period, limit);
        return toolResult({ username, kind, period, count: items.length, items });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'artist_history',
    {
      description: 'Check whether a Last.fm user has listened to an artist and return the approximate total scrobble count. Pass a username unless the server has a local default.',
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
      inputSchema: z.object({
        username: usernameSchema,
        artist: z.string().min(1).max(300).describe('Artist name. Last.fm autocorrection is enabled.'),
      }),
    },
    async ({ username: requestedUsername, artist }) => {
      try {
        const { username } = await userResolver.resolve(requestedUsername);
        return toolResult(await client.getArtistHistory(username, artist));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'rediscovery_candidates',
    {
      description: 'Find historically significant artists with little or no listening in a recent Last.fm period. Uses an explainable heuristic, not a Last.fm recommendation endpoint.',
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
      inputSchema: z.object({
        username: usernameSchema,
        recentPeriod: z.enum(['1month', '3month', '6month', '12month']).default('3month'),
        limit: z.number().int().min(1).max(30).default(10),
        historicalPool: z.number().int().min(20).max(200).default(100).describe('How many all-time top artists to consider.'),
        minHistoricalPlays: z.number().int().min(1).default(20),
      }),
    },
    async ({ username: requestedUsername, recentPeriod, limit, historicalPool, minHistoricalPlays }) => {
      try {
        const { username } = await userResolver.resolve(requestedUsername);
        const [historical, recent] = await Promise.all([
          client.getTopItems(username, 'artist', 'overall', historicalPool),
          client.getTopItems(username, 'artist', recentPeriod, 200),
        ]);
        const candidates = findRediscoveryCandidates(historical, recent, limit, minHistoricalPlays);
        return toolResult({
          username,
          recentPeriod,
          methodology: 'Ranks historically important artists higher and penalises artists with substantial listening in the selected recent period.',
          count: candidates.length,
          candidates,
        });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}
