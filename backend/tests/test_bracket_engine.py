import os
import random
import sys

# Ensure `import backend...` works when running pytest from the repo root.
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from backend.brackets.bracket_engine import (
    bracket_from_int,
    int_from_bracket,
)


def test_bracket_from_int_zero_all_top_teams_win() -> None:
    result = bracket_from_int(0)
    for game in result["games"]:
        assert game["bit"] == 0
        assert game["winner"]["slug"] == game["top_team"]["slug"]


def test_bracket_from_int_max_all_bottom_teams_win() -> None:
    n = 2**63 - 1
    result = bracket_from_int(n)
    for game in result["games"]:
        assert game["bit"] == 1
        assert game["winner"]["slug"] == game["bottom_team"]["slug"]


def test_int_from_bracket_inverts_bracket_from_int_for_random_values() -> None:
    rng = random.Random(1337)
    for _ in range(25):
        n = rng.randrange(0, 2**63)
        result = bracket_from_int(n)
        assert int_from_bracket(result["bits"]) == n

