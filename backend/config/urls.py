"""
URL configuration for the Marriage Lawn backend.

Public API routes are under /api/v1/.
Django admin is served at /private-admin/ (obscured from default /admin/).
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        "status": "online",
        "service": "Marriage Lawn API",
        "admin": "/private-admin/",
        "api_v1": "/api/v1/",
        "endpoints": [
            "/api/v1/site/",
            "/api/v1/halls/",
            "/api/v1/facilities/",
            "/api/v1/packages/",
            "/api/v1/reviews/",
            "/api/v1/faqs/",
            "/api/v1/gallery/",
            "/api/v1/videos/",
            "/api/v1/availability/?start=2026-10-01&end=2026-10-31",
            "/api/v1/enquiries/",
        ],
    })

urlpatterns = [
    path("", api_root_view, name="api-root-index"),

    # Admin – non-default path for security
    path("private-admin/", admin.site.urls),

    # Public REST API v1
    path("api/v1/", include("config.api_urls")),
]

# Serve media files in development (Cloudinary handles it in production)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=getattr(settings, "MEDIA_ROOT", ""))
