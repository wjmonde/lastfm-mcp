import 'dotenv/config';
import { createServer as createNodeHttpServer } from 'node:http';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { localhostHostValidation, localhostOriginValidation, toNodeHandler } from '@modelcontextprotocol/node';
import { MemoryCache } from './cache.js';
import { loadConfig } from './config.js';
import { LastfmClient } from './lastfm-client.js';
import { createServer } from './server.js';
import { DefaultUserResolver } from './user-resolver.js';

const config = loadConfig();
const cache = new MemoryCache();
const client = new LastfmClient(config.apiKey, config.userAgent, cache, config.cacheTtlSeconds);
const userResolver = new DefaultUserResolver(config.defaultUsername);

const handler = createMcpHandler(() => createServer(client, userResolver));
const nodeHandler = toNodeHandler(handler);
const localOnly = config.host === '127.0.0.1' || config.host === 'localhost' || config.host === '::1';
const validateHost = localOnly ? localhostHostValidation() : undefined;
const validateOrigin = localOnly ? localhostOriginValidation() : undefined;

const httpServer = createNodeHttpServer((req, res) => {
  if (validateHost && !validateHost(req, res)) return;
  if (validateOrigin && !validateOrigin(req, res)) return;
  void nodeHandler(req, res);
});

httpServer.listen(config.port, config.host, () => {
  console.error(`lastfm-mcp 0.3.0 running on http://${config.host}:${config.port}/mcp${config.defaultUsername ? ` with local default ${config.defaultUsername}` : ''}`);
});

async function shutdown(): Promise<void> {
  await handler.close();
  httpServer.close(() => process.exit(0));
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
