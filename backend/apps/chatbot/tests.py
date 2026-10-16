"""
Unit tests for the AI FAQ Chatbot.
"""

import datetime
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.venue.models import Hall, Package
from apps.bookings.models import AvailabilityDate
from apps.chatbot.models import ChatbotFAQ
from apps.chatbot.engine import ChatbotEngine


class ChatbotEngineTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.hall = Hall.objects.create(
            name="Grand Banquet",
            seating_capacity=400,
            floating_capacity=700,
            is_ac=True,
            order=1,
        )
        self.pkg = Package.objects.create(
            name="Royal Silver Package",
            price_from=Decimal("50000.00"),
            price_unit="per_event",
            show_price=True,
            order=1,
        )
        self.faq = ChatbotFAQ.objects.create(
            question="Can we bring our own DJ?",
            answer="Yes, outside DJs are allowed until 12:00 midnight.",
            keywords="dj, music, loudspeaker, midnight",
            intent_tag="timing",
            is_active=True,
        )

    def test_pricing_intent_live_db_query(self):
        res = ChatbotEngine.process_message("What is the cost or package price for a wedding?", "test-session")
        self.assertEqual(res["intent"], "pricing")
        self.assertIn("Royal Silver Package", res["reply"])
        self.assertIn("50,000", res["reply"])
        self.assertTrue(len(res["suggestions"]) > 0)

    def test_capacity_intent_live_db_query(self):
        res = ChatbotEngine.process_message("How many guests can your lawn and hall accommodate?", "test-session")
        self.assertEqual(res["intent"], "capacity")
        self.assertIn("Grand Banquet", res["reply"])
        self.assertIn("400", res["reply"])

    def test_availability_intent_date_checking(self):
        future_date = datetime.date.today() + datetime.timedelta(days=20)
        date_str = future_date.isoformat()

        # Available state
        res = ChatbotEngine.process_message(f"Is {date_str} available for marriage?", "test-session")
        self.assertEqual(res["intent"], "availability")
        self.assertIn("Available", res["reply"])

        # Block date and test again
        AvailabilityDate.objects.create(date=future_date, status="booked", note="Blocked")
        res_blocked = ChatbotEngine.process_message(f"Is {date_str} free?", "test-session")
        self.assertIn("Booked", res_blocked["reply"])

    def test_faq_keyword_matching(self):
        res = ChatbotEngine.process_message("What is the timing rule for DJ and music?", "test-session")
        self.assertEqual(res["intent"], "timing")
        self.assertIn("12:00 midnight", res["reply"])

    def test_chatbot_api_endpoint(self):
        url = reverse("chatbot-query")
        response = self.client.post(url, {"message": "How much does it cost?", "session_id": "session-123"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("reply", response.data)
        self.assertEqual(response.data["intent"], "pricing")
