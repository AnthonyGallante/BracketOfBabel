from __future__ import annotations

from django.contrib import admin
from django.urls import include, path, re_path

from config.spa_views import serve_frontend_asset, serve_spa_index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("brackets.urls")),
]

# Vite production bundle: hashed assets + SPA fallback (refresh/direct URL works).
# Run `npm run build` in `frontend/` first; see docs/SERVING.md.
urlpatterns += [
    re_path(r"^assets/(?P<path>.*)$", serve_frontend_asset),
    re_path(r"^.*$", serve_spa_index),
]

