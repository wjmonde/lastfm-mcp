import 'dotenv/config';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { MemoryCache } from './cache.js';
import { loadConfig } from './config.js';
import { LastfmClient } from './lastfm-client.js';
import { createServer } from './server.js';
import { DefaultUserResolver } from './user-resolver.js';

const config = loadConfig();
const cache = new MemoryCache();
const client = new LastfmClient(config.apiKey, config.userAgent, cache, config.cacheTtlSeconds);
const userResolver = new DefaultUserResolver(config.defaultUsername);

void serveStdio(() => createServer(client, userResolver));
console.error(`lastfm-mcp 0.3.0 running on stdio${config.defaultUsername ? ` with local default ${config.defaultUsername}` : ''}`);
