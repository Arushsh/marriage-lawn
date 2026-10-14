"""
Serializers for the bookings app.

EnquiryCreateSerializer includes honeypot validation and is write-only.
AvailabilitySerializer is read-only for the public calendar view.
"""

import datetime
from rest_framework import serializers

from .models import AvailabilityDate, Enquiry


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
