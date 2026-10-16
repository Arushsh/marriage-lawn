"""Media app models: GalleryImage and VideoLink."""

from django.db import models


class GalleryImage(models.Model):
    """Photo for the venue gallery with category tags."""

    CATEGORY_CHOICES = [
        ("lawn", "Lawn"),
        ("mandap", "Mandap"),
        ("dining", "Dining"),
        ("rooms", "Rooms"),
        ("decor", "Decor"),
        ("night", "Night"),
        ("other", "Other"),
    ]

    image = models.ImageField(upload_to="gallery/", max_length=500)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="other",
        db_index=True,
    )
    caption = models.CharField(max_length=200, blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    is_featured = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Featured photos show up in the homepage gallery preview",
    )
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Gallery Image"
        verbose_name_plural = "Gallery Images"

    def __str__(self) -> str:
        return self.caption or f"Gallery image {self.pk} ({self.get_category_display()})"


class VideoLink(models.Model):
    """Link to video walkthroughs (YouTube/Vimeo/Cloudinary)."""

    title = models.CharField(max_length=150)
    url = models.URLField(max_length=500)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Video Link"
        verbose_name_plural = "Video Links"

    def __str__(self) -> str:
        return self.title
