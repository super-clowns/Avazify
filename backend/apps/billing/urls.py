from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AdminBillingSummaryAPIView, MonthlyArtistReportViewSet, PaymentCreateAPIView, PaymentVerifyAPIView, SubscriptionPlanViewSet

router = DefaultRouter()
router.register("plans", SubscriptionPlanViewSet, basename="subscription-plan")
router.register("reports", MonthlyArtistReportViewSet, basename="monthly-report")

urlpatterns = [
    path("payments/create/", PaymentCreateAPIView.as_view(), name="payment-create"),
    path("payments/verify/", PaymentVerifyAPIView.as_view(), name="payment-verify"),
    path("admin-summary/", AdminBillingSummaryAPIView.as_view(), name="admin-billing-summary"),
] + router.urls
