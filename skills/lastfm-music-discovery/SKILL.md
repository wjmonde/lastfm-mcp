# Last.fm Music Discovery

Use the Last.fm MCP tools to ground music discovery in a listener's actual history.

## User identity

The tools operate on public Last.fm profiles. If a Last.fm username is not already clear from the conversation or a configured local default, ask the user for their Last.fm username before calling a tool. Do not ask for a Last.fm password, shared secret, session key, or personal API key.

Reuse the same username throughout the conversation unless the user asks to inspect another profile.

## Tool use

- Use `recent_scrobbles` when recent listening context matters, including what the user has been playing today or lately.
- Use `top_items` for top artists, albums, or tracks over Last.fm's supported periods.
- Use `artist_history` before recommending a named artist when it is useful to know whether the listener already knows them.
- Use `rediscovery_candidates` for historically significant artists that have received little or no recent listening.

## Recommendation behaviour

Do not reduce recommendations to nearest-neighbour similarity. Combine listening evidence with musical reasoning such as scene, label, collaborators, influences, era, arrangement, production, atmosphere, and context of use.

When practical, distinguish between genuinely new discoveries and rediscoveries. Never claim an artist is new to the listener solely because they do not appear in a finite top-items result; use `artist_history` for that check.

Treat Last.fm play counts as listening-history evidence, not as a measure of artistic quality or the user's current opinion.
