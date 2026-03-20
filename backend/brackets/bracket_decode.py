from __future__ import annotations

from typing import Any, Dict, List, Optional

from .constants import MAX_BRACKET_INT_EXCLUSIVE, ROUND64_MATCHUPS, TOTAL_BITS
from .teams import REGIONS, get_team_by_region_and_seed


def _validate_bracket_int(n: int) -> None:
    if not isinstance(n, int):
        raise TypeError("n must be an int")
    if n < 0 or n >= MAX_BRACKET_INT_EXCLUSIVE:
        raise ValueError("n must be on the range [0, 2**63)")


def _bits_from_int(n: int) -> List[int]:
    # Bit i is the LSB of (n >> i). We store as an indexable list for clarity.
    return [(n >> i) & 1 for i in range(TOTAL_BITS)]


def _make_game(
    *,
    bit: int,
    round_size: int,
    region: Optional[str],
    top_team: Dict[str, object],
    bottom_team: Dict[str, object],
    winner: Dict[str, object],
) -> Dict[str, Any]:
    return {
        "bit": int(bit),
        "round": int(round_size),
        "region": region,
        "top_team": top_team,
        "bottom_team": bottom_team,
        "winner": winner,
    }


def bracket_from_int(n: int) -> Dict[str, Any]:
    """
    Given a bracket integer n in [0, 2^63), return a structured bracket.

    Returns a JSON-friendly dict with:
      - 'bits': list[int] of length 63 (bit i corresponds to game i in spec order)
      - 'games': list of 63 game dicts
      - 'rounds': dict keyed by round name with lists of game dicts
      - 'champion': team dict
    """

    _validate_bracket_int(n)
    bits = _bits_from_int(n)

    # Winners are propagated forward within each region.
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

    games: List[Dict[str, Any]] = []
    rounds: Dict[str, List[Dict[str, Any]]] = {
        "round_of_64": [],
        "round_of_32": [],
        "sweet_16": [],
        "elite_8": [],
        "final_four": [],
        "championship": [],
    }

    # 1) Round of 64 (32 games): bits 0..31
    # Order: regions East -> South -> West -> Midwest; within each region:
    # (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
    for region_idx, region in enumerate(REGIONS):
        for game64_idx, (top_seed, bottom_seed) in enumerate(ROUND64_MATCHUPS):
            bit_pos = region_idx * 8 + game64_idx
            top_team = get_team_by_region_and_seed(region, top_seed)
            bottom_team = get_team_by_region_and_seed(region, bottom_seed)
            bit = bits[bit_pos]
            winner = top_team if bit == 0 else bottom_team
            round64_winners[region_idx][game64_idx] = winner

            game = _make_game(
                bit=bit,
                round_size=64,
                region=region,
                top_team=top_team,
                bottom_team=bottom_team,
                winner=winner,
            )
            games.append(game)
            rounds["round_of_64"].append(game)

    # 2) Round of 32 (16 games): bits 32..47
    for region_idx, region in enumerate(REGIONS):
        for game32_idx in range(4):
            bit_pos = 32 + region_idx * 4 + game32_idx
            # game32_idx=0 pairs R64 games 0 and 1
            r64_top_idx = game32_idx * 2
            r64_bottom_idx = game32_idx * 2 + 1

            top_team = round64_winners[region_idx][r64_top_idx]
            bottom_team = round64_winners[region_idx][r64_bottom_idx]
            assert top_team is not None and bottom_team is not None

            bit = bits[bit_pos]
            winner = top_team if bit == 0 else bottom_team
            round32_winners[region_idx][game32_idx] = winner

            game = _make_game(
                bit=bit,
                round_size=32,
                region=region,
                top_team=top_team,
                bottom_team=bottom_team,
                winner=winner,
            )
            games.append(game)
            rounds["round_of_32"].append(game)

    # 3) Sweet 16 (8 games): bits 48..55
    for region_idx, region in enumerate(REGIONS):
        for game16_idx in range(2):
            bit_pos = 48 + region_idx * 2 + game16_idx
            r32_top_idx = game16_idx * 2
            r32_bottom_idx = game16_idx * 2 + 1

            top_team = round32_winners[region_idx][r32_top_idx]
            bottom_team = round32_winners[region_idx][r32_bottom_idx]
            assert top_team is not None and bottom_team is not None

            bit = bits[bit_pos]
            winner = top_team if bit == 0 else bottom_team
            sweet16_winners[region_idx][game16_idx] = winner

            game = _make_game(
                bit=bit,
                round_size=16,
                region=region,
                top_team=top_team,
                bottom_team=bottom_team,
                winner=winner,
            )
            games.append(game)
            rounds["sweet_16"].append(game)

    # 4) Elite 8 (4 games): bits 56..59
    for region_idx, region in enumerate(REGIONS):
        bit_pos = 56 + region_idx
        top_team = sweet16_winners[region_idx][0]
        bottom_team = sweet16_winners[region_idx][1]
        assert top_team is not None and bottom_team is not None

        bit = bits[bit_pos]
        winner = top_team if bit == 0 else bottom_team
        elite8_winners[region_idx][0] = winner

        game = _make_game(
            bit=bit,
            round_size=8,
            region=region,
            top_team=top_team,
            bottom_team=bottom_team,
            winner=winner,
        )
        games.append(game)
        rounds["elite_8"].append(game)

    # 5) Final Four (2 games): bits 60..61
    bit60 = bits[60]
    east_winner = elite8_winners[0][0]
    west_winner = elite8_winners[2][0]
    assert east_winner is not None and west_winner is not None
    winner60 = east_winner if bit60 == 0 else west_winner
    game60 = _make_game(
        bit=bit60,
        round_size=4,
        region=None,
        top_team=east_winner,
        bottom_team=west_winner,
        winner=winner60,
    )
    games.append(game60)
    rounds["final_four"].append(game60)

    bit61 = bits[61]
    south_winner = elite8_winners[1][0]
    mid_winner = elite8_winners[3][0]
    assert south_winner is not None and mid_winner is not None
    winner61 = south_winner if bit61 == 0 else mid_winner
    game61 = _make_game(
        bit=bit61,
        round_size=4,
        region=None,
        top_team=south_winner,
        bottom_team=mid_winner,
        winner=winner61,
    )
    games.append(game61)
    rounds["final_four"].append(game61)

    # 6) Championship (1 game): bit 62
    bit62 = bits[62]
    top_team = winner60
    bottom_team = winner61
    champion = top_team if bit62 == 0 else bottom_team
    game62 = _make_game(
        bit=bit62,
        round_size=2,
        region=None,
        top_team=top_team,
        bottom_team=bottom_team,
        winner=champion,
    )
    games.append(game62)
    rounds["championship"].append(game62)

    return {
        "id": str(n),
        "bits": bits,
        "games": games,
        "rounds": rounds,
        "champion": champion,
    }


def int_from_bracket(bits: List[int]) -> int:
    """
    Inverse of `bracket_from_int` bit extraction.

    `bits` is the list of 63 bits, where bit i is the decision for game i
    in the spec order (bit 0 is East 1v16, ...).
    """

    if len(bits) != TOTAL_BITS:
        raise ValueError(f"games must have length {TOTAL_BITS}")

    result = 0
    for i, bit in enumerate(bits):
        if bit not in (0, 1):
            raise ValueError("all bits must be 0 or 1")
        result |= (int(bit) << i)
    return result

