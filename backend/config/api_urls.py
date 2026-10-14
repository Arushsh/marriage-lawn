"""
API v1 URL routes — all public endpoints.
Owner / dashboard routes are Phase 2 (JWT-protected).
"""

from django.urls import path
from apps.venue.views import (
    SiteSettingsView,
    HallListView,
    FacilityListView,
    PackageListView,
    ReviewListView,
    FAQListView,
)
from apps.media.views import GalleryImageListView, VideoLinkListView
from apps.bookings.views import AvailabilityView, EnquiryCreateView

urlpatterns = [
    # Venue / content
    path("site/",         SiteSettingsView.as_view(),    name="site-settings"),
    path("halls/",        HallListView.as_view(),        name="hall-list"),
    path("facilities/",   FacilityListView.as_view(),    name="facility-list"),
    path("packages/",     PackageListView.as_view(),     name="package-list"),
    path("reviews/",      ReviewListView.as_view(),      name="review-list"),
    path("faqs/",         FAQListView.as_view(),         name="faq-list"),

    # Media
    path("gallery/",      GalleryImageListView.as_view(), name="gallery-list"),
    path("videos/",       VideoLinkListView.as_view(),    name="video-list"),

    # Bookings
    path("availability/", AvailabilityView.as_view(),    name="availability"),
    path("enquiries/",    EnquiryCreateView.as_view(),   name="enquiry-create"),
]
