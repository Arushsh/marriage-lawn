"""
API v1 URL routes.

Public read endpoints + booking/enquiry creation are open; everything under
owner/ requires a staff JWT (the website /admin dashboard), and auth/ issues
those tokens.
"""

from django.urls import include, path
from apps.venue.views import (
    SiteSettingsView,
    HallListView,
    FacilityListView,
    PackageListView,
    ReviewListView,
    FAQListView,
    MenuCategoryListView,
    ServiceListView,
)
from apps.media.views import GalleryImageListView, VideoLinkListView
from apps.bookings.views import (
    AvailabilityView,
    EnquiryCreateView,
    BookingCreateView,
    BookingDetailView,
    BookingPaymentVerifyView,
)
from apps.chatbot.views import ChatbotQueryView, ChatbotSuggestionsView
from apps.voice_calling.views import VoiceWebhookView, VoiceCallTriggerView, VoiceCallbackRequestView
from apps.dashboard.views import api_dashboard_metrics_view
from apps.owner import urls as owner_urls
from apps.owner.auth_views import OwnerLoginView, OwnerMeView, OwnerRefreshView

urlpatterns = [
    # Owner dashboard auth (JWT)
    path("auth/login/",  OwnerLoginView.as_view(),  name="auth-login"),
    path("auth/refresh/", OwnerRefreshView.as_view(), name="auth-refresh"),
    path("auth/me/",     OwnerMeView.as_view(),     name="auth-me"),

    # Owner / dashboard routes (staff JWT required)
    path("owner/", include(owner_urls)),

    # Venue / content
    path("site/",         SiteSettingsView.as_view(),       name="site-settings"),
    path("halls/",        HallListView.as_view(),           name="hall-list"),
    path("facilities/",   FacilityListView.as_view(),       name="facility-list"),
    path("packages/",     PackageListView.as_view(),        name="package-list"),
    path("reviews/",      ReviewListView.as_view(),         name="review-list"),
    path("faqs/",         FAQListView.as_view(),            name="faq-list"),
    path("menu/",         MenuCategoryListView.as_view(),   name="menu-list"),
    path("services/",     ServiceListView.as_view(),        name="service-list"),

    # Media
    path("gallery/",      GalleryImageListView.as_view(),   name="gallery-list"),
    path("videos/",       VideoLinkListView.as_view(),      name="video-list"),

    # Bookings & Reservations
    path("availability/", AvailabilityView.as_view(),       name="availability"),
    path("enquiries/",    EnquiryCreateView.as_view(),      name="enquiry-create"),
    path("bookings/",     BookingCreateView.as_view(),      name="booking-create"),
    path("bookings/<str:reference>/", BookingDetailView.as_view(), name="booking-detail"),
    path("bookings/<str:reference>/verify-payment/", BookingPaymentVerifyView.as_view(), name="booking-verify-payment"),

    # Chatbot
    path("chatbot/query/",       ChatbotQueryView.as_view(),       name="chatbot-query"),
    path("chatbot/suggestions/", ChatbotSuggestionsView.as_view(), name="chatbot-suggestions"),

    # AI Voice Calling
    path("voice/webhook/<str:provider>/", VoiceWebhookView.as_view(),           name="voice-webhook"),
    path("voice/trigger/",                VoiceCallTriggerView.as_view(),       name="voice-trigger"),
    path("voice/callback-request/",       VoiceCallbackRequestView.as_view(),   name="voice-callback-request"),

    # Executive Dashboard
    path("dashboard/metrics/", api_dashboard_metrics_view, name="dashboard-metrics-api"),
]
