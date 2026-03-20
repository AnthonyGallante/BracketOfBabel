"""
Team roster constants for the bracket engine.

This file intentionally contains only static data and light helpers, so the
core bracket logic stays focused and easy to test.
"""

from __future__ import annotations

from typing import Dict, Tuple

REGIONS = ["East", "South", "West", "Midwest"]

# (seed, region, name, slug)
TEAMS = [
    (1, "East", "Duke", "duke"),
    (16, "East", "Siena", "siena"),
    (8, "East", "Ohio State", "ohio-state"),
    (9, "East", "TCU", "texas-christian"),
    (5, "East", "St. John's (NY)", "st-johns-ny"),
    (12, "East", "Northern Iowa", "northern-iowa"),
    (4, "East", "Kansas", "kansas"),
    (13, "East", "California Baptist", "california-baptist"),
    (6, "East", "Louisville", "louisville"),
    (11, "East", "South Florida", "south-florida"),
    (3, "East", "Michigan State", "michigan-state"),
    (14, "East", "North Dakota State", "north-dakota-state"),
    (7, "East", "UCLA", "ucla"),
    (10, "East", "UCF", "central-florida"),
    (2, "East", "Connecticut", "connecticut"),
    (15, "East", "Furman", "furman"),
    (1, "South", "Florida", "florida"),
    (16, "South", "Prairie View", "prairie-view"),
    (8, "South", "Clemson", "clemson"),
    (9, "South", "Iowa", "iowa"),
    (5, "South", "Vanderbilt", "vanderbilt"),
    (12, "South", "McNeese State", "mcneese-state"),
    (4, "South", "Nebraska", "nebraska"),
    (13, "South", "Troy", "troy"),
    (6, "South", "North Carolina", "north-carolina"),
    (11, "South", "Virginia Commonwealth", "virginia-commonwealth"),
    (3, "South", "Illinois", "illinois"),
    (14, "South", "Pennsylvania", "pennsylvania"),
    (7, "South", "Saint Mary's (CA)", "saint-marys-ca"),
    (10, "South", "Texas A&M", "texas-am"),
    (2, "South", "Houston", "houston"),
    (15, "South", "Idaho", "idaho"),
    (1, "West", "Arizona", "arizona"),
    (16, "West", "Long Island University", "long-island-university"),
    (8, "West", "Villanova", "villanova"),
    (9, "West", "Utah State", "utah-state"),
    (5, "West", "Wisconsin", "wisconsin"),
    (12, "West", "High Point", "high-point"),
    (4, "West", "Arkansas", "arkansas"),
    (13, "West", "Hawaii", "hawaii"),
    (6, "West", "Brigham Young", "brigham-young"),
    (11, "West", "Texas", "texas"),
    (3, "West", "Gonzaga", "gonzaga"),
    (14, "West", "Kennesaw State", "kennesaw-state"),
    (7, "West", "Miami (FL)", "miami-fl"),
    (10, "West", "Missouri", "missouri"),
    (2, "West", "Purdue", "purdue"),
    (15, "West", "Queens (NC)", "queens-nc"),
    (1, "Midwest", "Michigan", "michigan"),
    (16, "Midwest", "Howard", "howard"),
    (8, "Midwest", "Georgia", "georgia"),
    (9, "Midwest", "Saint Louis", "saint-louis"),
    (5, "Midwest", "Texas Tech", "texas-tech"),
    (12, "Midwest", "Akron", "akron"),
    (4, "Midwest", "Alabama", "alabama"),
    (13, "Midwest", "Hofstra", "hofstra"),
    (6, "Midwest", "Tennessee", "tennessee"),
    (11, "Midwest", "Miami (OH)", "miami-oh"),
    (3, "Midwest", "Virginia", "virginia"),
    (14, "Midwest", "Wright State", "wright-state"),
    (7, "Midwest", "Kentucky", "kentucky"),
    (10, "Midwest", "Santa Clara", "santa-clara"),
    (2, "Midwest", "Iowa State", "iowa-state"),
    (15, "Midwest", "Tennessee State", "tennessee-state"),
]


def _team_dict(seed: int, region: str, name: str, slug: str) -> Dict[str, object]:
    # The engine returns JSON-friendly objects; keep the schema stable.
    return {
        "seed": seed,
        "region": region,
        "name": name,
        "slug": slug,
    }


TEAM_BY_SLUG: Dict[str, Dict[str, object]] = {}
TEAM_BY_REGION_AND_SEED: Dict[Tuple[str, int], Dict[str, object]] = {}

for _seed, _region, _name, _slug in TEAMS:
    team = _team_dict(_seed, _region, _name, _slug)
    TEAM_BY_SLUG[_slug] = team
    TEAM_BY_REGION_AND_SEED[(_region, _seed)] = team


def get_team_by_slug(slug: str) -> Dict[str, object]:
    return TEAM_BY_SLUG[slug]


def get_team_by_region_and_seed(region: str, seed: int) -> Dict[str, object]:
    return TEAM_BY_REGION_AND_SEED[(region, seed)]

