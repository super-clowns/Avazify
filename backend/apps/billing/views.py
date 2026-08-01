from __future__ import annotations

from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.urls import reverse
from django.utils import timezone
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.common.permissions import IsAdminRole

from .gateways import get_gateway
from .models import MonthlyArtistReport, PaymentTransaction, SubscriptionPlan
from .serializers import MonthlyArtistReportSerializer, PaymentCreateSerializer, PaymentTransactionSerializer, SubscriptionPlanSerializer
from .services import activate_subscription, calculate_payment_amount, generate_artist_reports


class SubscriptionPlanViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = SubscriptionPlanSerializer
    queryset = SubscriptionPlan.objects.filter(active=True)

    @action(detail=False, methods=["patch"], permission_classes=[IsAdminRole])
    def prices(self, request):
        try:
            silver = int(request.data.get("silver"))
            gold = int(request.data.get("gold"))
        except (TypeError, ValueError):
            return Response({"success": False, "message": "قیمت‌ها باید عدد صحیح باشند."}, status=400)
        if silver <= 0 or gold <= silver:
            return Response({"success": False, "message": "قیمت طلایی باید بیشتر از قیمت نقره‌ای و هر دو مثبت باشند."}, status=400)
        SubscriptionPlan.objects.filter(tier="silver").update(monthly_price=silver)
        SubscriptionPlan.objects.filter(tier="gold").update(monthly_price=gold)
        return Response({"success": True, "message": "قیمت اشتراک‌ها به‌روزرسانی شد.", "silver": silver, "gold": gold})


class PaymentCreateAPIView(APIView):
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
        gateway = get_gateway()
        callback_url = request.build_absolute_uri(reverse("payment-verify"))
        try:
            gateway_result = gateway.request(transaction_obj, callback_url)
        except Exception as exc:
            transaction_obj.status = PaymentTransaction.Status.FAILED
            transaction_obj.metadata = {"error": str(exc)}
            transaction_obj.save(update_fields=["status", "metadata"])
            return Response({"success": False, "message": str(exc)}, status=502)
        transaction_obj.authority = gateway_result.authority
        transaction_obj.save(update_fields=["authority"])
        if gateway.name == "mock":
            reference = gateway.verify(transaction_obj, gateway_result.authority)
            activate_subscription(transaction_obj, reference)
        return Response({
            "success": True,
            "message": "تراکنش ایجاد شد.",
            "paymentUrl": gateway_result.payment_url,
            "transaction": PaymentTransactionSerializer(transaction_obj).data,
        }, status=201)


class PaymentVerifyAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        authority = request.query_params.get("Authority") or request.query_params.get("authority")
        status_value = request.query_params.get("Status") or request.query_params.get("status")
        transaction_obj = PaymentTransaction.objects.filter(authority=authority).select_related("user", "plan").first()
        if not transaction_obj:
            return Response({"success": False, "message": "تراکنش پیدا نشد."}, status=404)
        if status_value and str(status_value).upper() not in {"OK", "VERIFIED"}:
            transaction_obj.status = PaymentTransaction.Status.CANCELLED
            transaction_obj.save(update_fields=["status"])
            return Response({"success": False, "message": "پرداخت لغو شد."}, status=400)
        try:
            reference = get_gateway().verify(transaction_obj, authority)
            activate_subscription(transaction_obj, reference)
        except Exception as exc:
            transaction_obj.status = PaymentTransaction.Status.FAILED
            transaction_obj.metadata = {"error": str(exc)}
            transaction_obj.save(update_fields=["status", "metadata"])
            return Response({"success": False, "message": str(exc)}, status=400)
        return Response({"success": True, "message": "پرداخت تأیید و اشتراک فعال شد.", "transaction": PaymentTransactionSerializer(transaction_obj).data})


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

    @action(detail=False, methods=["post"], permission_classes=[IsAdminRole], url_path="generate")
    def generate(self, request):
        now = timezone.localdate()
        year = int(request.data.get("year", now.year))
        month = int(request.data.get("month", now.month))
        reports = generate_artist_reports(year, month)
        return Response(MonthlyArtistReportSerializer(reports, many=True).data)


class AdminBillingSummaryAPIView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        counts = {tier: User.objects.filter(role=User.Role.LISTENER, subscription_tier=tier, is_active=True).count() for tier in ["free", "silver", "gold"]}
        revenue = PaymentTransaction.objects.filter(status=PaymentTransaction.Status.VERIFIED, verified_at__year=timezone.localdate().year, verified_at__month=timezone.localdate().month).aggregate(total=Sum("amount"))["total"] or 0
        return Response({"subscriptions": counts, "monthlyRevenue": revenue})
