from __future__ import annotations

import uuid
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.db.models import Q


class SubscriptionPlan(models.Model):
    class Tier(models.TextChoices):
        FREE = "free", "Free"
        SILVER = "silver", "Silver"
        GOLD = "gold", "Gold"

    tier = models.CharField(primary_key=True, max_length=12, choices=Tier.choices)
    display_name = models.CharField(max_length=80)
    monthly_price = models.PositiveBigIntegerField(default=0)
    daily_stream_limit = models.PositiveIntegerField(null=True, blank=True)
    playlist_limit = models.PositiveIntegerField(null=True, blank=True)
    can_upload_avatar = models.BooleanField(default=False)
    can_download = models.BooleanField(default=False)
    early_access = models.BooleanField(default=False)
    analytics_access = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["monthly_price"]


class PaymentTransaction(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_transactions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name="transactions")
    duration_months = models.PositiveSmallIntegerField()
    amount = models.PositiveBigIntegerField()
    discount_percent = models.PositiveSmallIntegerField(default=0)
    provider = models.CharField(max_length=40, default="mock")
    authority = models.CharField(max_length=150, blank=True)
    reference_id = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(condition=Q(duration_months__in=[1, 3, 6, 12]), name="valid_subscription_duration")
        ]


class MonthlyArtistReport(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SETTLED = "settled", "Settled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="monthly_reports")
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField()
    unique_listeners = models.PositiveIntegerField(default=0)
    streams = models.PositiveIntegerField(default=0)
    reward = models.DecimalField(max_digits=18, decimal_places=0, default=Decimal("0"))
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING, db_index=True)
    calculated_at = models.DateTimeField(auto_now=True)
    settled_at = models.DateTimeField(null=True, blank=True)
    settled_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="settled_reports")

    class Meta:
        ordering = ["-year", "-month", "artist__display_name"]
        constraints = [
            models.UniqueConstraint(fields=["artist", "year", "month"], name="unique_artist_monthly_report"),
            models.CheckConstraint(condition=Q(month__gte=1, month__lte=12), name="valid_report_month"),
        ]
