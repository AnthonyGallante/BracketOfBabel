from __future__ import annotations

from django.urls import path

from . import views

urlpatterns = [
    path("bracket/<str:id>/", views.get_bracket_by_id, name="get-bracket-by-id"),
    path("brackets/", views.get_brackets_page, name="get-brackets-page"),
    path(
        "bracket/<str:id>/probability/",
        views.get_bracket_probability,
        name="get-bracket-probability",
    ),
]

