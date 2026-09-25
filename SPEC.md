# lastfm-mcp v0.3 specification

## Purpose

Expose a small, read-only subset of public Last.fm listening-history data through MCP so an AI client can make better music discovery and rediscovery decisions.

## Non-goals

V0.3 does not:

- write to Last.fm;
- request Last.fm passwords, shared secrets, session keys, or end-user API keys;
- provide social features;
- attempt to recreate Last.fm recommendation algorithms;
- persist user profiles in a database;
- provide opaque recommendation scoring.

## Identity model

Every tool accepts an optional `username` identifying the public Last.fm profile to query.

For personal/local use, `LASTFM_USERNAME` may define a default username. An explicit tool argument overrides that default.

For a public deployment, `LASTFM_USERNAME` should normally be omitted. The client supplies the relevant public Last.fm username with each tool call.

One server-side `LASTFM_API_KEY` authorizes requests to Last.fm. It must never be returned to clients.

## MCP tools

### recent_scrobbles
Inputs: `username?`, `limit?`, `from?`, `to?`.
Returns normalized recent scrobbles including artist, track, album, timestamp, URL, and now-playing status where available.

### top_items
Inputs: `username?`, `kind`, `period?`, `limit?`.
`kind`: artist, album, or track.
`period`: overall, 7day, 1month, 3month, 6month, or 12month.

### artist_history
Inputs: `username?`, `artist`.
Returns Last.fm's approximate user play count for the artist and whether it is greater than zero. Last.fm autocorrection is enabled.

### rediscovery_candidates
Inputs: `username?`, `recentPeriod?`, `limit?`, `historicalPool?`, `minHistoricalPlays?`.
Compares an all-time artist pool with a recent-period artist chart and returns explainable rediscovery candidates.

## Caching

The Last.fm client uses an in-memory TTL cache keyed by method and normalized parameters, including username. It honours Last.fm `Cache-Control: max-age` when present and otherwise uses endpoint-appropriate fallbacks.

V0.3 has no persistent cache or user database.

## Transports

- stdio for local MCP clients and development;
- Streamable HTTP at `/mcp` for remote clients and plugin deployment.

Local HTTP defaults to `127.0.0.1`. Container/cloud deployment can set `HOST=0.0.0.0`; production TLS should be terminated by the hosting platform or reverse proxy.

## Plugin package

The repository includes the portable Agent Plugins layout:

- `plugin.json`
- `mcp.json`
- `skills/lastfm-music-discovery/SKILL.md`

The MCP URL in `mcp.json` is a placeholder until a stable public HTTPS deployment exists.

## Future possibilities

- a user-friendly account-linking layer that remembers a Last.fm username;
- optional profile metadata for multi-account experiences;
- richer rediscovery windows and album-level rediscovery;
- scene/label/collaborator enrichment from additional public music sources;
- production rate limiting and telemetry.
