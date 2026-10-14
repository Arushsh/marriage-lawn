"""
Bookings app models: AvailabilityDate and Enquiry.
"""

from django.db import models
from django.core.validators import RegexValidator


# ─── AvailabilityDate ──────────────────────────────────────────────────────────

class AvailabilityDate(models.Model):
    """
    Stores only exceptions to the default 'available' state.
    Any date not in this table is considered available.
    Past dates are not shown on the frontend calendar.
    """

    STATUS_BOOKED    = "booked"
    STATUS_TENTATIVE = "tentative"
    STATUS_CHOICES   = [
        (STATUS_BOOKED,    "Booked"),
        (STATUS_TENTATIVE, "Tentative"),
    ]

    date       = models.DateField(unique=True, db_index=True)
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_BOOKED)
    note       = models.CharField(
        max_length=300, blank=True,
        help_text="Private note for the owner (not exposed via API)",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date"]
        verbose_name = "Availability Date"
        verbose_name_plural = "Availability Dates"
        indexes = [models.Index(fields=["date"])]

    def __str__(self) -> str:
        return f"{self.date} — {self.get_status_display()}"


# ─── Enquiry ──────────────────────────────────────────────────────────────────

phone_validator = RegexValidator(
    regex=r"^[6-9]\d{9}$",
    message="Enter a valid 10-digit Indian mobile number.",
)


class Enquiry(models.Model):
    """A visitor enquiry / lead submitted via the website form."""

    EVENT_CHOICES = [
        ("wedding",     "Wedding"),
        ("reception",   "Reception"),
        ("engagement",  "Engagement"),
        ("birthday",    "Birthday"),
        ("other",       "Other"),
    ]

    GUEST_COUNT_CHOICES = [
        ("under_200",   "Under 200"),
        ("200_500",     "200 – 500"),
        ("500_800",     "500 – 800"),
        ("800_1200",    "800 – 1,200"),
        ("above_1200",  "Above 1,200"),
    ]

    STATUS_CHOICES = [
        ("new",       "New"),
        ("contacted", "Contacted"),
        ("visited",   "Visited"),
        ("booked",    "Booked"),
        ("lost",      "Lost"),
    ]

    SOURCE_CHOICES = [
        ("website",   "Website form"),
        ("whatsapp",  "WhatsApp"),
        ("calendar",  "Calendar click"),
        ("other",     "Other"),
    ]

    # Visitor info
    name        = models.CharField(max_length=150)
    phone       = models.CharField(max_length=10, validators=[phone_validator], db_index=True)
    email       = models.EmailField(blank=True)

    # Event details
    event_type  = models.CharField(max_length=20, choices=EVENT_CHOICES, default="wedding")
    event_date  = models.DateField(null=True, blank=True)
    guest_count = models.CharField(max_length=20, choices=GUEST_COUNT_CHOICES, blank=True)
    message     = models.TextField(max_length=500, blank=True)

    # CRM
    status      = models.CharField(max_length=15, choices=STATUS_CHOICES, default="new", db_index=True)
    source      = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="website")
    owner_note  = models.TextField(blank=True)

    # Anti-spam / audit
    ip_address  = models.GenericIPAddressField(null=True, blank=True)

    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Enquiry / Lead"
        verbose_name_plural = "Enquiries / Leads"
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["phone"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.phone}) — {self.get_status_display()}"
