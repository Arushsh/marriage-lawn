"""Django admin configuration for the venue app."""

from django.contrib import admin
from django.utils.html import format_html

from .models import (
    SiteSettings,
    Hall,
    Facility,
    Package,
    Review,
    FAQ,
    Service,
    MenuCategory,
    MenuItem,
)


# ─── SiteSettings ─────────────────────────────────────────────────────────────

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    """Singleton admin — only one row allowed, so we hide the 'Add another' link."""

    fieldsets = [
        ("Identity", {
            "fields": ["venue_name", "tagline", "about_text", "city", "address", "latitude", "longitude"]
        }),
        ("Contact", {
            "fields": [
                "phone",
                "whatsapp_number",
                "email",
                "opening_hours",
                "secondary_contact_name",
                "secondary_phone",
            ]
        }),
        ("External links", {
            "fields": ["google_maps_url", "google_reviews_url", "instagram_url", "facebook_url", "youtube_url"],
            "classes": ["collapse"],
        }),
        ("Stats", {
            "fields": [
                "rating_value",
                "rating_count",
                "weddings_hosted",
                "events_hosted",
                "years_of_experience",
            ]
        }),
        ("Brochures & Features", {
            "fields": ["menu_pdf", "tour_enabled"]
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
    list_display  = [
        "name",
        "price_from",
        "price_unit",
        "min_guests",
        "max_guests",
        "show_price",
        "is_popular",
        "order",
    ]
    list_editable = ["is_popular", "show_price", "order"]
    list_filter   = ["price_unit", "is_popular", "show_price"]
    ordering      = ["order"]
    fieldsets = [
        ("Package Identity", {
            "fields": ["name", "description", "order", "is_popular"]
        }),
        ("Pricing & Capacity", {
            "fields": [
                "show_price",
                "price_from",
                "price_unit",
                "price_note",
                "min_guests",
                "max_guests",
            ]
        }),
        ("Grouped Inclusions", {
            "fields": ["inclusions"],
            "description": "JSON array of inclusion categories, e.g.: [{\"title\": \"Snacks\", \"items\": [\"2 Veg\", \"2 Non-Veg\"]}]",
        }),
    ]


# ─── Service ──────────────────────────────────────────────────────────────────

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display  = ["title", "kind", "event_type", "order", "is_visible"]
    list_filter   = ["kind", "is_visible"]
    list_editable = ["order", "is_visible"]
    search_fields = ["title", "short_description"]
    prepopulated_fields = {"slug": ("title",)}
    ordering      = ["order", "title"]


# ─── Menu ─────────────────────────────────────────────────────────────────────

class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 2
    fields = ["name", "is_veg", "is_popular", "order", "is_visible", "description"]


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display        = ["name", "slug", "order", "item_count"]
    list_editable       = ["order"]
    prepopulated_fields = {"slug": ("name",)}
    ordering            = ["order", "name"]
    inlines             = [MenuItemInline]

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = "Items"


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display  = ["name", "category", "is_veg", "is_popular", "order", "is_visible"]
    list_filter   = ["category", "is_veg", "is_popular", "is_visible"]
    list_editable = ["is_veg", "is_popular", "order", "is_visible"]
    search_fields = ["name", "description"]
    ordering      = ["category__order", "order", "name"]


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
