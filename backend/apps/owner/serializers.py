"""
Writable serializers for the owner dashboard API.

Unlike the public serializers (read-only, field-filtered), these expose the
full editable surface of each model.  Private fields (ip_address) stay out;
owner-facing private fields (owner_note, admin_notes, notify_email) are
intentionally included because this API is staff-only.
"""

from datetime import date as date_cls

from rest_framework import serializers

from apps.venue.models import (
    SiteSettings,
    Hall,
    Facility,
    Package,
    Service,
    MenuCategory,
    MenuItem,
    Review,
    FAQ,
)
from apps.media.models import GalleryImage, VideoLink
from apps.bookings.models import AvailabilityDate, Enquiry, Booking

from .fields import AssetURLField


# ─── Site settings (singleton) ────────────────────────────────────────────────

class OwnerSiteSettingsSerializer(serializers.ModelSerializer):
    logo = AssetURLField()
    hero_image = AssetURLField()
    menu_pdf = AssetURLField()

    class Meta:
        model = SiteSettings
        fields = [
            "venue_name", "tagline", "about_text", "city", "address",
            "latitude", "longitude",
            "phone", "whatsapp_number", "email", "opening_hours",
            "secondary_contact_name", "secondary_phone",
            "google_maps_url", "google_reviews_url",
            "instagram_url", "facebook_url", "youtube_url",
            "rating_value", "rating_count", "weddings_hosted",
            "events_hosted", "years_of_experience",
            "primary_color", "accent_color",
            "logo", "hero_image", "hero_video_url",
            "menu_pdf", "tour_enabled",
            "meta_title", "meta_description",
            "notify_email",
        ]


# ─── Venue content CRUD ───────────────────────────────────────────────────────

class OwnerHallSerializer(serializers.ModelSerializer):
    image = AssetURLField()

    class Meta:
        model = Hall
        fields = [
            "id", "name", "description", "seating_capacity",
            "floating_capacity", "is_ac", "image", "order",
        ]


class OwnerFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = ["id", "name", "icon", "detail", "order"]


class OwnerPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = [
            "id", "name", "description", "price_from", "price_unit",
            "min_guests", "max_guests", "price_note", "inclusions",
            "is_popular", "show_price", "order",
        ]

    def validate_inclusions(self, value) -> list:
        """
        Accept either shape the venue template uses:
          - flat strings: ["Main lawn", "Floral decor", ...]
          - groups: [{"title": "Decor", "items": ["Flowers"]}, ...]
        Stored exactly as provided so the public frontend contract is stable.
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("inclusions must be a list.")
        cleaned: list = []
        for entry in value:
            if isinstance(entry, str):
                text = entry.strip()
                if text:
                    cleaned.append(text)
            elif isinstance(entry, dict):
                if not str(entry.get("title", "")).strip():
                    raise serializers.ValidationError(
                        "Each inclusions group needs a 'title' and an 'items' list."
                    )
                items = entry.get("items", [])
                if not isinstance(items, list):
                    raise serializers.ValidationError("'items' must be a list of strings.")
                cleaned.append({
                    "title": str(entry["title"]).strip(),
                    "items": [str(item) for item in items],
                })
            else:
                raise serializers.ValidationError(
                    "inclusions entries must be strings or {title, items} groups."
                )
        return cleaned


class OwnerServiceSerializer(serializers.ModelSerializer):
    image = AssetURLField()

    class Meta:
        model = Service
        fields = [
            "id", "title", "slug", "kind", "event_type",
            "short_description", "description", "features",
            "image", "icon", "order", "is_visible",
        ]


class OwnerMenuCategorySerializer(serializers.ModelSerializer):
    image = AssetURLField()

    class Meta:
        model = MenuCategory
        fields = ["id", "name", "slug", "description", "image", "order"]


class OwnerMenuItemSerializer(serializers.ModelSerializer):
    image = AssetURLField()
    category = serializers.PrimaryKeyRelatedField(queryset=MenuCategory.objects.all())

    class Meta:
        model = MenuItem
        fields = [
            "id", "category", "name", "description", "image",
            "is_veg", "is_popular", "order", "is_visible",
        ]


class OwnerReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "author_name", "rating", "text", "source", "date", "is_visible"]


class OwnerFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ["id", "question", "answer", "order"]


# ─── Media ────────────────────────────────────────────────────────────────────

class OwnerGalleryImageSerializer(serializers.ModelSerializer):
    image = AssetURLField(required=True, allow_null=False)

    class Meta:
        model = GalleryImage
        fields = [
            "id", "image", "category", "caption", "alt_text",
            "is_featured", "order", "created_at",
        ]
        read_only_fields = ["created_at"]


class OwnerVideoLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoLink
        fields = ["id", "title", "url", "order", "created_at"]
        read_only_fields = ["created_at"]


# ─── Availability ─────────────────────────────────────────────────────────────

class AvailabilityBulkSerializer(serializers.Serializer):
    """Block (or restyle) one or more dates in a single call."""

    dates = serializers.ListField(
        child=serializers.DateField(), min_length=1, max_length=400,
    )
    status = serializers.ChoiceField(
        choices=[AvailabilityDate.STATUS_BOOKED, AvailabilityDate.STATUS_TENTATIVE],
        default=AvailabilityDate.STATUS_BOOKED,
    )
    note = serializers.CharField(max_length=300, required=False, allow_blank=True, default="")

    def validate_dates(self, value) -> list:
        today = date_cls.today()
        if any(d < today for d in value):
            raise serializers.ValidationError("Cannot block dates in the past.")
        return sorted(set(value))


# ─── Enquiries / leads ────────────────────────────────────────────────────────

class OwnerEnquirySerializer(serializers.ModelSerializer):
    package_name = serializers.CharField(source="package.name", read_only=True, default="")

    class Meta:
        model = Enquiry
        fields = [
            "id", "name", "phone", "email",
            "event_type", "package", "package_name", "event_date", "guest_count",
            "message", "status", "source", "owner_note", "created_at",
        ]
        read_only_fields = [
            "name", "phone", "email", "event_type", "package", "package_name",
            "event_date", "guest_count", "message", "source", "created_at",
        ]


# ─── Bookings ─────────────────────────────────────────────────────────────────

class OwnerBookingListSerializer(serializers.ModelSerializer):
    hall_name = serializers.CharField(source="hall.name", read_only=True)
    package_name = serializers.CharField(source="package.name", read_only=True, default="")

    class Meta:
        model = Booking
        fields = [
            "id", "booking_reference",
            "customer_name", "customer_phone", "customer_email",
            "hall", "hall_name", "package", "package_name",
            "event_type", "event_date", "slot", "guest_count",
            "base_amount", "advance_amount", "paid_amount", "balance_amount",
            "status", "payment_status",
            "payment_provider", "payment_transaction_id",
            "customer_notes", "admin_notes",
            "created_at", "updated_at",
        ]
        read_only_fields = fields


class OwnerBookingUpdateSerializer(serializers.ModelSerializer):
    """Owner may change status, notes, and record offline payments."""

    class Meta:
        model = Booking
        fields = ["status", "admin_notes", "paid_amount"]

    def validate_paid_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("paid_amount cannot be negative.")
        return value


# ─── Owner auth ───────────────────────────────────────────────────────────────

class OwnerUserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
