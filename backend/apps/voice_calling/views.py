"""
Views for Voice Calling Webhooks and Manual Triggering.
"""

import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import CallLog
from .services import VoiceCallingService

logger = logging.getLogger(__name__)


class VoiceWebhookView(APIView):
    """
    POST /api/v1/voice/webhook/<provider>/
    Receives telephony webhooks from Vapi / Twilio / Mock provider.
    Handles DTMF keypresses and automates opt-out registration when 9 is pressed.
    """

    permission_classes = [AllowAny]

    def post(self, request, provider):
        payload = request.data
        logger.info("Voice webhook received from %s: %s", provider, payload)

        call_id = payload.get("provider_call_id") or payload.get("call_id") or payload.get("id")
        call_log = None
        if call_id:
            call_log = CallLog.objects.filter(provider_call_id=call_id).first()

        # Check for DTMF opt-out
        dtmf = str(payload.get("dtmf_digits") or payload.get("digits") or "").strip()
        if dtmf == "9" or payload.get("opt_out") is True:
            phone = payload.get("phone") or (call_log.recipient_phone if call_log else "")
            if phone:
                VoiceCallingService.process_opt_out(phone, reason="dtmf_9_opt_out_webhook")

        if call_log:
            if "status" in payload:
                call_log.status = payload["status"]
            if "duration" in payload:
                call_log.duration_seconds = int(payload["duration"])
            if "transcript" in payload:
                call_log.transcript = payload["transcript"]
            if "recording_url" in payload:
                call_log.recording_url = payload["recording_url"]
            if dtmf:
                call_log.dtmf_digits = dtmf
            call_log.save()

        return Response({"status": "received", "opt_out_handled": dtmf == "9"}, status=status.HTTP_200_OK)


class VoiceCallTriggerView(APIView):
    """
    POST /api/v1/voice/trigger/
    Admin endpoint to trigger automated AI calls on demand.
    """

    permission_classes = [IsAdminUser]

    def post(self, request):
        phone = request.data.get("phone")
        name = request.data.get("name", "Valued Customer")
        trigger_event = request.data.get("trigger_event", "manual")
        context = request.data.get("context", {})

        if not phone:
            return Response({"error": "phone is required"}, status=status.HTTP_400_BAD_REQUEST)

        call_log = VoiceCallingService.trigger_call(
            recipient_name=name,
            recipient_phone=phone,
            trigger_event=trigger_event,
            context=context,
        )

        return Response(
            {
                "call_log_id": call_log.pk,
                "status": call_log.status,
                "provider": call_log.provider,
                "provider_call_id": call_log.provider_call_id,
                "rendered_speech": call_log.rendered_speech,
                "transcript": call_log.transcript,
            },
            status=status.HTTP_201_CREATED,
        )


class VoiceCallbackRequestView(APIView):
    """
    POST /api/v1/voice/callback-request/
    Public customer endpoint to request an immediate AI phone call.
    Validates phone number, checks opt-out DND status, records an enquiry,
    and initiates automated AI calling workflow.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        name = (request.data.get("name") or "").strip()
        phone = (request.data.get("phone") or "").replace("+91", "").replace("-", "").replace(" ", "").strip()
        event_date = request.data.get("event_date") or None
        guest_count = request.data.get("guest_count") or ""
        notes = request.data.get("notes") or ""

        if not name:
            return Response({"error": "Please provide your name."}, status=status.HTTP_400_BAD_REQUEST)
        if not phone or len(phone) < 10:
            return Response({"error": "Please enter a valid 10-digit mobile number."}, status=status.HTTP_400_BAD_REQUEST)

        # Check opt-out
        if VoiceCallingService.is_opted_out(phone):
            return Response({
                "status": "opted_out",
                "message": "This phone number is currently on our Do-Not-Disturb registry. If you wish to receive calls, please message us on WhatsApp.",
            }, status=status.HTTP_200_OK)

        # Create Enquiry record so it appears in the admin dashboard
        from apps.bookings.models import Enquiry
        enquiry = Enquiry.objects.create(
            name=name,
            phone=phone,
            event_type="wedding",
            event_date=event_date,
            guest_count=str(guest_count) if guest_count else "",
            message=f"[Instant AI Call Request] {notes}".strip(),
            source="ai_callback",
        )

        # Trigger AI call
        call_log = VoiceCallingService.trigger_call(
            recipient_name=name,
            recipient_phone=phone,
            trigger_event="instant_callback",
            context={
                "customer_name": name,
                "event_date": event_date or "आपके चुने हुए शुभ दिन",
                "guest_count": guest_count or "अतिथियों",
            },
            enquiry=enquiry,
        )

        return Response({
            "status": "scheduled",
            "message": f"धन्यवाद {name} जी! श्री पैलेस लॉन की एआई साथी +91 {phone} पर कॉल मिला रही हैं। कृपया अपना फोन तैयार रखें।",
            "call_log_id": call_log.pk,
            "provider": call_log.provider,
            "call_status": call_log.status,
            "rendered_speech": call_log.rendered_speech,
            "transcript": call_log.transcript,
        }, status=status.HTTP_201_CREATED)

