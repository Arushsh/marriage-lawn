"""
Voice Calling Service: Script rendering, Opt-Out Enforcement, and Scheduling.
"""

import os
import logging
from django.utils import timezone
from apps.venue.models import SiteSettings
from .models import CallScript, ContactOptOut, CallLog
from .adapters import MockVoiceProvider, VapiVoiceProvider

logger = logging.getLogger(__name__)


class VoiceCallingService:
    @classmethod
    def get_adapter(cls, provider_name: str | None = None):
        name = provider_name or os.getenv("VOICE_PROVIDER", "mock")
        if name.lower() == "vapi":
            return VapiVoiceProvider()
        return MockVoiceProvider()

    @classmethod
    def is_opted_out(cls, phone: str) -> bool:
        clean = (phone or "").replace("+91", "").replace("-", "").strip()
        return ContactOptOut.objects.filter(phone=clean).exists()

    @classmethod
    def process_opt_out(cls, phone: str, reason: str = "customer_opted_out") -> ContactOptOut:
        clean = (phone or "").replace("+91", "").replace("-", "").strip()
        opt_out, _ = ContactOptOut.objects.get_or_create(
            phone=clean,
            defaults={"reason": reason},
        )
        logger.info("Number +91%s registered in DND/Opt-Out registry.", clean)
        return opt_out

    @classmethod
    def render_script(cls, template: str, context: dict) -> str:
        site = SiteSettings.objects.first()
        defaults = {
            "venue_name": site.venue_name if site else "Shree Palace Lawn",
            "city": site.city if site else "Prayagraj",
            "customer_name": "Valued Guest",
            "event_type": "wedding celebration",
            "event_date": "your upcoming date",
            "guest_count": "your guests",
        }
        merged = {**defaults, **context}
        rendered = template
        for k, v in merged.items():
            rendered = rendered.replace(f"{{{k}}}", str(v))
        return rendered

    @classmethod
    def trigger_call(
        cls,
        recipient_name: str,
        recipient_phone: str,
        trigger_event: str,
        context: dict | None = None,
        enquiry=None,
        booking=None,
        provider_name: str | None = None,
    ) -> CallLog:
        clean_phone = (recipient_phone or "").replace("+91", "").replace("-", "").strip()
        context = context or {}

        # 1. Strict Opt-Out Check
        if cls.is_opted_out(clean_phone):
            logger.info("Call suppressed for %s: phone is in DND/Opt-Out registry.", clean_phone)
            call_log = CallLog.objects.create(
                recipient_name=recipient_name,
                recipient_phone=clean_phone,
                enquiry=enquiry,
                booking=booking,
                status=CallLog.STATUS_OPTED_OUT,
                rendered_speech="[Call blocked: Recipient opted out]",
                transcript="Call automatically suppressed: Number registered in DND.",
            )
            return call_log

        # 2. Check customer voice consent flag
        if booking and not getattr(booking, "has_voice_consent", True):
            logger.info("Call suppressed: booking explicitly opted out of voice alerts.")
            call_log = CallLog.objects.create(
                recipient_name=recipient_name,
                recipient_phone=clean_phone,
                enquiry=enquiry,
                booking=booking,
                status=CallLog.STATUS_OPTED_OUT,
                rendered_speech="[Call blocked: No consent]",
                transcript="Call suppressed: Voice consent false on booking.",
            )
            return call_log

        # 3. Fetch script template
        script = CallScript.objects.filter(trigger_event=trigger_event, is_active=True).first()
        if not script:
            default_template = (
                "नमस्ते {customer_name} जी! {venue_name}, {city} से आपका हार्दिक स्वागत है। "
                "हमें {event_date} को आपके {event_type} के लिए अनुरोध प्राप्त हुआ है। "
                "हमारे वेडिंग मैनेजर आपकी सेवा में तत्पर हैं। व्हाट्सएप पर विवरण और मेन्यू पाने के लिए 1 दबाएं। "
                "कॉल समाप्त करने के लिए 9 दबाएं।"
            )
        else:
            default_template = script.script_template

        rendered_text = cls.render_script(default_template, context)

        # 4. Create CallLog entry
        adapter = cls.get_adapter(provider_name)
        call_log = CallLog.objects.create(
            recipient_name=recipient_name,
            recipient_phone=clean_phone,
            script=script,
            enquiry=enquiry,
            booking=booking,
            status=CallLog.STATUS_INITIATING,
            provider=provider_name or os.getenv("VOICE_PROVIDER", "mock"),
            rendered_speech=rendered_text,
            initiated_at=timezone.now(),
        )

        # 5. Initiate call via provider adapter
        try:
            res = adapter.initiate_call(call_log)
            if res.get("status") == "completed":
                call_log.status = CallLog.STATUS_COMPLETED
            elif res.get("status") == "failed":
                call_log.status = CallLog.STATUS_FAILED
            call_log.save()
        except Exception as exc:
            logger.error("Call initiation exception: %s", exc)
            call_log.status = CallLog.STATUS_FAILED
            call_log.save()

        return call_log
