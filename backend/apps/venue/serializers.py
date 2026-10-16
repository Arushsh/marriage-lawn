"""Serializers for public-facing venue data."""

from rest_framework import serializers
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


class SiteSettingsSerializer(serializers.ModelSerializer):
    """
    Exposes only the fields the frontend needs.
    Intentionally excludes notify_email (private).
    """

    logo       = serializers.SerializerMethodField()
    hero_image = serializers.SerializerMethodField()
    menu_pdf   = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            "venue_name", "tagline", "about_text", "city", "address",
            "latitude", "longitude",
            "phone", "whatsapp_number", "opening_hours",
            "secondary_contact_name", "secondary_phone",
            "google_maps_url", "google_reviews_url",
            "instagram_url", "facebook_url", "youtube_url",
            "rating_value", "rating_count", "weddings_hosted",
            "events_hosted", "years_of_experience",
            "primary_color", "accent_color",
            "logo", "hero_image", "hero_video_url",
            "menu_pdf", "tour_enabled",
            "meta_title", "meta_description",
        ]

    def _url(self, field_value) -> str:
        """Return the URL string from an ImageFieldFile or FileField (or empty string)."""
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

    def get_menu_pdf(self, obj) -> str:
        return self._url(obj.menu_pdf)


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
        fields = [
            "id",
            "name",
            "description",
            "price_from",
            "price_unit",
            "min_guests",
            "max_guests",
            "price_note",
            "inclusions",
            "is_popular",
            "show_price",
            "order",
        ]


class ServiceSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id",
            "title",
            "slug",
            "kind",
            "event_type",
            "short_description",
            "description",
            "features",
            "image",
            "icon",
            "order",
        ]

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


DISH_IMAGES = {
    "paneer tikka angara": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
    "dahi ke sholay": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    "crispy corn & water chestnut": "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80",
    "galouti kebab on mini sheermal": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "murgh malai tikka": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
    "amritsari fish fingers": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    "paneer butter masala royal": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    "dal makhani bukhara": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    "subz dum handi diwani": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    "awadhi murgh dum biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    "kashmiri mutton rogan josh": "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80",
    "murgh lababdar": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    "lucknowi saffron sheermal": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    "amritsari chur chur naan": "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80",
    "kashmiri pulao": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80",
    "pudina laccha paratha": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    "royal shahi tukda": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    "kesar badam malpua with rabdi": "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
    "moong dal halwa royal": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    "angoori rasmalai": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    "shree royal rose sharbath": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    "spiced jamun shots": "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80",
    "virgin blue lagoon": "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80",
    "kesar badam thandai": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
}

DEFAULT_DISH_FALLBACK = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"


class MenuItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = ["id", "name", "description", "image", "is_veg", "is_popular", "order"]

    def get_image(self, obj) -> str:
        if obj.image:
            name = str(getattr(obj.image, "name", "") or "")
            if name.startswith("http://") or name.startswith("https://"):
                return name
            try:
                return obj.image.url
            except Exception:
                pass
        lookup_key = (obj.name or "").lower().strip()
        for key, url in DISH_IMAGES.items():
            if key in lookup_key or lookup_key in key:
                return url
        return DEFAULT_DISH_FALLBACK



class MenuCategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    class Meta:
        model = MenuCategory
        fields = ["id", "name", "slug", "description", "image", "order", "items"]

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

    def get_items(self, obj) -> list:
        # Check context for veg filter
        veg_only = self.context.get("veg_only", False)
        queryset = obj.items.filter(is_visible=True)
        if veg_only:
            queryset = queryset.filter(is_veg=True)
        return MenuItemSerializer(queryset, many=True).data


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "author_name", "rating", "text", "source", "date"]


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ["id", "question", "answer", "order"]
