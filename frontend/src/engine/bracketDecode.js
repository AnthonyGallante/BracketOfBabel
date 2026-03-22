// bracketDecode.js
//
// Mirror of `backend/brackets/bracket_engine.py`'s decoding logic.
// Provides:
// - bracketFromInt(n, tournament?): BigInt -> structured bracket object
// - intFromBracket(bits): bits[63] -> BigInt

import { getRegions, getTeamByRegionAndSeed } from "./teams.js";
import { TOTAL_BITS } from "./constants.js";
import { getSelectedTournament } from "./tournamentState.js";

// Round of 64 matchups within each region. Tuple order defines "top" vs "bottom".
// (top_seed, bottom_seed)
const ROUND64_MATCHUPS = [
  [1, 16],
  [8, 9],
  [5, 12],
  [4, 13],
  [6, 11],
  [3, 14],
  [7, 10],
  [2, 15],
];

function assertBigIntInRange(n) {
  if (typeof n !== "bigint") throw new TypeError("n must be a BigInt");
  // Upper bound is (2^63). Brackets are in [0, 2^63).
  if (n < 0n || n >= 2n ** 63n) throw new RangeError("n must be in [0, 2^63)");
}

function bitsFromInt(n) {
  // bit i is (n >> i) & 1, so bit 0 is the LSB.
  const bits = new Array(TOTAL_BITS);
  for (let i = 0; i < TOTAL_BITS; i++) {
    bits[i] = Number((n >> BigInt(i)) & 1n); // 0 or 1
  }
  return bits;
}

export function intFromBracket(bits) {
  if (!Array.isArray(bits) || bits.length !== TOTAL_BITS) {
    throw new Error(`bits must be an array of length ${TOTAL_BITS}`);
  }
  let result = 0n;
  for (let i = 0; i < bits.length; i++) {
    const bit = bits[i];
    if (bit !== 0 && bit !== 1) throw new Error("all bits must be 0 or 1");
    result |= BigInt(bit) << BigInt(i);
  }
  return result;
}

/**
 * @param {bigint} n
 * @param {string} [tournament] Roster + region labels (`men` / `women`). Defaults to `getSelectedTournament()`.
 */
export function bracketFromInt(n, tournament = getSelectedTournament()) {
  // Returns a structured bracket object matching backend schema closely.
  assertBigIntInRange(n);
  const bits = bitsFromInt(n);

  const REGIONS = getRegions(tournament);

  // Winners are propagated within each region.
  const round64Winners = REGIONS.map(() => new Array(8).fill(null));
  const round32Winners = REGIONS.map(() => new Array(4).fill(null));
  const sweet16Winners = REGIONS.map(() => new Array(2).fill(null));
  const elite8Winners = REGIONS.map(() => new Array(1).fill(null));

  const games = [];
  const rounds = {
    round_of_64: [],
    round_of_32: [],
    sweet_16: [],
    elite_8: [],
    final_four: [],
    championship: [],
  };

  // 1) Round of 64 (32 games): bits 0..31
  // Order: regions East -> South -> West -> Midwest; within region:
  // (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
  for (let regionIdx = 0; regionIdx < REGIONS.length; regionIdx++) {
    const region = REGIONS[regionIdx];
    for (let game64Idx = 0; game64Idx < ROUND64_MATCHUPS.length; game64Idx++) {
      const [topSeed, bottomSeed] = ROUND64_MATCHUPS[game64Idx];
      const bitPos = regionIdx * 8 + game64Idx;
      const bit = bits[bitPos];

      const topTeam = getTeamByRegionAndSeed(region, topSeed, tournament);
      const bottomTeam = getTeamByRegionAndSeed(region, bottomSeed, tournament);
      if (!topTeam || !bottomTeam) throw new Error("Missing team roster entry");

      const winner = bit === 0 ? topTeam : bottomTeam;
      round64Winners[regionIdx][game64Idx] = winner;

      const game = {
        bit,
        round: 64,
        region,
        top_team: topTeam,
        bottom_team: bottomTeam,
        winner,
      };
      games.push(game);
      rounds.round_of_64.push(game);
    }
  }

  // 2) Round of 32 (16 games): bits 32..47
  // Within each region: winner(1v16) vs winner(8v9), ... in that derived order.
  for (let regionIdx = 0; regionIdx < REGIONS.length; regionIdx++) {
    const region = REGIONS[regionIdx];
    for (let game32Idx = 0; game32Idx < 4; game32Idx++) {
      const bitPos = 32 + regionIdx * 4 + game32Idx;
      const bit = bits[bitPos];

      const r64TopIdx = game32Idx * 2;
      const r64BottomIdx = game32Idx * 2 + 1;
      const topTeam = round64Winners[regionIdx][r64TopIdx];
      const bottomTeam = round64Winners[regionIdx][r64BottomIdx];
      if (!topTeam || !bottomTeam) throw new Error("Internal propagation error");

      const winner = bit === 0 ? topTeam : bottomTeam;
      round32Winners[regionIdx][game32Idx] = winner;

      const game = {
        bit,
        round: 32,
        region,
        top_team: topTeam,
        bottom_team: bottomTeam,
        winner,
      };
      games.push(game);
      rounds.round_of_32.push(game);
    }
  }

  // 3) Sweet 16 (8 games): bits 48..55
  for (let regionIdx = 0; regionIdx < REGIONS.length; regionIdx++) {
    const region = REGIONS[regionIdx];
    for (let game16Idx = 0; game16Idx < 2; game16Idx++) {
      const bitPos = 48 + regionIdx * 2 + game16Idx;
      const bit = bits[bitPos];

      const r32TopIdx = game16Idx * 2;
      const r32BottomIdx = game16Idx * 2 + 1;
      const topTeam = round32Winners[regionIdx][r32TopIdx];
      const bottomTeam = round32Winners[regionIdx][r32BottomIdx];
      if (!topTeam || !bottomTeam) throw new Error("Internal propagation error");

      const winner = bit === 0 ? topTeam : bottomTeam;
      sweet16Winners[regionIdx][game16Idx] = winner;

      const game = {
        bit,
        round: 16,
        region,
        top_team: topTeam,
        bottom_team: bottomTeam,
        winner,
      };
      games.push(game);
      rounds.sweet_16.push(game);
    }
  }

  // 4) Elite 8 (4 games): bits 56..59, one per region
  for (let regionIdx = 0; regionIdx < REGIONS.length; regionIdx++) {
    const region = REGIONS[regionIdx];
    const bitPos = 56 + regionIdx;
    const bit = bits[bitPos];

    const topTeam = sweet16Winners[regionIdx][0];
    const bottomTeam = sweet16Winners[regionIdx][1];
    if (!topTeam || !bottomTeam) throw new Error("Internal propagation error");

    const winner = bit === 0 ? topTeam : bottomTeam;
    elite8Winners[regionIdx][0] = winner;

    const game = {
      bit,
      round: 8,
      region,
      top_team: topTeam,
      bottom_team: bottomTeam,
      winner,
    };
    games.push(game);
    rounds.elite_8.push(game);
  }

  // 5) Final Four (2 games): bits 60..61
  // East/South winner vs West/Midwest winner order.
  const bit60 = bits[60];
  const eastWinner = elite8Winners[0][0];
  const westWinner = elite8Winners[2][0];
  if (!eastWinner || !westWinner) throw new Error("Internal propagation error");
  const winner60 = bit60 === 0 ? eastWinner : westWinner;

  const game60 = {
    bit: bit60,
    round: 4,
    region: null,
    top_team: eastWinner,
    bottom_team: westWinner,
    winner: winner60,
  };
  games.push(game60);
  rounds.final_four.push(game60);

  const bit61 = bits[61];
  const southWinner = elite8Winners[1][0];
  const midWinner = elite8Winners[3][0];
  if (!southWinner || !midWinner) throw new Error("Internal propagation error");
  const winner61 = bit61 === 0 ? southWinner : midWinner;

  const game61 = {
    bit: bit61,
    round: 4,
    region: null,
    top_team: southWinner,
    bottom_team: midWinner,
    winner: winner61,
  };
  games.push(game61);
  rounds.final_four.push(game61);

  // 6) Championship (1 game): bit 62
  const bit62 = bits[62]; // MSB
  const topTeam = winner60;
  const bottomTeam = winner61;
  if (!topTeam || !bottomTeam) throw new Error("Internal propagation error");
  const champion = bit62 === 0 ? topTeam : bottomTeam;

  const game62 = {
    bit: bit62,
    round: 2,
    region: null,
    top_team: topTeam,
    bottom_team: bottomTeam,
    winner: champion,
  };
  games.push(game62);
  rounds.championship.push(game62);

  return {
    id: n.toString(),
    bits,
    games,
    rounds,
    champion,
  };
}

