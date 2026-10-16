"""
Chatbot Models: Admin-managed FAQs, Keywords, and Session Logs.
"""

from django.db import models


class ChatbotFAQ(models.Model):
    """
    Admin-managed FAQ knowledge item with keyword tags and intent categorization.
    """

    INTENT_CHOICES = [
        ("pricing", "Pricing & Packages"),
        ("availability", "Date Availability"),
        ("capacity", "Venue & Capacity"),
        ("catering", "Catering & Menu"),
        ("timing", "Timing & DJ Regulations"),
        ("booking", "Advance & Booking Policy"),
        ("parking_rooms", "Parking & Guest Rooms"),
        ("general", "General Information"),
    ]

    question = models.CharField(max_length=300)
    answer = models.TextField(help_text="Detailed answer returned to user. Supports placeholders {venue_name}, {city}, etc.")
    keywords = models.CharField(
        max_length=400,
        help_text="Comma-separated keywords (e.g. 'caterer, outside food, kitchen, dining')",
        blank=True,
    )
    intent_tag = models.CharField(
        max_length=30,
        choices=INTENT_CHOICES,
        default="general",
        db_index=True,
    )
    confidence_boost = models.IntegerField(
        default=0,
        help_text="Bonus score points when any keyword matches exactly.",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "question"]
        verbose_name = "Chatbot FAQ & Intent"
        verbose_name_plural = "Chatbot FAQs & Intents"

    def __str__(self) -> str:
        return f"[{self.get_intent_tag_display()}] {self.question}"


class ChatConversationLog(models.Model):
    """Logs visitor queries and bot responses for audit and NLP intent refinement."""

    session_id = models.CharField(max_length=64, db_index=True)
    user_message = models.TextField()
    bot_response = models.TextField()
    matched_intent = models.CharField(max_length=50, blank=True)
    matched_faq = models.ForeignKey(
        ChatbotFAQ,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="logs",
    )
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    user_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Chat Conversation Log"
        verbose_name_plural = "Chat Conversation Logs"

    def __str__(self) -> str:
        return f"{self.session_id[:8]} — {self.user_message[:40]}"
