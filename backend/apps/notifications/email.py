"""
Email notification helpers for the notifications app.

send_enquiry_notification() is called from a daemon thread in the bookings
view so it never blocks the HTTP response.

In DEBUG mode Django uses the console email backend (no real email sent).
In production the SMTP backend (Gmail by default) is used.
"""

import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_enquiry_notification(enquiry) -> None:
    """
    Send a plain-text email to the owner when a new enquiry is submitted.

    Args:
        enquiry: An apps.bookings.models.Enquiry instance.
    """

    notify_email = getattr(settings, "OWNER_NOTIFY_EMAIL", "")
    if not notify_email:
        logger.warning(
            "OWNER_NOTIFY_EMAIL not set; skipping notification for enquiry #%s", enquiry.pk
        )
        return

    # ── Try to get venue name ────────────────────────────────────────────────
    try:
        from apps.venue.models import SiteSettings
        venue_name = SiteSettings.objects.values_list("venue_name", flat=True).first() or "Your Venue"
    except Exception:
        venue_name = "Your Venue"

    subject = f"New Enquiry: {enquiry.name} ({enquiry.get_event_type_display()})"

    body_lines = [
        f"You have received a new enquiry on {venue_name}.",
        "",
        f"Name       : {enquiry.name}",
        f"Phone      : +91{enquiry.phone}",
    ]
    if enquiry.email:
        body_lines.append(f"Email      : {enquiry.email}")
    body_lines += [
        f"Event type : {enquiry.get_event_type_display()}",
    ]
    if enquiry.event_date:
        body_lines.append(f"Event date : {enquiry.event_date.strftime('%d %B %Y')}")
    if enquiry.guest_count:
        body_lines.append(f"Guests     : {enquiry.get_guest_count_display()}")
    if enquiry.message:
        body_lines += ["", f"Message    : {enquiry.message}"]

    body_lines += [
        "",
        "─────────────────────────────────",
        f"Submitted  : {enquiry.created_at.strftime('%d %b %Y %H:%M IST')}",
        f"Enquiry #  : {enquiry.pk}",
        "",
        "Log in to the admin to update the lead status:",
        f"  {getattr(settings, 'BACKEND_URL', '')}/private-admin/bookings/enquiry/{enquiry.pk}/change/",
    ]

    body = "\n".join(body_lines)

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notify_email],
            fail_silently=False,
        )
        logger.info("Enquiry notification sent for enquiry #%s", enquiry.pk)
    except Exception as exc:
        # Do not let email failure surface to the visitor
        logger.error("Failed to send enquiry notification for #%s: %s", enquiry.pk, exc)
