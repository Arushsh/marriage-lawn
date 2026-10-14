"""
Venue app models.

Models: SiteSettings (singleton), Hall, Facility, Package, Review, FAQ.
"""

from django.db import models
from django.core.exceptions import ValidationError


# ─── SiteSettings ─────────────────────────────────────────────────────────────

class SiteSettings(models.Model):
    """
    Singleton: holds all config-driven branding and contact data.
    Enforces max one row via save().
    """

    venue_name      = models.CharField(max_length=120)
    tagline         = models.CharField(max_length=240, blank=True)
    about_text      = models.TextField(blank=True)
    city            = models.CharField(max_length=80)
    address         = models.TextField()
    latitude        = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude       = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Contact
    phone           = models.CharField(max_length=20)
    whatsapp_number = models.CharField(max_length=20, help_text="With country code, e.g. 919876543210")
    email           = models.EmailField(blank=True)
    opening_hours   = models.CharField(max_length=200, blank=True, help_text="e.g. Mon–Sun 9 AM – 9 PM")

    # External links
    google_maps_url     = models.URLField(blank=True)
    google_reviews_url  = models.URLField(blank=True)
    instagram_url       = models.URLField(blank=True)
    facebook_url        = models.URLField(blank=True)
    youtube_url         = models.URLField(blank=True)

    # Social proof stats (shown in hero)
    rating_value        = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    rating_count        = models.PositiveIntegerField(default=0)
    weddings_hosted     = models.PositiveIntegerField(default=0)

    # Theme overrides (hex strings, e.g. "#7B1E3A")
    primary_color   = models.CharField(max_length=9, blank=True)
    accent_color    = models.CharField(max_length=9, blank=True)

    # Media
    logo        = models.ImageField(upload_to="site/", blank=True)
    hero_image  = models.ImageField(upload_to="site/", blank=True)
    hero_video_url = models.URLField(blank=True)

    # SEO
    meta_title       = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    # Lead notifications
    notify_email = models.EmailField(help_text="New lead alerts go here")

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self) -> str:
        return self.venue_name

    def save(self, *args, **kwargs) -> None:
        """Enforce singleton: only one SiteSettings row may exist."""
        if not self.pk and SiteSettings.objects.exists():
            raise ValidationError("Only one SiteSettings instance is allowed.")
        super().save(*args, **kwargs)


# ─── Hall ─────────────────────────────────────────────────────────────────────

class Hall(models.Model):
    """A physical hall or outdoor lawn at the venue."""

    name                = models.CharField(max_length=120)
    description         = models.TextField(blank=True)
    seating_capacity    = models.PositiveIntegerField(default=0)
    floating_capacity   = models.PositiveIntegerField(default=0)
    is_ac               = models.BooleanField(default=False, verbose_name="Air conditioned")
    image               = models.ImageField(upload_to="halls/", blank=True)
    order               = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Hall / Lawn"
        verbose_name_plural = "Halls / Lawns"

    def __str__(self) -> str:
        return self.name


# ─── Facility ─────────────────────────────────────────────────────────────────

class Facility(models.Model):
    """An individual facility offered (parking, bridal room, generator, etc.)."""

    name    = models.CharField(max_length=100)
    icon    = models.CharField(max_length=50, help_text="Icon key, e.g. 'parking', 'generator'")
    detail  = models.CharField(max_length=200, blank=True, help_text="Optional detail, e.g. '100 cars'")
    order   = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Facilities"

    def __str__(self) -> str:
        return self.name


# ─── Package ──────────────────────────────────────────────────────────────────

class Package(models.Model):
    """A service/price package offered to guests."""

    name        = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    price_from  = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Leave blank when show_price=False",
    )
    price_note  = models.CharField(
        max_length=200, blank=True,
        help_text="e.g. 'per event, varies by season and guest count'",
    )
    inclusions  = models.JSONField(
        default=list,
        help_text="List of included items, e.g. [\"Lawn\", \"Basic décor\"]",
    )
    is_popular  = models.BooleanField(default=False, help_text="Shows 'Most Popular' badge")
    show_price  = models.BooleanField(
        default=True,
        help_text="If False the frontend shows 'Get Quote' instead of the price",
    )
    order       = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self) -> str:
        return self.name


# ─── Review ───────────────────────────────────────────────────────────────────

class Review(models.Model):
    """A manually entered customer review (sourced from Google, Justdial, etc.)."""

    SOURCE_CHOICES = [
        ("google",    "Google"),
        ("justdial",  "Justdial"),
        ("other",     "Other"),
    ]

    author_name = models.CharField(max_length=100)
    rating      = models.PositiveSmallIntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        default=5,
    )
    text        = models.TextField()
    source      = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="google")
    date        = models.DateField()
    is_visible  = models.BooleanField(default=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"{self.author_name} ({self.rating}★)"


# ─── FAQ ──────────────────────────────────────────────────────────────────────

class FAQ(models.Model):
    """Frequently asked question shown in the accordion."""

    question    = models.CharField(max_length=300)
    answer      = models.TextField()
    order       = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self) -> str:
        return self.question[:80]
