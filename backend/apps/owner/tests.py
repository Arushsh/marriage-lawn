"""
Tests for the owner dashboard API.

Covers:
  - /api/v1/auth/login/ — staff gets tokens, non-staff rejected, bad creds 401
  - /api/v1/auth/me/    — token introspection
  - /api/v1/owner/site/ — GET/PATCH singleton
  - /api/v1/owner/gallery/      — create with remote URL, auth required
  - /api/v1/owner/packages/     — inclusions validation
  - /api/v1/owner/availability/ — bulk block + unblock
  - /api/v1/owner/enquiries/<id>/ — status update
  - /api/v1/owner/bookings/<ref>/ — paid_amount recompute, cancel releases date
  - /api/v1/owner/stats/
"""

import datetime

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.bookings.models import AvailabilityDate, Booking, Enquiry
from apps.media.models import GalleryImage
from apps.venue.models import Hall, Package, SiteSettings


class OwnerAPITestBase(TestCase):
    """Shared fixtures: staff user, non-staff user, seeded site settings."""

    @classmethod
    def setUpTestData(cls):
        cls.staff = User.objects.create_user(
            username="owner", password="OwnerPass!234", is_staff=True, is_superuser=True
        )
        cls.peasant = User.objects.create_user(username="pleb", password="PlebPass!234")
        SiteSettings.objects.create(
            venue_name="Test Lawn",
            address="Test Address",
            phone="9876543210",
            whatsapp_number="919876543210",
            notify_email="owner@example.com",
        )

    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def _login(self, username: str = "owner", password: str = "OwnerPass!234") -> dict:
        res = self.client.post(
            "/api/v1/auth/login/",
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        return res.json()

    def _auth(self):
        tokens = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")


class OwnerAuthTests(OwnerAPITestBase):
    def test_staff_login_returns_tokens_and_user(self):
        data = self._login()
        self.assertIn("access", data)
        self.assertIn("refresh", data)
        self.assertEqual(data["user"]["username"], "owner")

    def test_non_staff_login_rejected(self):
        res = self.client.post(
            "/api/v1/auth/login/",
            {"username": "pleb", "password": "PlebPass!234"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bad_credentials_401(self):
        res = self.client.post(
            "/api/v1/auth/login/",
            {"username": "owner", "password": "wrong"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_auth(self):
        res = self.client.get("/api/v1/auth/me/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_with_token(self):
        self._auth()
        res = self.client.get("/api/v1/auth/me/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["username"], "owner")


class OwnerEndpointSecurityTests(OwnerAPITestBase):
    def test_owner_routes_reject_anonymous(self):
        for url in (
            "/api/v1/owner/site/",
            "/api/v1/owner/halls/",
            "/api/v1/owner/gallery/",
            "/api/v1/owner/enquiries/",
            "/api/v1/owner/bookings/",
            "/api/v1/owner/stats/",
            "/api/v1/owner/availability/",
        ):
            res = self.client.get(url)
            self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED, url)

    def test_public_read_endpoints_stay_open(self):
        res = self.client.get("/api/v1/site/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class OwnerSiteSettingsTests(OwnerAPITestBase):
    def test_get_and_patch_site_settings(self):
        self._auth()
        res = self.client.get("/api/v1/owner/site/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["venue_name"], "Test Lawn")

        res = self.client.patch(
            "/api/v1/owner/site/",
            {"venue_name": "Renamed Lawn", "notify_email": "alerts@example.com"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        self.assertEqual(res.json()["venue_name"], "Renamed Lawn")
        # Public serializer must still exclude notify_email
        public = self.client.get("/api/v1/site/").json()
        self.assertNotIn("notify_email", public)


class OwnerContentTests(OwnerAPITestBase):
    def test_package_inclusions_validation(self):
        self._auth()
        res = self.client.post(
            "/api/v1/owner/packages/",
            {
                "name": "Gold",
                "inclusions": [
                    "Main lawn (up to 500 guests)",
                    {"title": "Decor", "items": ["Flowers", "Lights"]},
                ],
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.content)
        body = res.json()["inclusions"]
        self.assertEqual(body[0], "Main lawn (up to 500 guests)")
        self.assertEqual(body[1]["items"], ["Flowers", "Lights"])

        res = self.client.post(
            "/api/v1/owner/packages/",
            {"name": "Bad", "inclusions": [{"items": ["x"]}]},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_gallery_create_with_remote_url(self):
        self._auth()
        res = self.client.post(
            "/api/v1/owner/gallery/",
            {
                "image": "https://images.unsplash.com/photo-123?w=100",
                "category": "lawn",
                "caption": "Night lawn",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.content)
        self.assertTrue(GalleryImage.objects.filter(caption="Night lawn").exists())

    def test_gallery_rejects_bad_image_value(self):
        self._auth()
        res = self.client.post(
            "/api/v1/owner/gallery/",
            {"image": "not-a-url", "category": "lawn"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_menu_item_crud(self):
        self._auth()
        cat = self.client.post(
            "/api/v1/owner/menu-categories/",
            {"name": "Starters", "slug": "starters"},
            format="json",
        ).json()
        res = self.client.post(
            "/api/v1/owner/menu-items/",
            {"category": cat["id"], "name": "Paneer Tikka", "is_veg": True},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.content)
        item_id = res.json()["id"]
        res = self.client.patch(
            f"/api/v1/owner/menu-items/{item_id}/", {"is_popular": True}, format="json"
        )
        self.assertTrue(res.json()["is_popular"])


class OwnerAvailabilityTests(OwnerAPITestBase):
    def test_bulk_block_and_unblock(self):
        self._auth()
        d1 = str(datetime.date.today() + datetime.timedelta(days=10))
        d2 = str(datetime.date.today() + datetime.timedelta(days=11))
        res = self.client.post(
            "/api/v1/owner/availability/",
            {"dates": [d1, d2], "status": "booked", "note": "Sharma wedding"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["created"], 2)

        res = self.client.get("/api/v1/owner/availability/")
        rows = {r["date"]: r for r in res.json()}
        self.assertEqual(rows[d1]["note"], "Sharma wedding")

        res = self.client.delete(f"/api/v1/owner/availability/{d1}/")
        self.assertEqual(res.json()["deleted"], 1)
        self.assertFalse(AvailabilityDate.objects.filter(date=d1).exists())

    def test_cannot_block_past_dates(self):
        self._auth()
        res = self.client.post(
            "/api/v1/owner/availability/",
            {"dates": ["2020-01-01"], "status": "booked"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class OwnerCRMTests(OwnerAPITestBase):
    def setUp(self):
        super().setUp()
        self.enquiry = Enquiry.objects.create(
            name="Rahul", phone="9876543210", event_type="wedding"
        )
        self.hall = Hall.objects.create(name="Main Lawn", seating_capacity=500)
        self.booking = Booking.objects.create(
            customer_name="Priya",
            customer_phone="9876543211",
            hall=self.hall,
            event_date=datetime.date.today() + datetime.timedelta(days=20),
            slot=Booking.SLOT_FULL_DAY,
            guest_count=300,
            base_amount=40000,
        )

    def test_enquiry_status_update(self):
        self._auth()
        res = self.client.patch(
            f"/api/v1/owner/enquiries/{self.enquiry.id}/",
            {"status": "contacted", "owner_note": "Called back"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        self.enquiry.refresh_from_db()
        self.assertEqual(self.enquiry.status, "contacted")

    def test_booking_paid_amount_updates_balance(self):
        self._auth()
        res = self.client.patch(
            f"/api/v1/owner/bookings/{self.booking.booking_reference}/",
            {"paid_amount": 12000},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.balance_amount, 28000)
        self.assertEqual(self.booking.payment_status, Booking.PAYMENT_STATUS_PARTIAL)

    def test_cancelling_booking_releases_unannotated_date(self):
        AvailabilityDate.objects.create(date=self.booking.event_date, status="booked")
        self._auth()
        res = self.client.patch(
            f"/api/v1/owner/bookings/{self.booking.booking_reference}/",
            {"status": "cancelled"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        self.assertFalse(
            AvailabilityDate.objects.filter(date=self.booking.event_date).exists()
        )

    def test_cancelling_keeps_annotated_date(self):
        AvailabilityDate.objects.create(
            date=self.booking.event_date, status="booked", note="Held for Khan family"
        )
        self._auth()
        self.client.patch(
            f"/api/v1/owner/bookings/{self.booking.booking_reference}/",
            {"status": "cancelled"},
            format="json",
        )
        self.assertTrue(
            AvailabilityDate.objects.filter(date=self.booking.event_date).exists()
        )


class OwnerStatsTests(OwnerAPITestBase):
    def test_stats_endpoint(self):
        self._auth()
        res = self.client.get("/api/v1/owner/stats/")
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        body = res.json()
        self.assertIn("enquiries", body)
        self.assertIn("revenue", body)
        self.assertIn("recent_enquiries", body)
