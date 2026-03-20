from __future__ import annotations

import math
from typing import Dict

from .bracket_decode import bracket_from_int
from .elo import elo_win_probability


def bracket_log_probability(n: int, elo_ratings: Dict[str, float]) -> float:
    """
    Natural log of bracket probability (product over 63 games).

    This avoids massive underflow that would make probabilities become 0.0
    in float arithmetic.
    """

    bracket = bracket_from_int(n)
    bits = bracket["bits"]
    games = bracket["games"]

    # Prevent log(0) due to extreme floating point underflow.
    eps = 1e-300
    log_prob = 0.0

    for game_idx, game in enumerate(games):
        top_slug = game["top_team"]["slug"]
        bottom_slug = game["bottom_team"]["slug"]
        top_elo = float(elo_ratings[top_slug])
        bottom_elo = float(elo_ratings[bottom_slug])

        p_top = elo_win_probability(top_elo, bottom_elo)
        # Numerical safety: clamp to (eps, 1-eps)
        p_top = min(max(p_top, eps), 1.0 - eps)

        # bit=0 => top wins, bit=1 => bottom wins
        bit = bits[game_idx]
        prob_game = p_top if bit == 0 else (1.0 - p_top)
        prob_game = min(max(prob_game, eps), 1.0 - eps)
        log_prob += math.log(prob_game)

    return log_prob


def bracket_probability(n: int, elo_ratings: Dict[str, float]) -> float:
    """Bracket probability as a float (may underflow to 0.0)."""

    log_prob = bracket_log_probability(n, elo_ratings)
    return math.exp(log_prob)

