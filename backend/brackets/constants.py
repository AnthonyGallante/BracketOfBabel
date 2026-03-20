from __future__ import annotations

from typing import List, Tuple

TOTAL_BITS = 63
MAX_BRACKET_INT_EXCLUSIVE = 2**63  # bracket ids are in [0, 2^63)

# Round of 64 matchups within each region. Tuple order defines "top" vs "bottom".
# (top_seed, bottom_seed)
ROUND64_MATCHUPS: List[Tuple[int, int]] = [
    (1, 16),
    (8, 9),
    (5, 12),
    (4, 13),
    (6, 11),
    (3, 14),
    (7, 10),
    (2, 15),
]

