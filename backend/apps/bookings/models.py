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
        ("corporate",   "Corporate and Official Events"),
        ("anniversary", "Anniversary"),
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
    package     = models.ForeignKey(
        "venue.Package",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="enquiries",
        help_text="Selected package if enquired for a specific tier",
    )
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


# ─── Booking & Payment ────────────────────────────────────────────────────────

import secrets
from django.utils import timezone
from django.core.exceptions import ValidationError


def generate_booking_reference() -> str:
    """Generate human-readable, unique booking code, e.g. BK-202610-A9F2."""
    now_str = timezone.now().strftime("%Y%m")
    suffix = secrets.token_hex(2).upper()
    return f"BK-{now_str}-{suffix}"


class Booking(models.Model):
    """
    Online & offline reservation for lawn halls.
    Enforces server-side calculated pricing and concurrency-safe conflict prevention.
    """

    SLOT_FULL_DAY = "full_day"
    SLOT_MORNING = "morning"
    SLOT_EVENING = "evening"
    SLOT_CHOICES = [
        (SLOT_FULL_DAY, "Full Day (8:00 AM – 11:00 PM)"),
        (SLOT_MORNING, "Morning / Afternoon (8:00 AM – 3:00 PM)"),
        (SLOT_EVENING, "Evening / Night (4:00 PM – 12:00 AM)"),
    ]

    STATUS_PENDING = "pending_payment"
    STATUS_CONFIRMED = "confirmed"
    STATUS_CANCELLED = "cancelled"
    STATUS_COMPLETED = "completed"
    STATUS_REFUNDED = "refunded"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending Advance Payment"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_REFUNDED, "Refunded"),
    ]

    PAYMENT_STATUS_UNPAID = "unpaid"
    PAYMENT_STATUS_PARTIAL = "partial_advance"
    PAYMENT_STATUS_PAID = "fully_paid"
    PAYMENT_STATUS_REFUNDED = "refunded"
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_UNPAID, "Unpaid"),
        (PAYMENT_STATUS_PARTIAL, "Advance Paid"),
        (PAYMENT_STATUS_PAID, "Fully Paid"),
        (PAYMENT_STATUS_REFUNDED, "Refunded"),
    ]

    booking_reference = models.CharField(
        max_length=32,
        unique=True,
        default=generate_booking_reference,
        db_index=True,
    )
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=10, validators=[phone_validator], db_index=True)
    customer_email = models.EmailField(blank=True)

    hall = models.ForeignKey(
        "venue.Hall",
        on_delete=models.PROTECT,
        related_name="bookings",
        help_text="Primary hall or lawn reserved",
    )
    package = models.ForeignKey(
        "venue.Package",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
    )
    event_type = models.CharField(max_length=20, choices=Enquiry.EVENT_CHOICES, default="wedding")
    event_date = models.DateField(db_index=True)
    slot = models.CharField(max_length=15, choices=SLOT_CHOICES, default=SLOT_FULL_DAY)
    guest_count = models.PositiveIntegerField(default=300)

    # Server-side computed amounts
    base_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    advance_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Standard 30% advance required to block date",
    )
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Statuses
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default=PAYMENT_STATUS_UNPAID)
    payment_provider = models.CharField(max_length=20, default="mock", help_text="mock / razorpay / stripe")
    payment_order_id = models.CharField(max_length=100, blank=True)
    payment_transaction_id = models.CharField(max_length=100, blank=True)

    # Communication & Audit
    customer_notes = models.TextField(blank=True, max_length=500)
    admin_notes = models.TextField(blank=True)
    has_voice_consent = models.BooleanField(
        default=True,
        help_text="Customer consented to booking verification & reminder calls",
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-event_date", "-created_at"]
        verbose_name = "Online Booking"
        verbose_name_plural = "Online Bookings"
        constraints = [
            models.UniqueConstraint(
                fields=["event_date", "hall", "slot"],
                condition=models.Q(status__in=["pending_payment", "confirmed"]),
                name="unique_active_hall_booking_slot",
            )
        ]
        indexes = [
            models.Index(fields=["status", "event_date"]),
            models.Index(fields=["customer_phone"]),
        ]

    def __str__(self) -> str:
        return f"{self.booking_reference} — {self.customer_name} ({self.event_date})"

    def clean(self):
        super().clean()
        if self.event_date and self.event_date < timezone.now().date():
            raise ValidationError({"event_date": "Booking date cannot be in the past."})

    def save(self, *args, **kwargs):
        # Auto-compute advance and balance amounts if base_amount is set
        from decimal import Decimal
        if self.base_amount > 0 and self.advance_amount == 0:
            self.advance_amount = round(self.base_amount * Decimal("0.30"), 2)
        self.balance_amount = max(self.base_amount - self.paid_amount, Decimal("0.00"))
        super().save(*args, **kwargs)


class BookingPayment(models.Model):
    """Individual payment record linked to a booking with provider verification."""

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    provider = models.CharField(max_length=30, default="mock")
    order_id = models.CharField(max_length=100, blank=True)
    payment_id = models.CharField(max_length=100, blank=True)
    signature = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=False)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Booking Payment"
        verbose_name_plural = "Booking Payments"

    def __str__(self) -> str:
        return f"₹{self.amount} ({self.provider}) — Verified: {self.is_verified}"

