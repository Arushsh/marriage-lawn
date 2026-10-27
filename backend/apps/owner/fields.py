"""Custom serializer fields for the owner dashboard API."""

from rest_framework import serializers


class AssetURLField(serializers.Field):
    """
    Read: resolves a FileField/ImageField to a usable URL (remote http(s)
    names pass through untouched, matching the seed-data convention).

    Write: accepts either an uploaded file (multipart form) or an http(s)
    URL string stored as-is.  Empty string clears the asset.
    """

    MAX_URL_LENGTH = 95  # most asset columns are varchar(100)

    def __init__(self, **kwargs):
        kwargs.setdefault("required", False)
        kwargs.setdefault("allow_null", True)
        super().__init__(**kwargs)

    def to_representation(self, value) -> str:
        if not value:
            return ""
        name = str(getattr(value, "name", "") or value)
        if name.startswith("http://") or name.startswith("https://"):
            return name
        try:
            return value.url
        except Exception:
            return ""

    def to_internal_value(self, data):
        if data is None or data == "":
            return ""
        # Uploaded file (django.core.files.UploadedFile)
        if hasattr(data, "name") and not isinstance(data, str):
            return data
        if isinstance(data, str):
            if data.startswith("http://") or data.startswith("https://"):
                if len(data) > self.MAX_URL_LENGTH:
                    raise serializers.ValidationError(
                        "URL is too long to store directly; upload the file instead."
                    )
                return data
        raise serializers.ValidationError(
            "Provide a file upload or an http(s) URL."
        )
