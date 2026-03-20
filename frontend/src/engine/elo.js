// Elo-based win probability helpers.

export function eloWinProbability(eloA, eloB) {
  // P(A beats B) = 1 / (1 + 10^((elo_B - elo_A) / 400))
  const exponent = (eloB - eloA) / 400.0;
  return 1.0 / (1.0 + Math.pow(10.0, exponent));
}

