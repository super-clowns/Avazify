from __future__ import annotations

from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.shortcuts import redirect
from django.urls import reverse
from django.utils import timezone
from urllib.parse import urlencode
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from apps.accounts.models import User
from apps.common.permissions import IsAdminRole

from .gateways import get_gateway
from .models import MonthlyArtistReport, PaymentTransaction, SubscriptionPlan
from .serializers import (
    AdminBillingSummarySerializer,
    MonthlyArtistReportSerializer,
    PaymentCreateResponseSerializer,
    PaymentCreateSerializer,
    PaymentTransactionSerializer,
    PaymentVerifyResponseSerializer,
    ReportGenerateSerializer,
    SubscriptionPlanSerializer,
    SubscriptionPriceUpdateResponseSerializer,
    SubscriptionPriceUpdateSerializer,
)
from .services import activate_subscription, calculate_payment_amount, generate_artist_reports


def _payment_result_url(*, outcome: str, transaction_obj=None, message: str = ""):
    params = {"outcome": outcome}
    if transaction_obj is not None:
        params["transaction"] = str(transaction_obj.id)
        if transaction_obj.reference_id:
            params["reference"] = transaction_obj.reference_id
    if message:
        params["message"] = message
    return f"{settings.FRONTEND_URL.rstrip('/')}/payment/result?{urlencode(params)}"


def _wants_frontend_redirect(request):
    return str(request.query_params.get("redirect", "")).lower() in {"1", "true", "yes"}


@extend_schema(tags=["billing"])
class SubscriptionPlanViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = SubscriptionPlanSerializer
    queryset = SubscriptionPlan.objects.filter(active=True)

    @extend_schema(
        request=SubscriptionPriceUpdateSerializer,
        responses={200: SubscriptionPriceUpdateResponseSerializer},
        summary="به‌روزرسانی قیمت اشتراک‌ها",
        tags=["billing"],
    )
    @action(detail=False, methods=["patch"], permission_classes=[IsAdminRole])
    def prices(self, request):
        serializer = SubscriptionPriceUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        silver = serializer.validated_data["silver"]
        gold = serializer.validated_data["gold"]
        SubscriptionPlan.objects.filter(tier="silver").update(monthly_price=silver)
        SubscriptionPlan.objects.filter(tier="gold").update(monthly_price=gold)
        return Response({"success": True, "message": "قیمت اشتراک‌ها به‌روزرسانی شد.", "silver": silver, "gold": gold})


class PaymentCreateAPIView(APIView):
    @extend_schema(
        request=PaymentCreateSerializer,
        responses={201: PaymentCreateResponseSerializer, 200: PaymentCreateResponseSerializer},
        summary="ایجاد تراکنش خرید اشتراک",
        tags=["billing"],
    )
    @transaction.atomic
    def post(self, request):
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tier = serializer.validated_data["tier"]
        duration = int(serializer.validated_data["duration"])
        plan = SubscriptionPlan.objects.get(tier=tier, active=True)
        if tier == "free":
            request.user.subscription_tier = User.SubscriptionTier.FREE
            request.user.subscription_expires_at = None
            request.user.save(update_fields=["subscription_tier", "subscription_expires_at"])
            return Response({"success": True, "message": "اشتراک پایه فعال شد.", "status": "verified"})
        amount, discount = calculate_payment_amount(plan.monthly_price, duration)
        transaction_obj = PaymentTransaction.objects.create(
            user=request.user,
            plan=plan,
            duration_months=duration,
            amount=amount,
            discount_percent=discount,
            provider=settings.PAYMENT_PROVIDER,
        )
        gateway = get_gateway(transaction_obj.provider)
        callback_url = request.build_absolute_uri(reverse("payment-verify"))
        if gateway.name != "mock":
            callback_url = f"{callback_url}?redirect=1"
        try:
            gateway_result = gateway.request(transaction_obj, callback_url)
        except Exception as exc:
            transaction_obj.status = PaymentTransaction.Status.FAILED
            transaction_obj.metadata = {"error": str(exc)}
            transaction_obj.save(update_fields=["status", "metadata"])
            return Response({"success": False, "message": str(exc)}, status=502)
        transaction_obj.authority = gateway_result.authority
        transaction_obj.save(update_fields=["authority"])
        return Response({
            "success": True,
            "message": "تراکنش ایجاد شد؛ برای تکمیل پرداخت به درگاه منتقل شوید.",
            "paymentUrl": gateway_result.payment_url,
            "transaction": PaymentTransactionSerializer(transaction_obj).data,
        }, status=201)


class PaymentVerifyAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(name="Authority", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=True, description="شناسه مرجع درگاه پرداخت"),
            OpenApiParameter(name="Status", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False, description="وضعیت برگشتی درگاه، مانند OK"),
            OpenApiParameter(name="redirect", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, required=False, description="اگر true/1 باشد پس از Verify به صفحه نتیجه React هدایت می‌شود."),
        ],
        responses={200: PaymentVerifyResponseSerializer, 400: PaymentVerifyResponseSerializer, 404: PaymentVerifyResponseSerializer},
        summary="تأیید پرداخت و فعال‌سازی اشتراک",
        tags=["billing"],
    )
    def get(self, request):
        authority = request.query_params.get("Authority") or request.query_params.get("authority")
        status_value = request.query_params.get("Status") or request.query_params.get("status")
        wants_redirect = _wants_frontend_redirect(request)
        transaction_obj = PaymentTransaction.objects.filter(authority=authority).select_related("user", "plan").first()
        if not transaction_obj:
            message = "تراکنش پیدا نشد."
            if wants_redirect:
                return redirect(_payment_result_url(outcome="failed", message=message))
            return Response({"success": False, "message": message}, status=404)

        if transaction_obj.status == PaymentTransaction.Status.VERIFIED:
            if wants_redirect:
                return redirect(_payment_result_url(outcome="success", transaction_obj=transaction_obj, message="این تراکنش قبلاً تأیید شده است."))
            return Response({
                "success": True,
                "message": "این تراکنش قبلاً تأیید شده است.",
                "transaction": PaymentTransactionSerializer(transaction_obj).data,
            })

        if status_value and str(status_value).upper() not in {"OK", "VERIFIED"}:
            transaction_obj.status = PaymentTransaction.Status.CANCELLED
            transaction_obj.save(update_fields=["status"])
            message = "پرداخت لغو شد."
            if wants_redirect:
                return redirect(_payment_result_url(outcome="cancelled", transaction_obj=transaction_obj, message=message))
            return Response({"success": False, "message": message}, status=400)

        try:
            gateway = get_gateway(transaction_obj.provider)
            reference = gateway.verify(transaction_obj, authority)
            activate_subscription(transaction_obj, reference)
        except Exception as exc:
            transaction_obj.status = PaymentTransaction.Status.FAILED
            transaction_obj.metadata = {"error": str(exc)}
            transaction_obj.save(update_fields=["status", "metadata"])
            message = str(exc)
            if wants_redirect:
                return redirect(_payment_result_url(outcome="failed", transaction_obj=transaction_obj, message=message))
            return Response({"success": False, "message": message}, status=400)

        message = "پرداخت تأیید و اشتراک فعال شد."
        if wants_redirect:
            return redirect(_payment_result_url(outcome="success", transaction_obj=transaction_obj, message=message))
        return Response({"success": True, "message": message, "transaction": PaymentTransactionSerializer(transaction_obj).data})


@extend_schema(tags=["billing-reports"])
class MonthlyArtistReportViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = MonthlyArtistReportSerializer
    queryset = MonthlyArtistReport.objects.select_related("artist")
    ordering_fields = ("year", "month", "reward", "streams")
    ordering = ("-year", "-month")

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == User.Role.ADMIN:
            return queryset
        if self.request.user.role == User.Role.ARTIST:
            return queryset.filter(artist=self.request.user)
        return queryset.none()

    @extend_schema(
        request=None,
        responses={200: MonthlyArtistReportSerializer},
        summary="تسویه گزارش مالی هنرمند",
        tags=["billing-reports"],
    )
    @action(detail=True, methods=["post"], permission_classes=[IsAdminRole])
    def settle(self, request, pk=None):
        report = self.get_object()
        if report.status == MonthlyArtistReport.Status.SETTLED:
            return Response({"success": False, "message": "این رکورد قبلاً تسویه شده است."}, status=400)
        report.status = MonthlyArtistReport.Status.SETTLED
        report.settled_at = timezone.now()
        report.settled_by = request.user
        report.save(update_fields=["status", "settled_at", "settled_by"])
        return Response(MonthlyArtistReportSerializer(report).data)

    @extend_schema(
        request=ReportGenerateSerializer,
        responses={200: MonthlyArtistReportSerializer(many=True)},
        summary="تولید گزارش‌های مالی ماهانه",
        tags=["billing-reports"],
    )
    @action(detail=False, methods=["post"], permission_classes=[IsAdminRole], url_path="generate")
    def generate(self, request):
        now = timezone.localdate()
        serializer = ReportGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        year = serializer.validated_data.get("year", now.year)
        month = serializer.validated_data.get("month", now.month)
        reports = generate_artist_reports(year, month)
        return Response(MonthlyArtistReportSerializer(reports, many=True).data)


class AdminBillingSummaryAPIView(APIView):
    permission_classes = [IsAdminRole]

    @extend_schema(
        responses={200: AdminBillingSummarySerializer},
        summary="خلاصه مدیریتی اشتراک و درآمد",
        tags=["billing"],
    )
    def get(self, request):
        counts = {tier: User.objects.filter(role=User.Role.LISTENER, subscription_tier=tier, is_active=True).count() for tier in ["free", "silver", "gold"]}
        revenue = PaymentTransaction.objects.filter(status=PaymentTransaction.Status.VERIFIED, verified_at__year=timezone.localdate().year, verified_at__month=timezone.localdate().month).aggregate(total=Sum("amount"))["total"] or 0
        return Response({"subscriptions": counts, "monthlyRevenue": revenue})
