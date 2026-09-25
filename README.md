# lastfm-mcp

A small, open-source, read-only MCP server for Last.fm listening history. It is designed to support music discovery and rediscovery in MCP clients and can be packaged as a ChatGPT/Codex plugin.

## What v0.3 does

- recent scrobbles;
- top artists, albums and tracks over Last.fm's standard periods;
- check whether a listener has heard a named artist and roughly how much;
- identify rediscovery candidates: historically important artists with little recent listening;
- support multiple public Last.fm profiles without asking end users for API credentials;
- run over stdio or Streamable HTTP;
- include a portable plugin manifest, MCP configuration template, and music-discovery skill.

The server is read-only. It does not use Last.fm write APIs and does not require a Last.fm shared secret.

## Requirements

- Node.js 20 or newer
- one Last.fm API key for the server/operator

## Personal/local setup

Copy `.env.example` to `.env` and set:

```env
LASTFM_API_KEY=your_real_api_key
LASTFM_USERNAME=WJMonde
LASTFM_USER_AGENT=lastfm-mcp/0.3.0
```

`LASTFM_USERNAME` is optional in v0.3. Keeping it set gives personal/local use the same convenient behaviour as v0.2. If it is omitted, every tool call must include a username.

Install dependencies:

```powershell
npm.cmd install
```

Typecheck:

```powershell
npm.cmd run typecheck
```

## Run locally over stdio

```powershell
npm.cmd run dev
```

## Run locally over HTTP

```powershell
npm.cmd run dev:http
```

Default endpoint:

```text
http://127.0.0.1:3000/mcp
```

For a cloud/container host, the platform will often require:

```env
HOST=0.0.0.0
```

Terminate TLS at the hosting platform and expose a stable HTTPS `/mcp` URL for plugin use.

## Tools

Each tool now accepts an optional `username`. If `LASTFM_USERNAME` is configured locally, it is used as the fallback.

### `recent_scrobbles`
Returns recent scrobbles, optionally bounded by UNIX timestamps.

### `top_items`
Returns top `artist`, `album` or `track` items for `overall`, `7day`, `1month`, `3month`, `6month` or `12month`.

### `artist_history`
Uses Last.fm's artist information endpoint with the requested username to report whether that listener has scrobbled an artist and the approximate play count.

### `rediscovery_candidates`
Compares all-time top artists against a recent period and surfaces historically significant artists with little or no recent listening. The heuristic is deliberately explainable.

## Plugin packaging

The repository includes:

```text
plugin.json
mcp.json
skills/lastfm-music-discovery/SKILL.md
```

Before using the package against a deployed server, replace the placeholder URL in `mcp.json`:

```json
"url": "https://YOUR-PUBLIC-DOMAIN.example/mcp"
```

with the real stable HTTPS MCP endpoint.

See `docs/PUBLIC-PLUGIN-ROADMAP.md` for the path from this prototype to public submission.

## Build and test

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
```

## Security and privacy

- Never commit `.env`.
- Keep the Last.fm API key server-side.
- End users should provide only a public Last.fm username.
- Do not request users' Last.fm password, shared secret, session key, or API key.
- See `docs/PRIVACY.md` before deploying publicly.
