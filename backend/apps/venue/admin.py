"""Django admin configuration for the venue app."""

from django.contrib import admin
from django.utils.html import format_html

from .models import SiteSettings, Hall, Facility, Package, Review, FAQ


# ─── SiteSettings ─────────────────────────────────────────────────────────────

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    """Singleton admin — only one row allowed, so we hide the 'Add another' link."""

    fieldsets = [
        ("Identity", {
            "fields": ["venue_name", "tagline", "about_text", "city", "address", "latitude", "longitude"]
        }),
        ("Contact", {
            "fields": ["phone", "whatsapp_number", "email", "opening_hours"]
        }),
        ("External links", {
            "fields": ["google_maps_url", "google_reviews_url", "instagram_url", "facebook_url", "youtube_url"],
            "classes": ["collapse"],
        }),
        ("Stats (Hero)", {
            "fields": ["rating_value", "rating_count", "weddings_hosted"]
        }),
        ("Branding / Theme", {
            "fields": ["primary_color", "accent_color", "logo", "hero_image", "hero_video_url"]
        }),
        ("SEO", {
            "fields": ["meta_title", "meta_description"],
            "classes": ["collapse"],
        }),
        ("Notifications", {
            "fields": ["notify_email"]
        }),
    ]

    def has_add_permission(self, request):
        """Disable 'Add' if a row already exists (singleton pattern)."""
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False  # Prevent accidental deletion of the singleton


# ─── Hall ─────────────────────────────────────────────────────────────────────

@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display  = ["name", "seating_capacity", "floating_capacity", "is_ac", "order"]
    list_editable = ["order"]
    ordering      = ["order"]


# ─── Facility ─────────────────────────────────────────────────────────────────

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display  = ["name", "icon", "detail", "order"]
    list_editable = ["order"]
    ordering      = ["order"]


# ─── Package ──────────────────────────────────────────────────────────────────

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display  = ["name", "price_from", "show_price", "is_popular", "order"]
    list_editable = ["is_popular", "show_price", "order"]
    ordering      = ["order"]


# ─── Review ───────────────────────────────────────────────────────────────────

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ["author_name", "rating", "source", "date", "is_visible"]
    list_editable = ["is_visible"]
    list_filter   = ["source", "is_visible", "rating"]
    ordering      = ["-date"]


# ─── FAQ ──────────────────────────────────────────────────────────────────────

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display  = ["question", "order"]
    list_editable = ["order"]
    ordering      = ["order"]
