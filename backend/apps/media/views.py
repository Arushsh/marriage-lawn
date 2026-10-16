"""Views for public media endpoints."""

from rest_framework.generics import ListAPIView
from .models import GalleryImage, VideoLink
from .serializers import GalleryImageSerializer, VideoLinkSerializer


class GalleryImageListView(ListAPIView):
    """
    GET /api/v1/gallery/
    Supports filtering by ?category=<name> and ?featured=1
    """

    serializer_class = GalleryImageSerializer
    throttle_classes = []

    def get_queryset(self):
        queryset = GalleryImage.objects.all()
        category = self.request.query_params.get("category")
        if category and category.lower() != "all":
            queryset = queryset.filter(category=category.lower())

        featured = self.request.query_params.get("featured")
        if featured in ("1", "true", "True"):
            queryset = queryset.filter(is_featured=True)

        return queryset


class VideoLinkListView(ListAPIView):
    """
    GET /api/v1/videos/
    Returns list of video links.
    """

    queryset = VideoLink.objects.all()
    serializer_class = VideoLinkSerializer
    pagination_class = None
    throttle_classes = []

