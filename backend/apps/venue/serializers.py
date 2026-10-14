"""Serializers for public-facing venue data."""

from rest_framework import serializers
from .models import SiteSettings, Hall, Facility, Package, Review, FAQ


class SiteSettingsSerializer(serializers.ModelSerializer):
    """
    Exposes only the fields the frontend needs.
    Intentionally excludes notify_email (private).
    """

    logo       = serializers.SerializerMethodField()
    hero_image = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            "venue_name", "tagline", "about_text", "city", "address",
            "latitude", "longitude",
            "phone", "whatsapp_number", "opening_hours",
            "google_maps_url", "google_reviews_url",
            "instagram_url", "facebook_url", "youtube_url",
            "rating_value", "rating_count", "weddings_hosted",
            "primary_color", "accent_color",
            "logo", "hero_image", "hero_video_url",
            "meta_title", "meta_description",
        ]

    def _url(self, field_value) -> str:
        """Return the URL string from an ImageFieldFile (or empty string)."""
        if field_value:
            name = str(getattr(field_value, "name", "") or "")
            if name.startswith("http://") or name.startswith("https://"):
                return name
            try:
                return field_value.url
            except Exception:
                return ""
        return ""

    def get_logo(self, obj) -> str:
        return self._url(obj.logo)

    def get_hero_image(self, obj) -> str:
        return self._url(obj.hero_image)


class HallSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Hall
        fields = ["id", "name", "description", "seating_capacity", "floating_capacity", "is_ac", "image", "order"]

    def get_image(self, obj) -> str:
        if obj.image:
            name = str(getattr(obj.image, "name", "") or "")
            if name.startswith("http://") or name.startswith("https://"):
                return name
            try:
                return obj.image.url
            except Exception:
                return ""
        return ""


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = ["id", "name", "icon", "detail", "order"]


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ["id", "name", "description", "price_from", "price_note", "inclusions", "is_popular", "show_price", "order"]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "author_name", "rating", "text", "source", "date"]


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ["id", "question", "answer", "order"]
