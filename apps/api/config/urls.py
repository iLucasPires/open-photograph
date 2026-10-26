from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from config.frontend import frontend
from config.health import health

urlpatterns = [
    path("api/health/", health, name="health"),
    # -------------------------------------------------------------------------
    # Admin
    # -------------------------------------------------------------------------
    path("api/admin/", admin.site.urls),
    # -------------------------------------------------------------------------
    # Allauth
    # -------------------------------------------------------------------------
    path("api/allauth/", include("allauth.urls")),
    # -------------------------------------------------------------------------
    # Payment provider callbacks
    # -------------------------------------------------------------------------
    path("api/payments/", include("payments.urls")),
    # -------------------------------------------------------------------------
    # Doc
    # -------------------------------------------------------------------------
    path("api/schema", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs", SpectacularSwaggerView.as_view(), name="docs"),
    path("api/redoc", SpectacularRedocView.as_view(), name="redoc"),
    # -------------------------------------------------------------------------
    # API
    # -------------------------------------------------------------------------
    path(
        route="api/",
        view=include(
            [
                # -------------------------------------------------------------
                # Allauth
                # -------------------------------------------------------------
                path("", include("allauth.headless.urls"), name="allauth"),
                # -------------------------------------------------------------
                # App Domains
                # -------------------------------------------------------------
                path("", include("app.domains.gallery.urls")),
                path("", include("app.domains.client.urls")),
                path("", include("app.domains.setup.urls")),
                path("", include("app.domains.commerce.urls")),
                path("", include("app.domains.photographer.urls")),
                # -------------------------------------------------------------
                # Apps Integrations
                # -------------------------------------------------------------
                path("", include("app.integrations.drive.urls")),
                # -------------------------------------------------------------
                # Apps Streaming
                # -------------------------------------------------------------
                path("", include("app.common.streaming.urls"), name="streaming"),
            ]
        ),
    ),
]

if settings.SYSTEM_STORAGE_PROVIDER == "local":
    urlpatterns += [
        re_path(r"^api/media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
    ]

urlpatterns += [re_path(r"^(?!api(?:/|$)|assets(?:/|$)).*$", frontend, name="frontend")]
