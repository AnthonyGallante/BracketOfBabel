from __future__ import annotations

from typing import Dict, List, Optional

from .constants import ROUND64_MATCHUPS, TOTAL_BITS
from .elo import elo_win_probability
from .bracket_decode import int_from_bracket
from .teams import REGIONS, get_team_by_region_and_seed


def most_likely_bracket(elo_ratings: Dict[str, float]) -> int:
    """
    Greedily simulate the tournament.

    At each game, pick the team with the higher Elo win probability.
    Returns the corresponding bracket integer.
    """

    bits_out = [0] * TOTAL_BITS

    # Propagated winners
    round64_winners: List[List[Optional[Dict[str, object]]]] = [
        [None] * 8 for _ in range(len(REGIONS))
    ]
    round32_winners: List[List[Optional[Dict[str, object]]]] = [
        [None] * 4 for _ in range(len(REGIONS))
    ]
    sweet16_winners: List[List[Optional[Dict[str, object]]]] = [
        [None] * 2 for _ in range(len(REGIONS))
    ]
    elite8_winners: List[List[Optional[Dict[str, object]]]] = [
        [None] for _ in range(len(REGIONS))
    ]

    # Round of 64 (bits 0..31)
    for region_idx, region in enumerate(REGIONS):
        for game64_idx, (top_seed, bottom_seed) in enumerate(ROUND64_MATCHUPS):
            bit_pos = region_idx * 8 + game64_idx
            top_team = get_team_by_region_and_seed(region, top_seed)
            bottom_team = get_team_by_region_and_seed(region, bottom_seed)

            top_elo = elo_ratings[top_team["slug"]]  # may raise KeyError (intended)
            bottom_elo = elo_ratings[bottom_team["slug"]]
            p_top = elo_win_probability(float(top_elo), float(bottom_elo))

            bit = 0 if p_top >= 0.5 else 1
            bits_out[bit_pos] = bit
            winner = top_team if bit == 0 else bottom_team
            round64_winners[region_idx][game64_idx] = winner

    # Round of 32 (bits 32..47)
    for region_idx, region in enumerate(REGIONS):
        for game32_idx in range(4):
            bit_pos = 32 + region_idx * 4 + game32_idx
            r64_top_idx = game32_idx * 2
            r64_bottom_idx = game32_idx * 2 + 1

            top_team = round64_winners[region_idx][r64_top_idx]
            bottom_team = round64_winners[region_idx][r64_bottom_idx]
            assert top_team is not None and bottom_team is not None

            top_elo = elo_ratings[top_team["slug"]]
            bottom_elo = elo_ratings[bottom_team["slug"]]
            p_top = elo_win_probability(float(top_elo), float(bottom_elo))

            bit = 0 if p_top >= 0.5 else 1
            bits_out[bit_pos] = bit
            winner = top_team if bit == 0 else bottom_team
            round32_winners[region_idx][game32_idx] = winner

    # Sweet 16 (bits 48..55)
    for region_idx, region in enumerate(REGIONS):
        for game16_idx in range(2):
            bit_pos = 48 + region_idx * 2 + game16_idx
            r32_top_idx = game16_idx * 2
            r32_bottom_idx = game16_idx * 2 + 1

            top_team = round32_winners[region_idx][r32_top_idx]
            bottom_team = round32_winners[region_idx][r32_bottom_idx]
            assert top_team is not None and bottom_team is not None

            top_elo = elo_ratings[top_team["slug"]]
            bottom_elo = elo_ratings[bottom_team["slug"]]
            p_top = elo_win_probability(float(top_elo), float(bottom_elo))

            bit = 0 if p_top >= 0.5 else 1
            bits_out[bit_pos] = bit
            winner = top_team if bit == 0 else bottom_team
            sweet16_winners[region_idx][game16_idx] = winner

    # Elite 8 (bits 56..59)
    for region_idx, region in enumerate(REGIONS):
        bit_pos = 56 + region_idx
        top_team = sweet16_winners[region_idx][0]
        bottom_team = sweet16_winners[region_idx][1]
        assert top_team is not None and bottom_team is not None

        top_elo = elo_ratings[top_team["slug"]]
        bottom_elo = elo_ratings[bottom_team["slug"]]
        p_top = elo_win_probability(float(top_elo), float(bottom_elo))

        bit = 0 if p_top >= 0.5 else 1
        bits_out[bit_pos] = bit
        winner = top_team if bit == 0 else bottom_team
        elite8_winners[region_idx][0] = winner

    # Final Four (bits 60..61)
    east_winner = elite8_winners[0][0]
    west_winner = elite8_winners[2][0]
    assert east_winner is not None and west_winner is not None
    p_top = elo_win_probability(
        float(elo_ratings[east_winner["slug"]]),
        float(elo_ratings[west_winner["slug"]]),
    )
    bits_out[60] = 0 if p_top >= 0.5 else 1
    winner60 = east_winner if bits_out[60] == 0 else west_winner

    south_winner = elite8_winners[1][0]
    mid_winner = elite8_winners[3][0]
    assert south_winner is not None and mid_winner is not None
    p_top = elo_win_probability(
        float(elo_ratings[south_winner["slug"]]),
        float(elo_ratings[mid_winner["slug"]]),
    )
    bits_out[61] = 0 if p_top >= 0.5 else 1
    winner61 = south_winner if bits_out[61] == 0 else mid_winner

    # Championship (bit 62)
    p_top = elo_win_probability(
        float(elo_ratings[winner60["slug"]]),
        float(elo_ratings[winner61["slug"]]),
    )
    bits_out[62] = 0 if p_top >= 0.5 else 1

    return int_from_bracket(bits_out)

