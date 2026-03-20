from __future__ import annotations

from typing import Any, Dict, List

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.http import require_GET

from .bracket_engine import (
    MAX_BRACKET_INT_EXCLUSIVE,
    bracket_from_int,
    bracket_log_probability,
    bracket_probability,
)
from .elo import elo_win_probability, get_elo_ratings


BRACKETS_PER_PAGE = 200


def _parse_bracket_id(id_str: str) -> int:
    """
    Parses a bracket id from the URL, which is a string to avoid JS precision loss.
    """

    try:
        n = int(id_str)
    except ValueError as exc:
        raise ValueError("id must be an integer string") from exc

    if n < 0 or n >= MAX_BRACKET_INT_EXCLUSIVE:
        raise ValueError("id must be in range [0, 2^63)")

    return n


def _bits_preview_from_bits(bits: List[int]) -> str:
    # LSB-first, matching `bit i == ((n >> i) & 1)`.
    return "".join("1" if b == 1 else "0" for b in bits)


def _error_response(message: str, status: int) -> JsonResponse:
    return JsonResponse({"error": message}, status=status)


@require_GET
def get_bracket_by_id(request: HttpRequest, id: str) -> HttpResponse:
    try:
        n = _parse_bracket_id(id)
    except ValueError as e:
        return _error_response(str(e), 400)

    bracket = bracket_from_int(n)
    # Ensure id is string (defensive; bracket_from_int already does this).
    bracket["id"] = str(n)

    # Attach per-game Elo win probabilities for hover tooltips.
    # Schema:
    #  - top_win_probability: P(top_team beats bottom_team)
    #  - bottom_win_probability: 1 - top_win_probability
    elo_ratings = get_elo_ratings()
    for game in bracket["games"]:
        top_slug = game["top_team"]["slug"]
        bottom_slug = game["bottom_team"]["slug"]
        top_elo = float(elo_ratings[top_slug])
        bottom_elo = float(elo_ratings[bottom_slug])
        p_top = elo_win_probability(top_elo, bottom_elo)
        game["top_win_probability"] = p_top
        game["bottom_win_probability"] = 1.0 - p_top

    return JsonResponse(bracket, safe=False)


@require_GET
def get_brackets_page(request: HttpRequest) -> HttpResponse:
    page_str = request.GET.get("page", "0")
    try:
        page = int(page_str)
    except ValueError:
        return _error_response("page must be an integer", 400)
    if page < 0:
        return _error_response("page must be >= 0", 400)

    start = page * BRACKETS_PER_PAGE
    # If the requested page is beyond the range, return empty list.
    if start >= MAX_BRACKET_INT_EXCLUSIVE:
        return JsonResponse([], safe=False)

    end_exclusive = min(start + BRACKETS_PER_PAGE, MAX_BRACKET_INT_EXCLUSIVE)

    stubs: List[Dict[str, Any]] = []
    # NOTE: For now we prioritize correctness over micro-optimizations.
    # Each stub uses the authoritative `bracket_from_int` engine.
    for n in range(start, end_exclusive):
        bracket = bracket_from_int(n)
        stubs.append(
            {
                "id": str(n),
                "champion": bracket["champion"],
                "bits_preview": _bits_preview_from_bits(bracket["bits"]),
            }
        )

    return JsonResponse(stubs, safe=False)


@require_GET
def get_bracket_probability(request: HttpRequest, id: str) -> HttpResponse:
    try:
        n = _parse_bracket_id(id)
    except ValueError as e:
        return _error_response(str(e), 400)

    elo_ratings = get_elo_ratings()
    log_p = bracket_log_probability(n, elo_ratings)
    p = bracket_probability(n, elo_ratings)

    return JsonResponse(
        {"probability": p, "log_probability": log_p},
        safe=False,
    )

