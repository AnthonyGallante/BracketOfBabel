"""
Public bracket engine API.

Implementation is split into smaller modules for maintainability; this file
re-exports the stable functions used by the Django API and unit tests.
"""

from __future__ import annotations

from .constants import MAX_BRACKET_INT_EXCLUSIVE
from .bracket_decode import bracket_from_int, int_from_bracket
from .bracket_probability import bracket_log_probability, bracket_probability
from .bracket_simulation import most_likely_bracket

__all__ = [
    "MAX_BRACKET_INT_EXCLUSIVE",
    "bracket_from_int",
    "int_from_bracket",
    "most_likely_bracket",
    "bracket_log_probability",
    "bracket_probability",
]

