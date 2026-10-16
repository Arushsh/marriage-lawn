"""
Voice Calling Models: Scripts, Opt-outs, and Call Logs.
"""

from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator

phone_validator = RegexValidator(
    regex=r"^[6-9]\d{9}$",
    message="Enter a valid 10-digit Indian mobile number.",
)


class CallScript(models.Model):
    """
    Configurable voice calling script with dynamic template placeholders:
    {customer_name}, {venue_name}, {city}, {event_type}, {event_date}, {guest_count}.
    """

    TRIGGER_CHOICES = [
        ("new_enquiry", "New Website Enquiry Submitted"),
        ("booking_pending", "Booking Awaiting Advance Payment"),
        ("booking_confirmed", "Booking Confirmed Welcome"),
        ("payment_reminder", "Balance Payment Reminder"),
        ("manual", "Manual Staff Trigger"),
    ]

    name = models.CharField(max_length=150)
    trigger_event = models.CharField(max_length=30, choices=TRIGGER_CHOICES, unique=True)
    script_template = models.TextField(
        help_text="Spoken text. Placeholders: {customer_name}, {venue_name}, {city}, {event_type}, {event_date}, {guest_count}."
    )
    voice_id = models.CharField(max_length=50, default="alloy", help_text="TTS voice model or provider voice key")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Voice Script Template"
        verbose_name_plural = "Voice Script Templates"

    def __str__(self) -> str:
        return f"{self.name} ({self.get_trigger_event_display()})"


class ContactOptOut(models.Model):
    """
    Do-Not-Call (DND) Registry. Any number in this table is strictly exempt from automated voice calls.
    """

    phone = models.CharField(max_length=15, unique=True, db_index=True)
    reason = models.CharField(max_length=150, default="user_opted_out_dtmf_9")
    opted_out_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-opted_out_at"]
        verbose_name = "Contact Opt-Out (DND)"
        verbose_name_plural = "Contact Opt-Outs (DND)"

    def __str__(self) -> str:
        return f"+91{self.phone} (Opted out on {self.opted_out_at.strftime('%Y-%m-%d')})"


class CallLog(models.Model):
    """
    Detailed audit log of an initiated or completed AI automated phone call.
    """

    STATUS_SCHEDULED = "scheduled"
    STATUS_INITIATING = "initiating"
    STATUS_RINGING = "ringing"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_COMPLETED = "completed"
    STATUS_BUSY = "busy"
    STATUS_NO_ANSWER = "no_answer"
    STATUS_FAILED = "failed"
    STATUS_OPTED_OUT = "opted_out"

    STATUS_CHOICES = [
        (STATUS_SCHEDULED, "Scheduled"),
        (STATUS_INITIATING, "Initiating"),
        (STATUS_RINGING, "Ringing"),
        (STATUS_IN_PROGRESS, "In Progress"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_BUSY, "Busy / Line Engaged"),
        (STATUS_NO_ANSWER, "No Answer"),
        (STATUS_FAILED, "Failed"),
        (STATUS_OPTED_OUT, "Blocked (Opted Out)"),
    ]

    recipient_name = models.CharField(max_length=150)
    recipient_phone = models.CharField(max_length=10, validators=[phone_validator], db_index=True)
    script = models.ForeignKey(CallScript, on_delete=models.SET_NULL, null=True, blank=True, related_name="call_logs")
    enquiry = models.ForeignKey("bookings.Enquiry", on_delete=models.SET_NULL, null=True, blank=True, related_name="voice_call_logs")
    booking = models.ForeignKey("bookings.Booking", on_delete=models.SET_NULL, null=True, blank=True, related_name="voice_call_logs")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_SCHEDULED, db_index=True)
    scheduled_for = models.DateTimeField(default=timezone.now)
    initiated_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)

    retry_count = models.PositiveSmallIntegerField(default=0)
    max_retries = models.PositiveSmallIntegerField(default=3)

    provider = models.CharField(max_length=30, default="mock", help_text="mock / vapi / twilio / bland_ai")
    provider_call_id = models.CharField(max_length=100, blank=True, db_index=True)

    rendered_speech = models.TextField(blank=True, help_text="Exact text script synthesized for this call")
    transcript = models.TextField(blank=True, help_text="Full two-way dialog transcript")
    recording_url = models.URLField(blank=True, max_length=500)
    dtmf_digits = models.CharField(max_length=10, blank=True, help_text="Keypad button presses captured (e.g. 1, 9)")

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Voice Call Log"
        verbose_name_plural = "Voice Call Logs"

    def __str__(self) -> str:
        return f"Call to {self.recipient_name} ({self.recipient_phone}) — {self.get_status_display()}"
