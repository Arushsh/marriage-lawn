"""
Throttle class for the enquiry endpoint.
5 POST requests per hour per IP (anonymous users).
"""

from rest_framework.throttling import AnonRateThrottle


class EnquiryRateThrottle(AnonRateThrottle):
    scope = "enquiry"
    # Rate is defined in settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['enquiry']
