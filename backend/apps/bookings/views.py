"""
Views for the bookings endpoints.

  GET  /api/v1/availability/?start=YYYY-MM-DD&end=YYYY-MM-DD
  POST /api/v1/enquiries/
"""

import datetime
import threading

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import AvailabilityDate, Enquiry
from .serializers import AvailabilityDateSerializer, EnquiryCreateSerializer
from .throttles import EnquiryRateThrottle
from apps.notifications.email import send_enquiry_notification


def _get_client_ip(request) -> str:
    """Extract the real client IP, honouring X-Forwarded-For from Render/Vercel proxies."""
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


class AvailabilityView(APIView):
    """
    GET /api/v1/availability/?start=YYYY-MM-DD&end=YYYY-MM-DD

    Returns only non-available (booked / tentative) dates in the range.
    Private 'note' field is never exposed.
    Max range: 6 months.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        start_str = request.query_params.get("start")
        end_str   = request.query_params.get("end")

        # ── Parse and validate dates ─────────────────────────────────────────
        try:
            start = datetime.date.fromisoformat(start_str) if start_str else datetime.date.today()
            end   = datetime.date.fromisoformat(end_str)   if end_str   else (start + datetime.timedelta(days=60))
        except (ValueError, TypeError):
            return Response(
                {"error": "validation_error", "details": {"date": ["Use ISO format YYYY-MM-DD."]}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (end - start).days > 184:  # ~6 months
            return Response(
                {"error": "validation_error", "details": {"range": ["Maximum range is 6 months."]}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        dates = AvailabilityDate.objects.filter(date__range=(start, end))
        serializer = AvailabilityDateSerializer(dates, many=True)
        return Response({"dates": serializer.data})


class EnquiryCreateView(APIView):
    """
    POST /api/v1/enquiries/

    • Validates phone (Indian 10-digit).
    • Honeypot check (field 'website' must be empty).
    • Rate-limited to 5 POST requests per hour per IP.
    • Saves lead and triggers async owner email notification.
    • Returns 201 with enquiry ID and a WhatsApp prefill text.
    """

    permission_classes  = [AllowAny]
    throttle_classes    = [EnquiryRateThrottle]

    def post(self, request):
        serializer = EnquiryCreateSerializer(data=request.data)

        if not serializer.is_valid():
            errors = serializer.errors

            # If honeypot triggered: pretend success to confuse bots
            if any("__honeypot__" in str(v) for v in errors.values()):
                return Response(
                    {"id": 0, "message": "Enquiry received"},
                    status=status.HTTP_201_CREATED,
                )

            return Response(
                {"error": "validation_error", "details": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save enquiry (exclude honeypot field, add IP)
        validated = serializer.validated_data
        validated.pop("website", None)

        enquiry = Enquiry.objects.create(
            ip_address=_get_client_ip(request),
            **validated,
        )

        # Async email notification (fire-and-forget thread; use Celery in Phase 2)
        threading.Thread(
            target=send_enquiry_notification,
            args=(enquiry,),
            daemon=True,
        ).start()

        # Build WhatsApp prefill text for the success screen
        from apps.venue.models import SiteSettings
        try:
            site = SiteSettings.objects.get()
            venue_name = site.venue_name
            wa_number  = site.whatsapp_number
        except SiteSettings.DoesNotExist:
            venue_name = "the venue"
            wa_number  = ""

        date_str    = str(enquiry.event_date) if enquiry.event_date else "a date TBD"
        guests_str  = enquiry.guest_count or "some"
        wa_text     = (
            f"Hi, I found {venue_name} online. I'm interested in booking for "
            f"{date_str} for about {guests_str} guests. Please share details."
        )

        return Response(
            {
                "id": enquiry.pk,
                "message": "Enquiry received",
                "whatsapp_prefill": wa_text,
                "whatsapp_number": wa_number,
            },
            status=status.HTTP_201_CREATED,
        )
