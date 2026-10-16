"""
Django Admin for the AI FAQ Chatbot.
"""

from django.contrib import admin
from .models import ChatbotFAQ, ChatConversationLog


@admin.register(ChatbotFAQ)
class ChatbotFAQAdmin(admin.ModelAdmin):
    list_display = ["question", "intent_tag", "confidence_boost", "is_active", "order"]
    list_filter = ["intent_tag", "is_active"]
    list_editable = ["is_active", "order", "confidence_boost"]
    search_fields = ["question", "answer", "keywords"]
    ordering = ["order", "question"]

    fieldsets = [
        ("FAQ Content", {
            "fields": ["question", "answer", "intent_tag", "order", "is_active"]
        }),
        ("Keyword Matching & Tuning", {
            "fields": ["keywords", "confidence_boost"],
            "description": "Enter comma-separated keywords to increase match accuracy for user queries.",
        }),
    ]


@admin.register(ChatConversationLog)
class ChatConversationLogAdmin(admin.ModelAdmin):
    list_display = ["created_at", "session_id", "user_message_snippet", "matched_intent", "confidence_score"]
    list_filter = ["matched_intent", "created_at"]
    search_fields = ["session_id", "user_message", "bot_response"]
    readonly_fields = ["session_id", "user_message", "bot_response", "matched_intent", "matched_faq", "confidence_score", "user_ip", "created_at"]
    ordering = ["-created_at"]

    def user_message_snippet(self, obj):
        return obj.user_message[:60]
    user_message_snippet.short_description = "User Message"

    def has_add_permission(self, request):
        return False
