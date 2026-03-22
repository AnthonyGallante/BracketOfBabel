// bracketProbability.js
//
// Mirrors `backend/brackets/bracket_engine.py`:
// - bracket_log_probability(n, elo_ratings)
// - bracket_probability(n, elo_ratings)

import { eloWinProbability } from "./elo.js";
import { bracketFromInt } from "./bracketDecode.js";
import { getSelectedTournament } from "./tournamentState.js";

export function bracketLogProbability(n, eloRatings) {
  // Product over all 63 games, represented as sum of logs to avoid underflow.
  const bracket = bracketFromInt(n, getSelectedTournament());
  const bits = bracket.bits;
  let logProb = 0.0;

  const eps = 1e-300; // numerical safety

  for (let gameIdx = 0; gameIdx < bracket.games.length; gameIdx++) {
    const game = bracket.games[gameIdx];
    const topSlug = game.top_team.slug;
    const bottomSlug = game.bottom_team.slug;

    const topElo = eloRatings[topSlug];
    const bottomElo = eloRatings[bottomSlug];
    if (topElo === undefined || bottomElo === undefined) {
      throw new Error("Missing elo rating for one of the teams");
    }

    const pTopRaw = eloWinProbability(topElo, bottomElo);
    const pTop = Math.min(Math.max(pTopRaw, eps), 1.0 - eps);

    const bit = bits[gameIdx];
    const probGame = bit === 0 ? pTop : 1.0 - pTop;
    const probClamped = Math.min(Math.max(probGame, eps), 1.0 - eps);
    logProb += Math.log(probClamped);
  }

  return logProb;
}

export function bracketProbability(n, eloRatings) {
  // WARNING: may underflow to 0 for unlikely brackets.
  const logP = bracketLogProbability(n, eloRatings);
  return Math.exp(logP);
}

