"""
Vapi Voice AI provider adapter.
Uses environment variables VAPI_API_KEY and VAPI_PHONE_NUMBER_ID.
Never claims call succeeded without real provider response.
"""

import os
import hmac
import hashlib
import logging
import requests
from .base import BaseVoiceProvider

logger = logging.getLogger(__name__)


class VapiVoiceProvider(BaseVoiceProvider):
    BASE_URL = "https://api.vapi.ai"

    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY", "")
        self.phone_number_id = os.getenv("VAPI_PHONE_NUMBER_ID", "")

    def initiate_call(self, call_log) -> dict:
        if not self.api_key or not self.phone_number_id:
            logger.warning("Vapi credentials missing in environment. Falling back to error.")
            return {
                "provider_call_id": "",
                "status": "failed",
                "error": "VAPI_API_KEY or VAPI_PHONE_NUMBER_ID not set in environment.",
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        # Indian numbers require E.164 country code +91
        formatted_phone = f"+91{call_log.recipient_phone}"

        payload = {
            "phoneNumberId": self.phone_number_id,
            "customer": {
                "number": formatted_phone,
                "name": call_log.recipient_name,
            },
            "assistant": {
                "firstMessage": call_log.rendered_speech,
                "model": {
                    "provider": "openai",
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are the friendly front-desk wedding concierge for Shree Palace Lawn, Prayagraj. "
                                "Speak fluently and respectfully in Hindi (हिन्दी). Use respectful honorifics like 'जी' and 'नमस्ते'. "
                                "Politely confirm their wedding event requirements, guest count, and auspicious dates. "
                                "If the user presses 1, confirm sending the royal brochure to their WhatsApp. "
                                "If the user presses 9 or requests to stop calls, confirm DND opt-out immediately."
                            ),
                        }
                    ],
                },
            },
        }

        try:
            resp = requests.post(f"{self.BASE_URL}/call/phone", json=payload, headers=headers, timeout=10)
            data = resp.json()
            if resp.status_code in (200, 201):
                call_log.provider_call_id = data.get("id", "")
                call_log.status = "in_progress"
                call_log.save()
                return {"provider_call_id": data.get("id", ""), "status": "in_progress", "error": None}
            else:
                call_log.status = "failed"
                call_log.save()
                return {"provider_call_id": "", "status": "failed", "error": data.get("message", "API Error")}
        except Exception as exc:
            logger.error("Failed to initiate Vapi call: %s", exc)
            return {"provider_call_id": "", "status": "failed", "error": str(exc)}

    def check_call_status(self, provider_call_id: str) -> dict:
        if not self.api_key or not provider_call_id:
            return {"status": "unknown", "error": "Missing credentials or call ID"}

        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            resp = requests.get(f"{self.BASE_URL}/call/{provider_call_id}", headers=headers, timeout=10)
            data = resp.json()
            return {
                "provider_call_id": provider_call_id,
                "status": data.get("status", "unknown"),
                "duration": data.get("duration"),
                "recording_url": data.get("recordingUrl", ""),
                "transcript": data.get("transcript", ""),
                "error": None,
            }
        except Exception as exc:
            return {"status": "error", "error": str(exc)}

    def verify_webhook_signature(self, request_data: bytes, signature_header: str) -> bool:
        secret = os.getenv("VAPI_WEBHOOK_SECRET", "")
        if not secret:
            return True  # If no secret configured, accept in testing
        computed = hmac.new(secret.encode(), request_data, hashlib.sha256).hexdigest()
        return hmac.compare_digest(computed, signature_header or "")
