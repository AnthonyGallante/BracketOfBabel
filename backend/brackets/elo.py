"""
Elo ratings and win probability helpers.

This module is a "data + math" layer:
- loads the team's Elo ratings from `data/ELO_Ratings.csv`
- provides `elo_win_probability()` for game-level probabilities
"""

from __future__ import annotations

import csv
import math
from functools import lru_cache
from pathlib import Path
from typing import Dict

from .teams import TEAMS


def elo_win_probability(elo_a: float, elo_b: float) -> float:
    """
    Probability that team A beats team B.

    Uses the spec formula:
      P(A beats B) = 1 / (1 + 10^((elo_B - elo_A) / 400))
    """

    exponent = (elo_b - elo_a) / 400.0
    return 1.0 / (1.0 + math.pow(10.0, exponent))


@lru_cache(maxsize=1)
def get_elo_ratings() -> Dict[str, float]:
    """
    Returns:
      dict keyed by team slug -> Elo rating
    """

    repo_root = Path(__file__).resolve().parents[2]
    csv_path = repo_root / "data" / "ELO_Ratings.csv"

    # Build a lookup of the expected tournament teams.
    # We match on the roster "name" field (not the slug) because the CSV's
    # "School" column contains the human-readable team name.
    roster_by_name: Dict[str, str] = {team_name: slug for _, __, team_name, slug in TEAMS}

    name_to_elo: Dict[str, float] = {}
    with csv_path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames or "School" not in reader.fieldnames or "ELO" not in reader.fieldnames:
            raise ValueError("Unexpected ELO_Ratings.csv header (expected School and ELO columns)")

        for row in reader:
            school_name = (row.get("School") or "").strip()
            elo_str = (row.get("ELO") or "").strip()
            if not school_name or not elo_str:
                continue
            try:
                name_to_elo[school_name] = float(elo_str)
            except ValueError:
                # Skip rows with non-numeric ELO values.
                continue

    missing_names = [name for name in roster_by_name.keys() if name not in name_to_elo]
    if missing_names:
        raise ValueError(
            "Missing Elo ratings for the following roster team names: "
            + ", ".join(missing_names)
        )

    return {roster_by_name[name]: name_to_elo[name] for name in roster_by_name.keys()}

