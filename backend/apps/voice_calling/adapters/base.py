"""
Base interface for voice calling provider adapters.
"""

from abc import ABC, abstractmethod


class BaseVoiceProvider(ABC):
    """Abstract interface that all voice calling providers must implement."""

    @abstractmethod
    def initiate_call(self, call_log) -> dict:
        """
        Initiate outbound call. Returns { provider_call_id, status, error }.
        """
        pass

    @abstractmethod
    def check_call_status(self, provider_call_id: str) -> dict:
        """
        Query provider for status, duration, and transcript.
        """
        pass

    @abstractmethod
    def verify_webhook_signature(self, request_data: bytes, signature_header: str) -> bool:
        """
        Verify incoming webhook authenticity.
        """
        pass
