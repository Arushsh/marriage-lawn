"""
Dashboard Views: Admin Executive Overview and JSON Metrics API.
"""

from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.http import JsonResponse
from .services import DashboardMetricsService


@staff_member_required
def admin_dashboard_view(request):
    """
    Renders executive metrics dashboard within the Django admin layout.
    """
    metrics = DashboardMetricsService.get_summary_metrics()
    context = {
        "title": "Executive Venue Operations Dashboard",
        "metrics": metrics,
        "site_header": "Marriage Lawn Operations",
    }
    return render(request, "admin/dashboard/index.html", context)


@staff_member_required
def api_dashboard_metrics_view(request):
    """
    JSON API returning current metrics for live auto-refresh or charts.
    """
    metrics = DashboardMetricsService.get_summary_metrics()
    # Serialize models in recent lists
    metrics["recent_enquiries"] = [
        {
            "id": e.pk,
            "name": e.name,
            "phone": e.phone,
            "event_type": e.get_event_type_display(),
            "event_date": str(e.event_date) if e.event_date else None,
            "status": e.status,
            "created_at": e.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for e in metrics["recent_enquiries"]
    ]
    metrics["recent_bookings"] = [
        {
            "reference": b.booking_reference,
            "customer": b.customer_name,
            "hall": b.hall.name,
            "event_date": str(b.event_date),
            "amount": str(b.base_amount),
            "status": b.status,
        }
        for b in metrics["recent_bookings"]
    ]
    metrics["recent_calls"] = [
        {
            "id": c.pk,
            "recipient": c.recipient_name,
            "phone": c.recipient_phone,
            "status": c.status,
            "duration": c.duration_seconds,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for c in metrics["recent_calls"]
    ]
    return JsonResponse(metrics)
