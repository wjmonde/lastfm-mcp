# Public plugin roadmap

## v0.3 — multi-profile anonymous read-only server

- Every MCP tool accepts an optional `username`.
- `LASTFM_USERNAME` remains an optional local default for personal use.
- A public deployment can leave `LASTFM_USERNAME` unset, requiring each tool call to identify the public Last.fm profile being queried.
- One server-side `LASTFM_API_KEY` is used for Last.fm API access. End users do not supply API credentials.
- Portable OpenAI/Agent Plugins packaging is included via `plugin.json`, `mcp.json`, and a bundled skill.

## Before public testing

1. Deploy the HTTP server to a stable HTTPS host.
2. Set `LASTFM_API_KEY` in the host's secret manager.
3. Set `HOST=0.0.0.0` if required by the hosting platform.
4. Replace the placeholder URL in `mcp.json` with the deployed HTTPS `/mcp` endpoint.
5. Test all tools with MCP Inspector against the deployed endpoint.
6. Connect the endpoint to ChatGPT developer mode where available and test direct, indirect, invalid, and out-of-scope prompts.

## Before public submission

- Add final developer identity and website metadata to `plugin.json`.
- Publish privacy policy and terms pages and add their URLs to the OpenAI interface metadata.
- Verify the publishing identity in the OpenAI Platform Dashboard.
- Add basic production rate limiting, request logging that excludes secrets, and uptime/error monitoring.
- Confirm the Last.fm API terms permit the intended public service and traffic pattern.
- Submit through OpenAI's plugin submission portal and complete review.

## Later options

A future version could add an account-linking layer so users do not need to mention their Last.fm username in each new context. That should be introduced only if the convenience benefit justifies operating an identity/authentication system.
