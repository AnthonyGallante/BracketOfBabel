// mostLikely.js
//
// Mirror of `backend/brackets/bracket_engine.py` most_likely_bracket():
// greedy Elo win-probability choice for every game.

import { REGIONS, getTeamByRegionAndSeed } from "./teams.js";
import { TOTAL_BITS } from "./constants.js";
import { eloWinProbability } from "./elo.js";
import { intFromBracket } from "./bracketDecode.js";

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

export function mostLikelyBracket(eloRatings) {
  // Greedy simulation: pick the higher Elo win-probability team each game.
  const bitsOut = new Array(TOTAL_BITS).fill(0);

  const round64Winners = REGIONS.map(() => new Array(8).fill(null));
  const round32Winners = REGIONS.map(() => new Array(4).fill(null));
  const sweet16Winners = REGIONS.map(() => new Array(2).fill(null));
  const elite8Winners = REGIONS.map(() => new Array(1).fill(null));

  // Round of 64 (bits 0..31)
  for (let regionIdx = 0; regionIdx < REGIONS.length; regionIdx++) {
    const region = REGIONS[regionIdx];
    for (let game64Idx = 0; game64Idx < ROUND64_MATCHUPS.length; game64Idx++) {
      const bitPos = regionIdx * 8 + game64Idx;
      const [topSeed, bottomSeed] = ROUND64_MATCHUPS[game64Idx];

      const topTeam = getTeamByRegionAndSeed(region, topSeed);
      const bottomTeam = getTeamByRegionAndSeed(region, bottomSeed);
      if (!topTeam || !bottomTeam) throw new Error("Missing team roster entry");

      const topElo = eloRatings[topTeam.slug];
      const bottomElo = eloRatings[bottomTeam.slug];
      if (topElo === undefined || bottomElo === undefined) {
        throw new Error("Missing elo rating for one of the teams");
      }

      const pTop = eloWinProbability(topElo, bottomElo);
      const bit = pTop >= 0.5 ? 0 : 1;
      bitsOut[bitPos] = bit;

      const winner = bit === 0 ? topTeam : bottomTeam;
      round64Winners[regionIdx][game64Idx] = winner;
    }
  }

  // Round of 32 (bits 32..47)
  for (let regionIdx = 0; regionIdx < REGIONS.length; regionIdx++) {
    for (let game32Idx = 0; game32Idx < 4; game32Idx++) {
      const bitPos = 32 + regionIdx * 4 + game32Idx;
      const r64TopIdx = game32Idx * 2;
      const r64BottomIdx = game32Idx * 2 + 1;

      const topTeam = round64Winners[regionIdx][r64TopIdx];
      const bottomTeam = round64Winners[regionIdx][r64BottomIdx];
      if (!topTeam || !bottomTeam) throw new Error("Internal propagation error");

      const topElo = eloRatings[topTeam.slug];
      const bottomElo = eloRatings[bottomTeam.slug];
      if (topElo === undefined || bottomElo === undefined) {
        throw new Error("Missing elo rating for one of the teams");
      }

      const pTop = eloWinProbability(topElo, bottomElo);
      const bit = pTop >= 0.5 ? 0 : 1;
      bitsOut[bitPos] = bit;

      const winner = bit === 0 ? topTeam : bottomTeam;
      round32Winners[regionIdx][game32Idx] = winner;
    }
  }

  // Sweet 16 (bits 48..55)
  for (let regionIdx = 0; regionIdx < REGIONS.length; regionIdx++) {
    for (let game16Idx = 0; game16Idx < 2; game16Idx++) {
      const bitPos = 48 + regionIdx * 2 + game16Idx;
      const r32TopIdx = game16Idx * 2;
      const r32BottomIdx = game16Idx * 2 + 1;

      const topTeam = round32Winners[regionIdx][r32TopIdx];
      const bottomTeam = round32Winners[regionIdx][r32BottomIdx];
      if (!topTeam || !bottomTeam) throw new Error("Internal propagation error");

      const topElo = eloRatings[topTeam.slug];
      const bottomElo = eloRatings[bottomTeam.slug];
      if (topElo === undefined || bottomElo === undefined) {
        throw new Error("Missing elo rating for one of the teams");
      }

      const pTop = eloWinProbability(topElo, bottomElo);
      const bit = pTop >= 0.5 ? 0 : 1;
      bitsOut[bitPos] = bit;

      const winner = bit === 0 ? topTeam : bottomTeam;
      sweet16Winners[regionIdx][game16Idx] = winner;
    }
  }

  // Elite 8 (bits 56..59)
  for (let regionIdx = 0; regionIdx < REGIONS.length; regionIdx++) {
    const bitPos = 56 + regionIdx;
    const topTeam = sweet16Winners[regionIdx][0];
    const bottomTeam = sweet16Winners[regionIdx][1];
    if (!topTeam || !bottomTeam) throw new Error("Internal propagation error");

    const topElo = eloRatings[topTeam.slug];
    const bottomElo = eloRatings[bottomTeam.slug];
    if (topElo === undefined || bottomElo === undefined) {
      throw new Error("Missing elo rating for one of the teams");
    }

    const pTop = eloWinProbability(topElo, bottomElo);
    const bit = pTop >= 0.5 ? 0 : 1;
    bitsOut[bitPos] = bit;

    const winner = bit === 0 ? topTeam : bottomTeam;
    elite8Winners[regionIdx][0] = winner;
  }

  // Final Four (bits 60..61): East vs West, South vs Midwest.
  const eastWinner = elite8Winners[0][0];
  const westWinner = elite8Winners[2][0];
  if (!eastWinner || !westWinner) throw new Error("Internal propagation error");
  const p60 = eloWinProbability(eastElo(eloRatings, eastWinner), eastElo(eloRatings, westWinner));
  bitsOut[60] = p60 >= 0.5 ? 0 : 1;
  const winner60 = bitsOut[60] === 0 ? eastWinner : westWinner;

  const southWinner = elite8Winners[1][0];
  const midWinner = elite8Winners[3][0];
  if (!southWinner || !midWinner) throw new Error("Internal propagation error");
  const p61 = eloWinProbability(
    eastElo(eloRatings, southWinner),
    eastElo(eloRatings, midWinner),
  );
  bitsOut[61] = p61 >= 0.5 ? 0 : 1;
  const winner61 = bitsOut[61] === 0 ? southWinner : midWinner;

  // Championship (bit 62)
  bitsOut[62] = eloWinProbability(
    eastElo(eloRatings, winner60),
    eastElo(eloRatings, winner61),
  ) >= 0.5
    ? 0
    : 1;

  return intFromBracket(bitsOut);
}

function eastElo(eloRatings, team) {
  const v = eloRatings[team.slug];
  if (v === undefined) throw new Error("Missing elo rating for one of the teams");
  return v;
}

