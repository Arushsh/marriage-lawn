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
)


class SiteSettingsView(APIView):
    """GET /api/v1/site/ — returns the singleton SiteSettings record."""

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


class FacilityListView(ListAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    pagination_class = None


class PackageListView(ListAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    pagination_class = None


class ReviewListView(ListAPIView):
    queryset = Review.objects.filter(is_visible=True)
    serializer_class = ReviewSerializer
    pagination_class = None


class FAQListView(ListAPIView):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    pagination_class = None
