"""
Serializers for the bookings app.

EnquiryCreateSerializer includes honeypot validation and is write-only.
AvailabilitySerializer is read-only for the public calendar view.
"""

import datetime
from rest_framework import serializers

from .models import AvailabilityDate, Enquiry, Booking


class AvailabilityDateSerializer(serializers.ModelSerializer):
    """Public read-only — never expose the private 'note' field."""

    class Meta:
        model = AvailabilityDate
        fields = ["date", "status"]


class EnquiryCreateSerializer(serializers.ModelSerializer):
    """
    Write-only serializer for the public POST /enquiries/ endpoint.

    Honeypot: a hidden field called 'website' that real users never fill.
    If it contains any value the request is silently accepted but not saved.
    """

    # Honeypot field — not a model field
    website = serializers.CharField(
        required=False, allow_blank=True, write_only=True,
        help_text="Leave empty — bot trap",
    )

    class Meta:
        model = Enquiry
        fields = [
            "name", "phone", "email",
            "event_type", "event_date", "guest_count", "message",
            "source",
            "website",  # honeypot
        ]
        extra_kwargs = {
            "email":       {"required": False, "allow_blank": True},
            "event_date":  {"required": False, "allow_null": True},
            "guest_count": {"required": False, "allow_blank": True},
            "message":     {"required": False, "allow_blank": True},
            "source":      {"required": False},
        }

    def validate_website(self, value: str) -> str:
        """Honeypot: if filled, mark the submission as spam."""
        if value:
            # Signal to the view that this is a bot
            raise serializers.ValidationError("__honeypot__")
        return value

    def validate_event_date(self, value: datetime.date | None) -> datetime.date | None:
        if value and value < datetime.date.today():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value


class BookingCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=150)
    customer_phone = serializers.CharField(max_length=10)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    hall_id = serializers.IntegerField()
    package_id = serializers.IntegerField(required=False, allow_null=True)
    event_type = serializers.CharField(default="wedding")
    event_date = serializers.DateField()
    slot = serializers.ChoiceField(
        choices=[
            ("full_day", "Full Day"),
            ("morning", "Morning"),
            ("evening", "Evening"),
        ],
        default="full_day",
    )
    guest_count = serializers.IntegerField(default=300, min_value=1)
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    has_voice_consent = serializers.BooleanField(default=True)

    def validate_event_date(self, value: datetime.date) -> datetime.date:
        if value < datetime.date.today():
            raise serializers.ValidationError("Booking date cannot be in the past.")
        return value


class BookingDetailSerializer(serializers.ModelSerializer):
    hall_name = serializers.CharField(source="hall.name", read_only=True)
    package_name = serializers.CharField(source="package.name", read_only=True, default="Standard Venue Hire")

    class Meta:
        model = Booking
        fields = [
            "booking_reference",
            "customer_name",
            "customer_phone",
            "customer_email",
            "hall_id",
            "hall_name",
            "package_id",
            "package_name",
            "event_type",
            "event_date",
            "slot",
            "guest_count",
            "base_amount",
            "advance_amount",
            "paid_amount",
            "balance_amount",
            "status",
            "payment_status",
            "payment_provider",
            "created_at",
        ]


class PaymentVerificationSerializer(serializers.Serializer):
    provider = serializers.CharField(default="mock", required=False)
    order_id = serializers.CharField(max_length=100)
    payment_id = serializers.CharField(max_length=100)
    signature = serializers.CharField(max_length=255, default="mock_sig_verified", required=False)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

