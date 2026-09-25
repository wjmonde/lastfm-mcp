import assert from 'node:assert/strict';
import { findRediscoveryCandidates } from '../rediscovery.js';

const historical = [
  { rank: 1, name: 'Old Favourite', playcount: 1000 },
  { rank: 2, name: 'Still Current', playcount: 900 },
  { rank: 3, name: 'Forgotten Gem', playcount: 400 },
];
const recent = [
  { rank: 1, name: 'Still Current', playcount: 120 },
  { rank: 50, name: 'Old Favourite', playcount: 1 },
];

const result = findRediscoveryCandidates(historical, recent, 3, 20);
assert.equal(result[0]?.artist, 'Forgotten Gem');
assert.ok((result.find(x => x.artist === 'Still Current')?.score ?? 999) < (result.find(x => x.artist === 'Old Favourite')?.score ?? -999));
console.error('rediscovery heuristic test passed');
