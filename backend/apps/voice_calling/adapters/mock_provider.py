"""
Mock voice provider for zero-cost offline local development and automated testing.
"""

import uuid
from django.utils import timezone
from .base import BaseVoiceProvider


class MockVoiceProvider(BaseVoiceProvider):
    """
    Simulates successful phone calls without requiring real telephony credits.
    Generates realistic call durations, transcripts, and audio simulation URLs.
    """

    def initiate_call(self, call_log) -> dict:
        mock_id = f"mock_call_{uuid.uuid4().hex[:12]}"
        now = timezone.now()

        call_log.status = "completed"
        call_log.provider_call_id = mock_id
        call_log.initiated_at = now
        call_log.completed_at = now + timezone.timedelta(seconds=45)
        call_log.duration_seconds = 45
        call_log.recording_url = f"https://mock-telephony.local/recordings/{mock_id}.mp3"
        call_log.transcript = (
            f"एआई वेडिंग साथी: {call_log.rendered_speech}\n"
            f"अतिथि ({call_log.recipient_name}): धन्यवाद! जी हाँ, मैंने वेबसाइट पर अनुरोध भेजा था। मुझे व्हाट्सएप पर तिथियों और मेन्यू की जानकारी चाहिए।\n"
            f"एआई वेडिंग साथी: बहुत उत्तम! हमने संपूर्ण शाही विवरण आपके व्हाट्सएप नंबर पर भेज दिया है। हमारे वेडिंग मैनेजर शीघ्र ही आपसे संपर्क करेंगे। श्री पैलेस लॉन चुनने के लिए धन्यवाद!"
        )
        call_log.dtmf_digits = "1"
        call_log.save()

        return {
            "provider_call_id": mock_id,
            "status": "completed",
            "duration": 45,
            "error": None,
        }

    def check_call_status(self, provider_call_id: str) -> dict:
        return {
            "provider_call_id": provider_call_id,
            "status": "completed",
            "duration": 45,
            "error": None,
        }

    def verify_webhook_signature(self, request_data: bytes, signature_header: str) -> bool:
        # Mock webhooks always pass in local dev
        return True
