"""
Public API views for the AI FAQ Chatbot.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .serializers import ChatbotQuerySerializer, ChatbotResponseSerializer
from .engine import ChatbotEngine


def _get_client_ip(request) -> str:
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


class ChatbotQueryView(APIView):
    """
    POST /api/v1/chatbot/query/
    Accepts user question, matches intent/FAQ, queries live database, and returns formatted reply with suggestion chips.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ChatbotQuerySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "validation_error", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        result = ChatbotEngine.process_message(
            message=data["message"],
            session_id=data.get("session_id", "guest"),
            ip_address=_get_client_ip(request),
        )

        response_serializer = ChatbotResponseSerializer(result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class ChatbotSuggestionsView(APIView):
    """
    GET /api/v1/chatbot/suggestions/
    Returns default quick reply suggestion chips for the chat widget.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        suggestions = ChatbotEngine.get_quick_replies()
        return Response({"suggestions": suggestions}, status=status.HTTP_200_OK)
