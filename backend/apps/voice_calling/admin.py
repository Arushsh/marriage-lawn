"""
Django Admin for Voice Calling.
"""

from django.contrib import admin, messages
from django.utils.html import format_html
from .models import CallScript, ContactOptOut, CallLog
from .services import VoiceCallingService


@admin.register(CallScript)
class CallScriptAdmin(admin.ModelAdmin):
    list_display = ["name", "trigger_event", "voice_id", "is_active", "updated_at"]
    list_filter = ["trigger_event", "is_active"]
    search_fields = ["name", "script_template"]


@admin.register(ContactOptOut)
class ContactOptOutAdmin(admin.ModelAdmin):
    list_display = ["phone", "reason", "opted_out_at"]
    search_fields = ["phone", "reason"]
    ordering = ["-opted_out_at"]


@admin.register(CallLog)
class CallLogAdmin(admin.ModelAdmin):
    list_display = [
        "created_at",
        "recipient_name",
        "recipient_phone",
        "status_badge",
        "provider",
        "duration_display",
        "has_recording",
    ]
    list_filter = ["status", "provider", "created_at"]
    search_fields = ["recipient_name", "recipient_phone", "provider_call_id", "transcript"]
    readonly_fields = [
        "recipient_name",
        "recipient_phone",
        "script",
        "enquiry",
        "booking",
        "status",
        "provider",
        "provider_call_id",
        "duration_seconds",
        "rendered_speech",
        "transcript",
        "recording_url",
        "dtmf_digits",
        "created_at",
    ]
    actions = ["retry_selected_calls"]

    def status_badge(self, obj):
        colors = {
            "completed": "#15803d",
            "in_progress": "#0284c7",
            "ringing": "#b45309",
            "initiating": "#ca8a04",
            "scheduled": "#4b5563",
            "failed": "#dc2626",
            "opted_out": "#6b7280",
        }
        color = colors.get(obj.status, "#4b5563")
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 8px;border-radius:4px;font-weight:600;font-size:11px;">{}</span>',
            color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Call Status"

    def duration_display(self, obj):
        return f"{obj.duration_seconds}s"
    duration_display.short_description = "Duration"

    def has_recording(self, obj):
        if obj.recording_url:
            return format_html('<a href="{}" target="_blank" style="color:#0284c7;font-weight:600;"><i class="fas fa-play-circle mr-1"></i>Listen</a>', obj.recording_url)
        return "—"
    has_recording.short_description = "Audio"

    def retry_selected_calls(self, request, queryset):
        retried = 0
        for log in queryset:
            if log.status in (CallLog.STATUS_FAILED, CallLog.STATUS_NO_ANSWER, CallLog.STATUS_BUSY):
                VoiceCallingService.trigger_call(
                    recipient_name=log.recipient_name,
                    recipient_phone=log.recipient_phone,
                    trigger_event=log.script.trigger_event if log.script else "manual",
                    enquiry=log.enquiry,
                    booking=log.booking,
                    provider_name=log.provider,
                )
                retried += 1
        messages.success(request, f"Re-dispatched {retried} calls.")
    retry_selected_calls.short_description = "Retry selected failed calls"
