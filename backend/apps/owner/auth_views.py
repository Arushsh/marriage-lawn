"""
JWT auth endpoints for the owner dashboard SPA.

Bearer tokens (not cookies) are used deliberately: the Next.js frontend on
Vercel and this API on Render are cross-origin, and browsers increasingly
block third-party cookies.  Contract matches docs/API.md.
"""

from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import OwnerUserSerializer


class OwnerTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login only for staff accounts; embeds user info in the response."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_staff:
            raise serializers.ValidationError(
                "This account does not have dashboard access."
            )
        data["user"] = OwnerUserSerializer(self.user).data
        return data


class OwnerLoginView(TokenObtainPairView):
    serializer_class = OwnerTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_login"


class OwnerRefreshView(TokenRefreshView):
    """Standard refresh; rotation + blacklist handled by SIMPLE_JWT settings."""


class OwnerMeView(APIView):
    """Current authenticated user profile (token introspection for the SPA)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(OwnerUserSerializer(request.user).data)
