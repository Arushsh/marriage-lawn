"""
Owner dashboard API views — every route requires an authenticated staff user
(IsAdminUser, via JWT or session).

Content editing: site settings, halls, facilities, packages, services, menu,
reviews, FAQs, gallery, videos, availability.  CRM: enquiries, bookings, stats.
"""

from datetime import date as date_cls

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import AvailabilityDate, Booking, Enquiry
from apps.dashboard.services import DashboardMetricsService
from apps.media.models import GalleryImage, VideoLink
from apps.venue.models import (
    FAQ,
    Facility,
    Hall,
    MenuCategory,
    MenuItem,
    Package,
    Review,
    Service,
    SiteSettings,
)

from . import serializers as s


# ─── Site settings (singleton) ────────────────────────────────────────────────

class OwnerSiteSettingsView(generics.RetrieveUpdateAPIView):
    """GET/PATCH the singleton SiteSettings row (no POST — row is created by seed)."""

    serializer_class = s.OwnerSiteSettingsSerializer
    permission_classes = [IsAdminUser]

    def get_object(self):
        return get_object_or_404(SiteSettings)


# ─── Venue content ViewSets ───────────────────────────────────────────────────

class OwnerHallViewSet(viewsets.ModelViewSet):
    queryset = Hall.objects.all()
    serializer_class = s.OwnerHallSerializer
    permission_classes = [IsAdminUser]
    ordering = ["order", "id"]


class OwnerFacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = s.OwnerFacilitySerializer
    permission_classes = [IsAdminUser]


class OwnerPackageViewSet(viewsets.ModelViewSet):
    queryset = Package.objects.all()
    serializer_class = s.OwnerPackageSerializer
    permission_classes = [IsAdminUser]


class OwnerServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = s.OwnerServiceSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        kind = self.request.query_params.get("kind")
        if kind:
            qs = qs.filter(kind=kind)
        return qs


class OwnerMenuCategoryViewSet(viewsets.ModelViewSet):
    queryset = MenuCategory.objects.all()
    serializer_class = s.OwnerMenuCategorySerializer
    permission_classes = [IsAdminUser]


class OwnerMenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.select_related("category")
    serializer_class = s.OwnerMenuItemSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        category_id = self.request.query_params.get("category")
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs


class OwnerReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = s.OwnerReviewSerializer
    permission_classes = [IsAdminUser]


class OwnerFAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = s.OwnerFAQSerializer
    permission_classes = [IsAdminUser]


# ─── Media ────────────────────────────────────────────────────────────────────

class OwnerGalleryViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = s.OwnerGalleryImageSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(caption__icontains=search) | Q(alt_text__icontains=search))
        return qs

    @action(detail=False, methods=["post"])
    def bulk_order(self, request):
        """Persist a full ordering pass: [{id, order}, ...]."""
        items = request.data.get("items")
        if not isinstance(items, list):
            return Response(
                {"detail": "Expected {'items': [{id, order}, ...]}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            for entry in items:
                if not isinstance(entry, dict) or "id" not in entry or "order" not in entry:
                    return Response(
                        {"detail": "Each item needs 'id' and 'order'."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                GalleryImage.objects.filter(pk=entry["id"]).update(order=entry["order"])
        return Response({"updated": len(items)})


class OwnerVideoLinkViewSet(viewsets.ModelViewSet):
    queryset = VideoLink.objects.all()
    serializer_class = s.OwnerVideoLinkSerializer
    permission_classes = [IsAdminUser]


# ─── Availability calendar ────────────────────────────────────────────────────

class OwnerAvailabilityView(APIView):
    """
    GET  /owner/availability/?start=&end=   — full rows including private note.
    POST /owner/availability/               — bulk block: {dates[], status, note}.
    """

    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = AvailabilityDate.objects.all()
        start, end = request.query_params.get("start"), request.query_params.get("end")
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        data = [
            {
                "id": row.id,
                "date": row.date,
                "status": row.status,
                "note": row.note,
                "updated_at": row.updated_at,
            }
            for row in qs.order_by("date")
        ]
        return Response(data)

    def post(self, request):
        serializer = s.AvailabilityBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dates = serializer.validated_data["dates"]
        status_value = serializer.validated_data["status"]
        note = serializer.validated_data["note"]
        created, updated = 0, 0
        with transaction.atomic():
            for day in dates:
                row, was_created = AvailabilityDate.objects.update_or_create(
                    date=day,
                    defaults={"status": status_value, "note": note},
                )
                created += int(was_created)
                updated += int(not was_created)
        return Response({"created": created, "updated": updated}, status=status.HTTP_200_OK)


class OwnerAvailabilityDeleteView(APIView):
    """DELETE /owner/availability/<date>/ — unblock (remove the exception row)."""

    permission_classes = [IsAdminUser]

    def delete(self, request, date_str: str):
        try:
            day = date_cls.fromisoformat(date_str)
        except ValueError:
            return Response(
                {"detail": "Invalid date; expected YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        deleted, _ = AvailabilityDate.objects.filter(date=day).delete()
        return Response({"deleted": deleted}, status=status.HTTP_200_OK)


# ─── Enquiries / leads ────────────────────────────────────────────────────────

class OwnerEnquiryListView(generics.ListAPIView):
    serializer_class = s.OwnerEnquirySerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = Enquiry.objects.select_related("package")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(phone__icontains=search))
        return qs


class OwnerEnquiryUpdateView(generics.UpdateAPIView):
    """PATCH /owner/enquiries/<id>/ — status + owner_note only."""

    queryset = Enquiry.objects.all()
    serializer_class = s.OwnerEnquirySerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["patch"]


# ─── Bookings ─────────────────────────────────────────────────────────────────

class OwnerBookingListView(generics.ListAPIView):
    serializer_class = s.OwnerBookingListSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = Booking.objects.select_related("hall", "package")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(customer_name__icontains=search)
                | Q(customer_phone__icontains=search)
                | Q(booking_reference__icontains=search)
            )
        return qs


class OwnerBookingUpdateView(generics.RetrieveUpdateAPIView):
    """
    GET  /owner/bookings/<reference>/
    PATCH /owner/bookings/<reference>/  — status, admin_notes, paid_amount.

    Cancelling a booking releases the calendar date when no other active
    booking holds it and the row was not manually annotated.
    """

    lookup_field = "booking_reference"
    lookup_url_kwarg = "reference"
    permission_classes = [IsAdminUser]

    queryset = Booking.objects.select_related("hall", "package")

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return s.OwnerBookingUpdateSerializer
        return s.OwnerBookingListSerializer

    def perform_update(self, serializer):
        previous_status = self.get_object().status
        booking = serializer.save()
        new_status = booking.status

        # Derive payment_status when the owner records an offline payment
        from decimal import Decimal

        if booking.paid_amount <= 0:
            derived = Booking.PAYMENT_STATUS_UNPAID
        elif booking.paid_amount >= booking.base_amount > 0:
            derived = Booking.PAYMENT_STATUS_PAID
        else:
            derived = Booking.PAYMENT_STATUS_PARTIAL
        if booking.payment_status != derived and not (
            derived == Booking.PAYMENT_STATUS_UNPAID
            and booking.payment_status == Booking.PAYMENT_STATUS_REFUNDED
        ):
            booking.payment_status = derived
            booking.save(update_fields=["payment_status", "balance_amount", "updated_at"])

        if new_status in (Booking.STATUS_CANCELLED, Booking.STATUS_REFUNDED) and previous_status not in (
            Booking.STATUS_CANCELLED,
            Booking.STATUS_REFUNDED,
        ):
            self._release_date_if_free(booking)

    @staticmethod
    def _release_date_if_free(booking: Booking) -> None:
        still_active = Booking.objects.filter(
            event_date=booking.event_date,
            status__in=[Booking.STATUS_PENDING, Booking.STATUS_CONFIRMED],
        ).exclude(pk=booking.pk)
        if still_active.exists():
            return
        row = AvailabilityDate.objects.filter(date=booking.event_date).first()
        if row and not row.note:
            row.delete()


# ─── Stats ────────────────────────────────────────────────────────────────────

class OwnerStatsView(APIView):
    """Aggregated metrics for the dashboard overview (reuses dashboard services)."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        metrics = DashboardMetricsService.get_summary_metrics()
        metrics["recent_enquiries"] = s.OwnerEnquirySerializer(
            metrics["recent_enquiries"], many=True
        ).data
        metrics["recent_bookings"] = s.OwnerBookingListSerializer(
            metrics["recent_bookings"], many=True
        ).data
        metrics["recent_calls"] = [
            {
                "id": call.id,
                "status": call.status,
                "recipient_name": call.recipient_name,
                "recipient_phone": call.recipient_phone,
                "duration_seconds": call.duration_seconds,
                "created_at": call.created_at,
            }
            for call in metrics["recent_calls"]
        ]
        return Response(metrics)
