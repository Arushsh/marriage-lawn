"""Owner dashboard routes — mounted at /api/v1/owner/ (all staff-only)."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("halls", views.OwnerHallViewSet, basename="owner-halls")
router.register("facilities", views.OwnerFacilityViewSet, basename="owner-facilities")
router.register("packages", views.OwnerPackageViewSet, basename="owner-packages")
router.register("services", views.OwnerServiceViewSet, basename="owner-services")
router.register("menu-categories", views.OwnerMenuCategoryViewSet, basename="owner-menu-categories")
router.register("menu-items", views.OwnerMenuItemViewSet, basename="owner-menu-items")
router.register("reviews", views.OwnerReviewViewSet, basename="owner-reviews")
router.register("faqs", views.OwnerFAQViewSet, basename="owner-faqs")
router.register("gallery", views.OwnerGalleryViewSet, basename="owner-gallery")
router.register("videos", views.OwnerVideoLinkViewSet, basename="owner-videos")

urlpatterns = router.urls + [
    path("site/", views.OwnerSiteSettingsView.as_view(), name="owner-site"),
    path("availability/", views.OwnerAvailabilityView.as_view(), name="owner-availability"),
    path("availability/<str:date_str>/", views.OwnerAvailabilityDeleteView.as_view(), name="owner-availability-delete"),
    path("enquiries/", views.OwnerEnquiryListView.as_view(), name="owner-enquiries"),
    path("enquiries/<int:pk>/", views.OwnerEnquiryUpdateView.as_view(), name="owner-enquiry-update"),
    path("bookings/", views.OwnerBookingListView.as_view(), name="owner-bookings"),
    path("bookings/<str:reference>/", views.OwnerBookingUpdateView.as_view(), name="owner-booking-update"),
    path("stats/", views.OwnerStatsView.as_view(), name="owner-stats"),
]
