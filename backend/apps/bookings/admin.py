"""Admin configuration for the bookings app."""

import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils import timezone

from .models import AvailabilityDate, Enquiry


# ─── AvailabilityDate ─────────────────────────────────────────────────────────

@admin.register(AvailabilityDate)
class AvailabilityDateAdmin(admin.ModelAdmin):
    list_display  = ["date", "status", "note", "updated_at"]
    list_editable = ["status"]
    list_filter   = ["status"]
    ordering      = ["date"]
    date_hierarchy = "date"

    def get_queryset(self, request):
        """Only show today and future dates in the list view."""
        return super().get_queryset(request).filter(date__gte=timezone.now().date())


# ─── Enquiry ──────────────────────────────────────────────────────────────────

def export_as_csv(modeladmin, request, queryset):
    """Action: export selected enquiries as CSV."""
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="enquiries.csv"'
    writer = csv.writer(response)
    writer.writerow(["ID", "Name", "Phone", "Email", "Event Type", "Event Date", "Guest Count", "Status", "Source", "Message", "Created At"])
    for obj in queryset:
        writer.writerow([
            obj.pk, obj.name, obj.phone, obj.email,
            obj.event_type, obj.event_date, obj.guest_count,
            obj.status, obj.source, obj.message,
            obj.created_at.strftime("%Y-%m-%d %H:%M"),
        ])
    return response

export_as_csv.short_description = "Export selected enquiries as CSV"


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display   = ["name", "phone", "event_type", "event_date", "guest_count", "status", "source", "created_at"]
    list_filter    = ["status", "event_type", "source"]
    search_fields  = ["name", "phone", "email", "message"]
    readonly_fields = ["name", "phone", "email", "event_type", "event_date", "guest_count", "message", "source", "ip_address", "created_at"]
    ordering       = ["-created_at"]
    date_hierarchy = "created_at"
    actions        = [export_as_csv]

    fieldsets = [
        ("Lead info", {
            "fields": ["name", "phone", "email", "event_type", "event_date", "guest_count", "message", "source"]
        }),
        ("CRM", {
            "fields": ["status", "owner_note"]
        }),
        ("Audit", {
            "fields": ["ip_address", "created_at"],
            "classes": ["collapse"],
        }),
    ]

    def has_add_permission(self, request):
        """Enquiries are created via the public API only, not the admin."""
        return False
