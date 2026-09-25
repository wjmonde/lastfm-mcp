# Privacy notes for a public deployment

This project is designed to query public Last.fm listening profiles using a server-side Last.fm API key.

A production operator should:

- collect only the Last.fm username required for a tool call;
- never request users' Last.fm passwords, shared secrets, session keys, or API keys;
- avoid retaining Last.fm usernames or listening data beyond short-lived operational caching unless a clear product need and privacy notice justify it;
- keep the server-side Last.fm API key in the hosting provider's secret store;
- ensure application logs do not contain API keys or unnecessary listening-history payloads;
- publish a real privacy policy and terms URL before public plugin submission.

The current in-memory cache is process-local and expires entries using TTLs. It is not a persistent user database.
