"""
Dashboard Aggregation Services: Venues, Packages, Enquiries, Bookings, Revenue, and AI Calls.
"""

from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.utils import timezone

from apps.venue.models import Hall, Package
from apps.bookings.models import Enquiry, Booking, AvailabilityDate
from apps.voice_calling.models import CallLog, ContactOptOut


class DashboardMetricsService:
    @classmethod
    def get_summary_metrics(cls) -> dict:
        today = timezone.now().date()

        # ── Venues & Packages ────────────────────────────────────────────────
        total_halls = Hall.objects.count()
        total_packages = Package.objects.count()

        # ── Enquiries Pipeline ───────────────────────────────────────────────
        enquiry_counts = Enquiry.objects.aggregate(
            total=Count("id"),
            new=Count("id", filter=Q(status="new")),
            contacted=Count("id", filter=Q(status="contacted")),
            visited=Count("id", filter=Q(status="visited")),
            booked=Count("id", filter=Q(status="booked")),
            lost=Count("id", filter=Q(status="lost")),
        )
        total_enquiries = enquiry_counts["total"] or 0
        booked_enquiries = enquiry_counts["booked"] or 0
        conversion_rate = round((booked_enquiries / total_enquiries * 100), 1) if total_enquiries > 0 else 0.0

        # ── Bookings & Revenue ───────────────────────────────────────────────
        booking_stats = Booking.objects.aggregate(
            total_bookings=Count("id"),
            confirmed_bookings=Count("id", filter=Q(status=Booking.STATUS_CONFIRMED)),
            pending_bookings=Count("id", filter=Q(status=Booking.STATUS_PENDING)),
            total_revenue=Sum("base_amount", filter=Q(status__in=[Booking.STATUS_CONFIRMED, Booking.STATUS_COMPLETED])),
            collected_advance=Sum("paid_amount"),
            outstanding_balance=Sum("balance_amount", filter=Q(status=Booking.STATUS_CONFIRMED)),
        )

        total_rev = booking_stats["total_revenue"] or Decimal("0.00")
        collected_adv = booking_stats["collected_advance"] or Decimal("0.00")
        outstanding_bal = booking_stats["outstanding_balance"] or Decimal("0.00")

        # ── Upcoming Dates ───────────────────────────────────────────────────
        blocked_dates_count = AvailabilityDate.objects.filter(
            date__gte=today,
            status=AvailabilityDate.STATUS_BOOKED,
        ).count()

        # ── AI Voice Calls ───────────────────────────────────────────────────
        call_stats = CallLog.objects.aggregate(
            total_calls=Count("id"),
            completed_calls=Count("id", filter=Q(status=CallLog.STATUS_COMPLETED)),
            opted_out_calls=Count("id", filter=Q(status=CallLog.STATUS_OPTED_OUT)),
            total_duration=Sum("duration_seconds"),
        )
        total_calls = call_stats["total_calls"] or 0
        completed_calls = call_stats["completed_calls"] or 0
        call_completion_rate = round((completed_calls / total_calls * 100), 1) if total_calls > 0 else 0.0
        opt_out_count = ContactOptOut.objects.count()

        # ── Recent Activity Feeds ────────────────────────────────────────────
        recent_enquiries = Enquiry.objects.select_related("package").order_by("-created_at")[:6]
        recent_bookings = Booking.objects.select_related("hall", "package").order_by("-created_at")[:6]
        recent_calls = CallLog.objects.order_by("-created_at")[:6]

        return {
            "venues": {
                "total_halls": total_halls,
                "total_packages": total_packages,
                "upcoming_blocked_dates": blocked_dates_count,
            },
            "enquiries": {
                "total": total_enquiries,
                "new": enquiry_counts["new"] or 0,
                "contacted": enquiry_counts["contacted"] or 0,
                "visited": enquiry_counts["visited"] or 0,
                "booked": booked_enquiries,
                "lost": enquiry_counts["lost"] or 0,
                "conversion_rate": conversion_rate,
            },
            "bookings": {
                "total": booking_stats["total_bookings"] or 0,
                "confirmed": booking_stats["confirmed_bookings"] or 0,
                "pending": booking_stats["pending_bookings"] or 0,
            },
            "revenue": {
                "total_revenue": f"{total_rev:,.2f}",
                "collected_advance": f"{collected_adv:,.2f}",
                "outstanding_balance": f"{outstanding_bal:,.2f}",
                "raw_total": float(total_rev),
                "raw_advance": float(collected_adv),
            },
            "voice_calls": {
                "total_calls": total_calls,
                "completed": completed_calls,
                "completion_rate": call_completion_rate,
                "total_duration_minutes": round((call_stats["total_duration"] or 0) / 60, 1),
                "opt_outs": opt_out_count,
            },
            "recent_enquiries": recent_enquiries,
            "recent_bookings": recent_bookings,
            "recent_calls": recent_calls,
        }
