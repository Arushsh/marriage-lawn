"""Views for public venue endpoints."""

from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import SiteSettings, Hall, Facility, Package, Review, FAQ
from .serializers import (
    SiteSettingsSerializer,
    HallSerializer,
    FacilitySerializer,
    PackageSerializer,
    ReviewSerializer,
    FAQSerializer,
    MenuCategorySerializer,
    ServiceSerializer,
)


class SiteSettingsView(APIView):
    """GET /api/v1/site/ — returns the singleton SiteSettings record."""
    throttle_classes = []

    def get(self, request):
        try:
            settings_obj = SiteSettings.objects.get()
        except SiteSettings.DoesNotExist:
            return Response(
                {"error": "Site settings not configured yet."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        serializer = SiteSettingsSerializer(settings_obj)
        return Response(serializer.data)


class HallListView(ListAPIView):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    pagination_class = None  # small list, no pagination needed
    throttle_classes = []


class FacilityListView(ListAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    pagination_class = None
    throttle_classes = []


class PackageListView(ListAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    pagination_class = None
    throttle_classes = []


class ReviewListView(ListAPIView):
    queryset = Review.objects.filter(is_visible=True)
    serializer_class = ReviewSerializer
    pagination_class = None
    throttle_classes = []


class FAQListView(ListAPIView):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    pagination_class = None
    throttle_classes = []


class MenuCategoryListView(ListAPIView):
    """
    GET /api/v1/menu/
    Returns all active menu categories with their dishes.
    Supports ?veg=1 or ?veg_only=1 to filter for vegetarian items only.
    """
    serializer_class = MenuCategorySerializer
    pagination_class = None
    throttle_classes = []

    def get_queryset(self):
        from .models import MenuCategory
        return MenuCategory.objects.prefetch_related("items").all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        veg_param = self.request.query_params.get("veg") or self.request.query_params.get("veg_only")
        context["veg_only"] = veg_param in ("1", "true", "True")
        return context


class ServiceListView(ListAPIView):
    """GET /api/v1/services/ — returns active services and add-ons."""
    serializer_class = ServiceSerializer
    pagination_class = None
    throttle_classes = []

    def get_queryset(self):
        from .models import Service
        return Service.objects.filter(is_visible=True)

