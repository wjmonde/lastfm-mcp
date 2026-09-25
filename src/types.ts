export type LastfmPeriod = 'overall' | '7day' | '1month' | '3month' | '6month' | '12month';
export type TopKind = 'artist' | 'album' | 'track';

export interface UserContext {
  username: string;
}

export interface UserResolver {
  resolve(explicitUsername?: string): Promise<UserContext> | UserContext;
}

export interface RecentScrobble {
  artist: string;
  track: string;
  album?: string;
  url?: string;
  nowPlaying: boolean;
  playedAt?: string;
  unixTime?: number;
}

export interface TopItem {
  rank: number;
  name: string;
  artist?: string;
  playcount: number;
  url?: string;
}

export interface ArtistHistory {
  artist: string;
  username: string;
  playcount: number;
  listened: boolean;
  url?: string;
  note: string;
}

export interface RediscoveryCandidate {
  artist: string;
  historicalPlaycount: number;
  historicalRank: number;
  recentPlaycount: number;
  recentRank?: number;
  score: number;
  reason: string;
  url?: string;
}
