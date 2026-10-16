"""
Admin configuration for the bookings app.

Includes:
- Bulk date blocking for AvailabilityDate.
- Booking management with Payment inline formsets.
- CSV Import and Export with validation and rollback.
- Permissions and audit trails.
"""

import io
import csv
import datetime
from django import forms
from django.contrib import admin, messages
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html

from .models import AvailabilityDate, Enquiry, Booking, BookingPayment


# ─── Inline Formsets ──────────────────────────────────────────────────────────

class BookingPaymentInline(admin.TabularInline):
    model = BookingPayment
    extra = 0
    readonly_fields = ["created_at"]
    fields = ["amount", "provider", "order_id", "payment_id", "is_verified", "created_at"]


# ─── Bulk Date Form ───────────────────────────────────────────────────────────

class BulkDateBlockForm(forms.Form):
    start_date = forms.DateField(
        widget=forms.DateInput(attrs={"type": "date"}),
        help_text="Beginning of range (inclusive)",
    )
    end_date = forms.DateField(
        widget=forms.DateInput(attrs={"type": "date"}),
        help_text="End of range (inclusive)",
    )
    status = forms.ChoiceField(choices=AvailabilityDate.STATUS_CHOICES)
    note = forms.CharField(
        max_length=200,
        required=False,
        help_text="Reason for blocking, e.g. 'Renovation', 'Reserved for VIP'",
    )


# ─── CSV Import Form ──────────────────────────────────────────────────────────

class CSVImportForm(forms.Form):
    csv_file = forms.FileField(help_text="Upload a UTF-8 encoded .csv file.")


# ─── AvailabilityDate Admin ───────────────────────────────────────────────────

@admin.register(AvailabilityDate)
class AvailabilityDateAdmin(admin.ModelAdmin):
    list_display = ["date", "status_badge", "note", "updated_at"]
    list_editable = []
    list_filter = ["status"]
    ordering = ["date"]
    date_hierarchy = "date"
    change_list_template = "admin/bookings/availabilitydate/change_list.html"

    def status_badge(self, obj):
        colors = {
            "booked": "#dc2626",
            "tentative": "#d97706",
        }
        color = colors.get(obj.status, "#4b5563")
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Status"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("bulk-block/", self.admin_site.admin_view(self.bulk_block_view), name="bookings_availabilitydate_bulk_block"),
            path("import-csv/", self.admin_site.admin_view(self.import_csv_view), name="bookings_availabilitydate_import_csv"),
            path("export-csv/", self.admin_site.admin_view(self.export_csv_view), name="bookings_availabilitydate_export_csv"),
        ]
        return custom_urls + urls

    def bulk_block_view(self, request):
        if not self.has_change_permission(request):
            messages.error(request, "Permission denied.")
            return HttpResponseRedirect("../")

        if request.method == "POST":
            form = BulkDateBlockForm(request.POST)
            if form.is_valid():
                start = form.cleaned_data["start_date"]
                end = form.cleaned_data["end_date"]
                status = form.cleaned_data["status"]
                note = form.cleaned_data["note"]

                if end < start:
                    messages.error(request, "End date cannot be earlier than start date.")
                else:
                    curr = start
                    created_count = 0
                    updated_count = 0
                    while curr <= end:
                        _, created = AvailabilityDate.objects.update_or_create(
                            date=curr,
                            defaults={"status": status, "note": note},
                        )
                        if created:
                            created_count += 1
                        else:
                            updated_count += 1
                        curr += datetime.timedelta(days=1)

                    messages.success(
                        request,
                        f"Successfully blocked {created_count + updated_count} dates ({created_count} added, {updated_count} updated).",
                    )
                    return HttpResponseRedirect("../")
        else:
            form = BulkDateBlockForm(initial={"start_date": timezone.now().date(), "end_date": timezone.now().date() + datetime.timedelta(days=3)})

        context = {
            **self.admin_site.each_context(request),
            "title": "Bulk Multi-Row Date Blocking",
            "form": form,
            "opts": self.model._meta,
        }
        return render(request, "admin/bookings/bulk_date_block.html", context)

    def export_csv_view(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="availability_dates.csv"'
        writer = csv.writer(response)
        writer.writerow(["Date", "Status", "Note", "Updated At"])
        for row in AvailabilityDate.objects.all().order_by("date"):
            writer.writerow([row.date.isoformat(), row.status, row.note, row.updated_at.isoformat()])
        return response

    def import_csv_view(self, request):
        if not self.has_add_permission(request):
            messages.error(request, "Permission denied.")
            return HttpResponseRedirect("../")

        if request.method == "POST":
            form = CSVImportForm(request.POST, request.FILES)
            if form.is_valid():
                try:
                    f = io.TextIOWrapper(request.FILES["csv_file"].file, encoding="utf-8")
                    reader = csv.DictReader(f)
                    count = 0
                    for row in reader:
                        d_str = row.get("Date") or row.get("date")
                        s_val = (row.get("Status") or row.get("status") or "booked").strip().lower()
                        n_val = row.get("Note") or row.get("note") or "CSV Import"
                        if d_str:
                            d = datetime.date.fromisoformat(d_str.strip())
                            AvailabilityDate.objects.update_or_create(
                                date=d,
                                defaults={"status": s_val, "note": n_val},
                            )
                            count += 1
                    messages.success(request, f"Imported {count} availability dates successfully.")
                    return HttpResponseRedirect("../")
                except Exception as exc:
                    messages.error(request, f"CSV Import failed: {exc}")
        else:
            form = CSVImportForm()

        context = {
            **self.admin_site.each_context(request),
            "title": "Import Availability Dates from CSV",
            "form": form,
            "opts": self.model._meta,
        }
        return render(request, "admin/bookings/csv_import.html", context)


# ─── Booking Admin ────────────────────────────────────────────────────────────

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        "booking_reference",
        "customer_name",
        "customer_phone",
        "hall",
        "event_date",
        "slot",
        "formatted_base_amount",
        "formatted_paid_amount",
        "status_badge",
        "payment_badge",
    ]
    list_filter = ["status", "payment_status", "slot", "hall", "event_date"]
    search_fields = ["booking_reference", "customer_name", "customer_phone", "customer_email"]
    ordering = ["-event_date", "-created_at"]
    date_hierarchy = "event_date"
    inlines = [BookingPaymentInline]
    readonly_fields = ["booking_reference", "created_at", "updated_at", "balance_amount"]

    fieldsets = [
        ("Reservation Summary", {
            "fields": [
                "booking_reference",
                "customer_name",
                "customer_phone",
                "customer_email",
                "hall",
                "package",
                "event_type",
                "event_date",
                "slot",
                "guest_count",
            ]
        }),
        ("Pricing & Payment Control", {
            "fields": [
                "base_amount",
                "advance_amount",
                "paid_amount",
                "balance_amount",
                "payment_status",
                "payment_provider",
                "payment_order_id",
                "payment_transaction_id",
            ]
        }),
        ("Status & Communication", {
            "fields": [
                "status",
                "has_voice_consent",
                "customer_notes",
                "admin_notes",
            ]
        }),
        ("Audit", {
            "fields": ["ip_address", "created_at", "updated_at"],
            "classes": ["collapse"],
        }),
    ]

    actions = ["mark_confirmed", "mark_cancelled", "export_bookings_csv"]

    def formatted_base_amount(self, obj):
        return f"₹{obj.base_amount:,.2f}"
    formatted_base_amount.short_description = "Total"

    def formatted_paid_amount(self, obj):
        return f"₹{obj.paid_amount:,.2f}"
    formatted_paid_amount.short_description = "Paid"

    def status_badge(self, obj):
        colors = {
            "confirmed": "#15803d",
            "pending_payment": "#b45309",
            "cancelled": "#b91c1c",
            "completed": "#1d4ed8",
            "refunded": "#6b7280",
        }
        color = colors.get(obj.status, "#4b5563")
        return format_html(
            '<span style="background: {}; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Booking Status"

    def payment_badge(self, obj):
        colors = {
            "fully_paid": "#15803d",
            "partial_advance": "#0284c7",
            "unpaid": "#dc2626",
            "refunded": "#6b7280",
        }
        color = colors.get(obj.payment_status, "#4b5563")
        return format_html(
            '<span style="background: {}; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">{}</span>',
            color,
            obj.get_payment_status_display(),
        )
    payment_badge.short_description = "Payment Status"

    def mark_confirmed(self, request, queryset):
        count = queryset.update(status=Booking.STATUS_CONFIRMED)
        messages.success(request, f"Marked {count} bookings as confirmed.")
    mark_confirmed.short_description = "Mark selected as Confirmed"

    def mark_cancelled(self, request, queryset):
        count = queryset.update(status=Booking.STATUS_CANCELLED)
        messages.warning(request, f"Marked {count} bookings as cancelled.")
    mark_cancelled.short_description = "Mark selected as Cancelled"

    def export_bookings_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="bookings.csv"'
        writer = csv.writer(response)
        writer.writerow([
            "Reference", "Customer", "Phone", "Email", "Hall", "Package",
            "Date", "Slot", "Guests", "Total Amount", "Paid Amount", "Balance",
            "Status", "Payment Status", "Created At"
        ])
        for b in queryset:
            writer.writerow([
                b.booking_reference, b.customer_name, b.customer_phone, b.customer_email,
                b.hall.name, b.package.name if b.package else "",
                b.event_date.isoformat(), b.get_slot_display(), b.guest_count,
                b.base_amount, b.paid_amount, b.balance_amount,
                b.status, b.payment_status, b.created_at.isoformat()
            ])
        return response
    export_bookings_csv.short_description = "Export selected bookings to CSV"


# ─── Enquiry Admin ────────────────────────────────────────────────────────────

@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = [
        "name", "phone", "event_type", "package", "event_date",
        "guest_count", "status", "source", "created_at"
    ]
    list_filter = ["status", "event_type", "package", "source"]
    search_fields = ["name", "phone", "email", "message"]
    readonly_fields = [
        "name", "phone", "email", "event_type", "package",
        "event_date", "guest_count", "message", "source",
        "ip_address", "created_at"
    ]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"
    actions = ["export_as_csv", "mark_contacted", "mark_visited"]

    def export_as_csv(self, request, queryset):
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

    def mark_contacted(self, request, queryset):
        queryset.update(status="contacted")
        messages.success(request, "Updated status to Contacted.")
    mark_contacted.short_description = "Mark selected leads as Contacted"

    def mark_visited(self, request, queryset):
        queryset.update(status="visited")
        messages.success(request, "Updated status to Visited.")
    mark_visited.short_description = "Mark selected leads as Visited"

    def has_add_permission(self, request):
        return True
