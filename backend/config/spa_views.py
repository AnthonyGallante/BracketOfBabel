"""
Serve the production Vite bundle (`frontend/dist`) from Django.

- `/assets/*` → hashed JS/CSS from `dist/assets/`
- Any other GET path that is not `/api/` or `/admin/` → `index.html` (client-side routing)

Path traversal is rejected; works with DEBUG True or False (unlike django.views.static.serve).
"""

from __future__ import annotations

import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse


def _resolved_dist_root() -> Path:
    return Path(settings.FRONTEND_DIST_DIR).resolve()


def _safe_file_under(root: Path, *relative_parts: str) -> Path | None:
    """
    Resolve a file path strictly inside `root`.
    Returns None if the path escapes, is not a file, or does not exist.
    """
    try:
        root_resolved = root.resolve()
        candidate = (root_resolved.joinpath(*relative_parts)).resolve()
    except OSError:
        return None

    try:
        candidate.relative_to(root_resolved)
    except ValueError:
        return None

    if not candidate.is_file():
        return None
    return candidate


def serve_frontend_asset(request, path: str) -> FileResponse:
    """Serve a file from `frontend/dist/assets/` (Vite output)."""
    # Reject empty or suspicious paths early.
    if not path or path.endswith("/") or ".." in path.split("/"):
        raise Http404("Not found")

    root = _resolved_dist_root() / "assets"
    file_path = _safe_file_under(root, path)
    if file_path is None:
        raise Http404("Not found")

    content_type, _encoding = mimetypes.guess_type(str(file_path))
    if content_type is None:
        content_type = "application/octet-stream"

    response = FileResponse(file_path.open("rb"), content_type=content_type)
    # Long cache for fingerprinted assets (optional; safe for hashed filenames).
    response["Cache-Control"] = "public, max-age=31536000, immutable"
    return response


def serve_spa_index(request) -> HttpResponse:
    """
    Return the built `index.html` so React Router can handle `/bracket/:id`, etc.
    """
    index_path = _safe_file_under(_resolved_dist_root(), "index.html")
    if index_path is None:
        return HttpResponse(
            (
                "Frontend build not found.\n\n"
                "From the project root, run:\n"
                "  cd frontend\n"
                "  npm install\n"
                "  npm run build\n\n"
                f"Expected: {settings.FRONTEND_DIST_DIR / 'index.html'}\n"
            ),
            status=503,
            content_type="text/plain; charset=utf-8",
        )

    response = FileResponse(index_path.open("rb"), content_type="text/html; charset=utf-8")
    response["Cache-Control"] = "no-cache"
    return response
