"""
Tests for the bookings app.

Tests cover:
  - POST /api/v1/enquiries/ — valid, invalid phone, honeypot, missing required fields
  - GET  /api/v1/availability/ — valid range, too-long range, bad dates
"""

import datetime
import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from django.core.cache import cache
from apps.bookings.models import Enquiry, AvailabilityDate


class EnquiryCreateViewTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = reverse("enquiry-create")

    def _post(self, data: dict):
        return self.client.post(self.url, data, format="json")

    # ── Happy path ────────────────────────────────────────────────────────────

    def test_valid_enquiry_returns_201(self):
        data = {
            "name":        "Rahul Sharma",
            "phone":       "9876543210",
            "event_type":  "wedding",
            "event_date":  str(datetime.date.today() + datetime.timedelta(days=30)),
            "guest_count": "500_800",
            "message":     "Please share details.",
            "website":     "",  # honeypot empty
        }
        response = self._post(data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertIn("whatsapp_prefill", response.data)
        self.assertEqual(Enquiry.objects.count(), 1)

    def test_enquiry_without_optional_fields(self):
        """Only name and phone are strictly required for a minimal enquiry."""
        data = {"name": "Priya", "phone": "9123456789", "website": ""}
        response = self._post(data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # ── Validation errors ─────────────────────────────────────────────────────

    def test_invalid_phone_rejected(self):
        data = {"name": "Bad Phone", "phone": "12345", "website": ""}
        response = self._post(data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data.get("details", {}))

    def test_missing_phone_rejected(self):
        data = {"name": "No Phone", "website": ""}
        response = self._post(data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_past_event_date_rejected(self):
        data = {
            "name":       "Past Date",
            "phone":      "9876543210",
            "event_date": str(datetime.date.today() - datetime.timedelta(days=1)),
            "website":    "",
        }
        response = self._post(data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("event_date", response.data.get("details", {}))

    # ── Honeypot ──────────────────────────────────────────────────────────────

    def test_honeypot_filled_returns_201_but_no_db_record(self):
        """Bot submissions should silently return 201 but not be saved."""
        data = {
            "name":    "Bot",
            "phone":   "9876543210",
            "website": "http://spam.example.com",  # honeypot filled
        }
        response = self._post(data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enquiry.objects.count(), 0)


class AvailabilityViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("availability")
        today = datetime.date.today()
        AvailabilityDate.objects.create(date=today + datetime.timedelta(days=7), status="booked")
        AvailabilityDate.objects.create(date=today + datetime.timedelta(days=14), status="tentative")

    def test_returns_dates_in_range(self):
        today = datetime.date.today()
        start = today.isoformat()
        end   = (today + datetime.timedelta(days=30)).isoformat()
        response = self.client.get(self.url, {"start": start, "end": end})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["dates"]), 2)

    def test_range_too_long_rejected(self):
        today = datetime.date.today()
        end   = (today + datetime.timedelta(days=200)).isoformat()
        response = self.client.get(self.url, {"start": today.isoformat(), "end": end})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bad_date_format_rejected(self):
        response = self.client.get(self.url, {"start": "not-a-date", "end": "also-bad"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_private_note_not_in_response(self):
        today = datetime.date.today()
        end   = (today + datetime.timedelta(days=30)).isoformat()
        response = self.client.get(self.url, {"start": today.isoformat(), "end": end})
        for date_obj in response.data["dates"]:
            self.assertNotIn("note", date_obj)


from apps.venue.models import Hall, Package
from apps.bookings.models import Booking
from apps.bookings.services import (
    BookingReservationService,
    VerifiedPaymentService,
    BookingConflictError,
    PaymentVerificationError,
)
from decimal import Decimal


class OnlineBookingTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.hall = Hall.objects.create(
            name="Main Grand Lawn",
            seating_capacity=1000,
            floating_capacity=1500,
            is_ac=False,
            order=1,
        )
        self.pkg = Package.objects.create(
            name="Deluxe Wedding Package",
            price_from=Decimal("75000.00"),
            price_unit="per_event",
            order=1,
        )
        self.target_date = datetime.date.today() + datetime.timedelta(days=45)

    def test_booking_creation_and_pricing(self):
        booking = BookingReservationService.create_booking(
            customer_name="Amit Verma",
            customer_phone="9876543210",
            customer_email="amit@example.com",
            hall_id=self.hall.pk,
            package_id=self.pkg.pk,
            event_date=self.target_date,
            slot="full_day",
            guest_count=500,
        )
        self.assertEqual(booking.status, Booking.STATUS_PENDING)
        self.assertEqual(booking.base_amount, Decimal("90000.00"))  # 75000 * 1.20 for full day
        self.assertEqual(booking.advance_amount, Decimal("27000.00"))  # 30% of 90000

    def test_booking_slot_conflict_prevention(self):
        # Create first booking
        BookingReservationService.create_booking(
            customer_name="Customer 1",
            customer_phone="9876543210",
            customer_email="cust1@example.com",
            hall_id=self.hall.pk,
            package_id=self.pkg.pk,
            event_date=self.target_date,
            slot="full_day",
        )
        # Attempt duplicate slot booking on same date
        with self.assertRaises(BookingConflictError):
            BookingReservationService.create_booking(
                customer_name="Customer 2",
                customer_phone="9876543211",
                customer_email="cust2@example.com",
                hall_id=self.hall.pk,
                package_id=self.pkg.pk,
                event_date=self.target_date,
                slot="full_day",
            )

    def test_verified_payment_and_confirmation(self):
        booking = BookingReservationService.create_booking(
            customer_name="Karan Johar",
            customer_phone="9876543210",
            customer_email="karan@example.com",
            hall_id=self.hall.pk,
            package_id=self.pkg.pk,
            event_date=self.target_date,
            slot="morning",
        )
        # Test signature verification failure
        with self.assertRaises(PaymentVerificationError):
            VerifiedPaymentService.verify_and_confirm_payment(
                booking=booking,
                amount=booking.advance_amount,
                provider="mock",
                order_id="order_123",
                payment_id="pay_123",
                signature="invalid_tampered_sig",
            )

        # Test valid signature verification
        payment = VerifiedPaymentService.verify_and_confirm_payment(
            booking=booking,
            amount=booking.advance_amount,
            provider="mock",
            order_id="order_123",
            payment_id="pay_123",
            signature="mock_sig_valid",
        )
        booking.refresh_from_db()
        self.assertTrue(payment.is_verified)
        self.assertEqual(booking.status, Booking.STATUS_CONFIRMED)
        self.assertEqual(booking.paid_amount, booking.advance_amount)
        self.assertTrue(AvailabilityDate.objects.filter(date=self.target_date, status="booked").exists())

