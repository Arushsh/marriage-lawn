from rest_framework import serializers


class ChatbotQuerySerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=64, default="guest-session")
    message = serializers.CharField(max_length=500)


class ChatbotResponseSerializer(serializers.Serializer):
    reply = serializers.CharField()
    intent = serializers.CharField()
    matched_faq_id = serializers.IntegerField(allow_null=True)
    suggestions = serializers.ListField(child=serializers.CharField())
    dynamic_data = serializers.DictField()
