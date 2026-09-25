import type { RediscoveryCandidate, TopItem } from './types.js';

export function findRediscoveryCandidates(
  historical: TopItem[],
  recent: TopItem[],
  limit = 10,
  minHistoricalPlays = 20,
): RediscoveryCandidate[] {
  const recentByArtist = new Map(recent.map(item => [item.name.toLocaleLowerCase(), item]));

  return historical
    .filter(item => item.playcount >= minHistoricalPlays)
    .map(item => {
      const recentItem = recentByArtist.get(item.name.toLocaleLowerCase());
      const recentPlaycount = recentItem?.playcount ?? 0;

      // Deliberately simple/explainable: historical weight, rank significance,
      // then a strong penalty for recent activity.
      const historicalWeight = Math.log10(item.playcount + 1) * 30;
      const rankWeight = Math.max(0, 40 - item.rank * 0.4);
      const recentPenalty = Math.log10(recentPlaycount + 1) * 45;
      const score = Math.round((historicalWeight + rankWeight - recentPenalty) * 10) / 10;

      return {
        artist: item.name,
        historicalPlaycount: item.playcount,
        historicalRank: item.rank,
        recentPlaycount,
        recentRank: recentItem?.rank,
        score,
        url: item.url,
        reason: recentPlaycount === 0
          ? `Historically #${item.rank} with ${item.playcount} scrobbles, but absent from the selected recent period.`
          : `Historically #${item.rank} with ${item.playcount} scrobbles, versus only ${recentPlaycount} in the selected recent period.`,
      };
    })
    .sort((a, b) => b.score - a.score || a.historicalRank - b.historicalRank)
    .slice(0, Math.max(1, limit));
}
