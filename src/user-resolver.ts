import type { UserContext, UserResolver } from './types.js';

export class DefaultUserResolver implements UserResolver {
  constructor(private readonly defaultUsername?: string) {}

  resolve(explicitUsername?: string): UserContext {
    const username = explicitUsername?.trim() || this.defaultUsername?.trim();
    if (!username) {
      throw new Error('A Last.fm username is required. Pass username to the tool, or configure LASTFM_USERNAME as a local default.');
    }
    return { username };
  }
}
