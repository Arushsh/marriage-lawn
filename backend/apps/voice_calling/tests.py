"""
Unit tests for AI Voice Calling.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.voice_calling.models import CallScript, ContactOptOut, CallLog
from apps.voice_calling.services import VoiceCallingService


class VoiceCallingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.script = CallScript.objects.create(
            name="Test Enquiry Call",
            trigger_event="new_enquiry",
            script_template="Hello {customer_name}, your {event_type} enquiry at {venue_name} is acknowledged.",
            is_active=True,
        )

    def test_script_placeholder_rendering(self):
        rendered = VoiceCallingService.render_script(
            self.script.script_template,
            {"customer_name": "Deepak", "event_type": "Wedding", "venue_name": "Grand Palace"},
        )
        self.assertEqual(rendered, "Hello Deepak, your Wedding enquiry at Grand Palace is acknowledged.")

    def test_opt_out_suppression(self):
        phone = "9876543210"
        # Register in DND
        VoiceCallingService.process_opt_out(phone, reason="user_test_opt_out")

        # Try to trigger call
        call_log = VoiceCallingService.trigger_call(
            recipient_name="Blocked User",
            recipient_phone=phone,
            trigger_event="new_enquiry",
        )
        self.assertEqual(call_log.status, CallLog.STATUS_OPTED_OUT)
        self.assertIn("Recipient opted out", call_log.rendered_speech)

    def test_mock_call_initiation_and_completion(self):
        phone = "9123456789"
        call_log = VoiceCallingService.trigger_call(
            recipient_name="Sunil Dutt",
            recipient_phone=phone,
            trigger_event="new_enquiry",
            provider_name="mock",
            context={"customer_name": "Sunil Dutt", "event_type": "Reception"},
        )
        self.assertEqual(call_log.status, CallLog.STATUS_COMPLETED)
        self.assertEqual(call_log.provider, "mock")
        self.assertTrue(call_log.duration_seconds > 0)
        self.assertIn("Hello Sunil Dutt", call_log.rendered_speech)

    def test_webhook_dtmf_opt_out_registration(self):
        phone = "9988776655"
        url = reverse("voice-webhook", kwargs={"provider": "mock"})
        response = self.client.post(url, {"phone": phone, "dtmf_digits": "9"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("opt_out_handled"))
        self.assertTrue(ContactOptOut.objects.filter(phone=phone).exists())
