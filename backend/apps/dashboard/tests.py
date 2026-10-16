"""
Unit tests for the Executive Operations Dashboard.
"""

from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse

from apps.venue.models import Hall, Package
from apps.bookings.models import Enquiry, Booking
from apps.dashboard.services import DashboardMetricsService


class DashboardMetricsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_superuser("adminuser", "admin@example.com", "pass1234")
        self.hall = Hall.objects.create(name="Royal Hall", seating_capacity=500, floating_capacity=800)
        self.pkg = Package.objects.create(name="Gold Tier", price_from=Decimal("80000.00"))

    def test_metrics_aggregation(self):
        Enquiry.objects.create(name="Client A", phone="9876543210", status="new")
        Booking.objects.create(
            booking_reference="BK-TEST-DASH",
            customer_name="Client B",
            customer_phone="9876543211",
            hall=self.hall,
            package=self.pkg,
            event_date="2026-12-15",
            base_amount=Decimal("80000.00"),
            paid_amount=Decimal("24000.00"),
            balance_amount=Decimal("56000.00"),
            status=Booking.STATUS_CONFIRMED,
        )

        metrics = DashboardMetricsService.get_summary_metrics()
        self.assertEqual(metrics["venues"]["total_halls"], 1)
        self.assertEqual(metrics["enquiries"]["total"], 1)
        self.assertEqual(metrics["enquiries"]["new"], 1)
        self.assertEqual(metrics["bookings"]["confirmed"], 1)
        self.assertEqual(metrics["revenue"]["total_revenue"], "80,000.00")
        self.assertEqual(metrics["revenue"]["collected_advance"], "24,000.00")

    def test_dashboard_view_access(self):
        self.client.login(username="adminuser", password="pass1234")
        url = reverse("admin-executive-dashboard")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Executive Venue Operations Dashboard")
