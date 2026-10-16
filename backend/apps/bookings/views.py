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
    throttle_classes = []

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


# ─── Online Booking Views ─────────────────────────────────────────────────────

from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    PaymentVerificationSerializer,
)
from .services import (
    BookingReservationService,
    VerifiedPaymentService,
    BookingConflictError,
    PaymentVerificationError,
)
from decimal import Decimal


class BookingCreateView(APIView):
    """
    POST /api/v1/bookings/
    Create a new booking with concurrency safety and computed server pricing.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "validation_error", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        try:
            booking = BookingReservationService.create_booking(
                customer_name=data["customer_name"],
                customer_phone=data["customer_phone"],
                customer_email=data.get("customer_email", ""),
                hall_id=data["hall_id"],
                package_id=data.get("package_id"),
                event_type=data.get("event_type", "wedding"),
                event_date=data["event_date"],
                slot=data.get("slot", "full_day"),
                guest_count=data.get("guest_count", 300),
                customer_notes=data.get("customer_notes", ""),
                ip_address=_get_client_ip(request),
                has_voice_consent=data.get("has_voice_consent", True),
            )
        except BookingConflictError as conflict_err:
            return Response(
                {"error": "slot_conflict", "message": str(conflict_err)},
                status=status.HTTP_409_CONFLICT,
            )
        except Exception as exc:
            return Response(
                {"error": "booking_error", "message": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate payment session token / mock order
        order_id = f"order_{booking.booking_reference}"

        return Response(
            {
                "message": "Booking reservation initiated. Advance payment required to confirm.",
                "booking_reference": booking.booking_reference,
                "base_amount": str(booking.base_amount),
                "advance_amount": str(booking.advance_amount),
                "payment_order_id": order_id,
                "status": booking.status,
                "event_date": str(booking.event_date),
                "slot": booking.slot,
                "hall": booking.hall.name,
            },
            status=status.HTTP_201_CREATED,
        )


class BookingDetailView(APIView):
    """
    GET /api/v1/bookings/<reference>/
    Retrieve booking status and breakdown.
    """

    permission_classes = [AllowAny]

    def get(self, request, reference):
        try:
            booking = Booking.objects.select_related("hall", "package").get(
                booking_reference=reference
            )
        except Booking.DoesNotExist:
            return Response(
                {"error": "not_found", "message": "Booking reference not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data)


class BookingPaymentVerifyView(APIView):
    """
    POST /api/v1/bookings/<reference>/verify-payment/
    Verify gateway HMAC/token and confirm reservation.
    """

    permission_classes = [AllowAny]

    def post(self, request, reference):
        try:
            booking = Booking.objects.get(booking_reference=reference)
        except Booking.DoesNotExist:
            return Response(
                {"error": "not_found", "message": "Booking reference not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PaymentVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "validation_error", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        amount = Decimal(str(data.get("amount") or booking.advance_amount))
        provider = data.get("provider") or "mock"
        signature = data.get("signature") or "mock_sig_verified"
        order_id = data.get("order_id") or booking.payment_order_id or f"ord_{booking.booking_reference}"
        payment_id = data.get("payment_id") or f"pay_{booking.booking_reference}"

        try:
            payment = VerifiedPaymentService.verify_and_confirm_payment(
                booking=booking,
                amount=amount,
                provider=provider,
                order_id=order_id,
                payment_id=payment_id,
                signature=signature,
                raw_payload=request.data,
            )
        except PaymentVerificationError as pve:
            return Response(
                {"error": "payment_verification_failed", "message": str(pve)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return Response(
                {"error": "payment_processing_error", "message": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Payment verified and booking confirmed successfully!",
                "booking_reference": booking.booking_reference,
                "status": booking.status,
                "payment_status": booking.payment_status,
                "paid_amount": str(payment.amount),
                "balance_amount": str(booking.balance_amount),
                "amount_paid": str(payment.amount),
                "balance_remaining": str(booking.balance_amount),
            },
            status=status.HTTP_200_OK,
        )


