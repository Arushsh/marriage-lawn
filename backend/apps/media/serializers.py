"""Serializers for gallery images and video links."""

from rest_framework import serializers
from .models import GalleryImage, VideoLink


class GalleryImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = [
            "id",
            "image",
            "category",
            "caption",
            "alt_text",
            "is_featured",
            "order",
            "created_at",
        ]

    def get_image(self, obj) -> str:
        if not obj.image:
            return ""
        name = str(getattr(obj.image, "name", "") or "")
        if name.startswith("http://") or name.startswith("https://"):
            return name
        try:
            return obj.image.url
        except Exception:
            return ""


class VideoLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoLink
        fields = ["id", "title", "url", "order", "created_at"]
