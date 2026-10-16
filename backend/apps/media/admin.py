"""Django admin configuration for media app."""

from django.contrib import admin
from django.utils.html import format_html
from .models import GalleryImage, VideoLink


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ["thumbnail", "caption", "category", "is_featured", "order", "created_at"]
    list_filter = ["category", "is_featured"]
    list_editable = ["category", "is_featured", "order"]
    search_fields = ["caption", "alt_text"]
    ordering = ["order", "-created_at"]

    def thumbnail(self, obj):
        if obj.image:
            url = str(getattr(obj.image, "name", "") or "")
            if not (url.startswith("http://") or url.startswith("https://")):
                try:
                    url = obj.image.url
                except Exception:
                    url = ""
            if url:
                return format_html(
                    '<img src="{}" style="height: 48px; width: 64px; object-fit: cover; border-radius: 4px;" />',
                    url,
                )
        return "—"

    thumbnail.short_description = "Preview"


@admin.register(VideoLink)
class VideoLinkAdmin(admin.ModelAdmin):
    list_display = ["title", "url", "order", "created_at"]
    list_editable = ["order"]
    search_fields = ["title", "url"]
    ordering = ["order", "-created_at"]
