"""
Django settings for the Marriage Lawn backend.

Environment variables are loaded from `.env` (development) or the host
environment (production / Render / Railway).  Never commit a real .env file.
"""

from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env in local development (ignored in production where vars are injected)
load_dotenv(BASE_DIR / ".env")

# ─── Core ─────────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

ALLOWED_HOSTS: list[str] = [
    h.strip() for h in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()
]
if DEBUG and "testserver" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append("testserver")

# ─── Installed apps ───────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # Jazzmin must come before django.contrib.admin
    "jazzmin",

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",
    "cloudinary",
    "cloudinary_storage",

    # Local apps
    "apps.venue",
    "apps.media",
    "apps.bookings",
    "apps.notifications",
]

# ─── Middleware ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",          # must be before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL",
        default="sqlite:///db.sqlite3",   # fallback for quickstart without Postgres
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# ─── Auth ─────────────────────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# ─── Static files ─────────────────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ─── Media / Cloudinary ───────────────────────────────────────────────────────
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    "API_KEY":    os.getenv("CLOUDINARY_API_KEY", ""),
    "API_SECRET": os.getenv("CLOUDINARY_API_SECRET", ""),
}

# Use Cloudinary for media when credentials are set, else local storage (dev)
if all(CLOUDINARY_STORAGE[k] for k in ("CLOUD_NAME", "API_KEY", "API_SECRET")):
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
else:
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"

# ─── Django REST Framework ────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        # Custom scopes (applied per view)
        "enquiry": "5/hour",
    },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 24,
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS: list[str] = [
    o.strip()
    for o in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
CORS_ALLOW_CREDENTIALS = True

# ─── Email ────────────────────────────────────────────────────────────────────
if DEBUG:
    # Print emails to console in development – no external service needed
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = os.getenv(
        "EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"
    )
    EMAIL_HOST          = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT          = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_USE_TLS       = os.getenv("EMAIL_USE_TLS", "True").lower() in ("true", "1")
    EMAIL_HOST_USER     = os.getenv("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")

DEFAULT_FROM_EMAIL = os.getenv("EMAIL_HOST_USER", "no-reply@example.com")
OWNER_NOTIFY_EMAIL = os.getenv("OWNER_NOTIFY_EMAIL", "")

# ─── reCAPTCHA (optional) ─────────────────────────────────────────────────────
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET", "")

# ─── Security (production hardening) ─────────────────────────────────────────
if not DEBUG:
    SECURE_HSTS_SECONDS = 31_536_000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# ─── Default primary-key type ─────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── Jazzmin admin theme ─────────────────────────────────────────────────────
JAZZMIN_SETTINGS = {
    "site_title": "Shree Palace Admin",
    "site_header": "Marriage Lawn",
    "site_brand": "Marriage Lawn",
    "welcome_sign": "Welcome to the Marriage Lawn Admin",
    "copyright": "Arush Vishwakarma",
    "search_model": ["bookings.Enquiry"],
    "topmenu_links": [
        {"name": "View Site", "url": "/api/v1/site/", "new_window": True},
    ],
    "show_sidebar": True,
    "navigation_expanded": True,
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "venue.SiteSettings": "fas fa-cog",
        "venue.Hall": "fas fa-building",
        "venue.Facility": "fas fa-check-circle",
        "venue.Package": "fas fa-box-open",
        "venue.Review": "fas fa-star",
        "venue.FAQ": "fas fa-question-circle",
        "media.GalleryImage": "fas fa-images",
        "media.VideoLink": "fas fa-video",
        "bookings.AvailabilityDate": "fas fa-calendar-alt",
        "bookings.Enquiry": "fas fa-envelope",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    "related_modal_active": False,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
}
