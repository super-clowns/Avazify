from __future__ import annotations

import calendar
from datetime import datetime
from decimal import Decimal

from django.db import transaction
from django.db.models import Count
from django.utils import timezone

from apps.accounts.models import User
from apps.music.models import StreamEvent
from apps.support.models import Notification

from .models import MonthlyArtistReport, PaymentTransaction

DURATION_DISCOUNTS = {1: 0, 3: 3, 6: 8, 12: 15}
UNIQUE_LISTENER_REWARD = Decimal("45")
STREAM_REWARD = Decimal("8.5")


def calculate_payment_amount(monthly_price: int, duration_months: int):
    discount = DURATION_DISCOUNTS[duration_months]
    gross = monthly_price * duration_months
    amount = round(gross * (100 - discount) / 100)
    return amount, discount


def add_months(value: datetime, months: int):
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


@transaction.atomic
def activate_subscription(transaction_obj: PaymentTransaction, reference_id: str):
    if transaction_obj.status == PaymentTransaction.Status.VERIFIED:
        return transaction_obj
    now = timezone.now()
    user = transaction_obj.user
    base = user.subscription_expires_at if user.subscription_expires_at and user.subscription_expires_at > now else now
    user.subscription_tier = transaction_obj.plan.tier
    user.subscription_expires_at = add_months(base, transaction_obj.duration_months)
    user.save(update_fields=["subscription_tier", "subscription_expires_at"])
    transaction_obj.status = PaymentTransaction.Status.VERIFIED
    transaction_obj.reference_id = reference_id
    transaction_obj.verified_at = now
    transaction_obj.save(update_fields=["status", "reference_id", "verified_at"])
    Notification.objects.create(
        user=user,
        title="اشتراک فعال شد",
        message=f"اشتراک {transaction_obj.plan.display_name} برای {transaction_obj.duration_months} ماه فعال شد.",
        kind=Notification.Kind.SUBSCRIPTION,
        link="/settings",
    )
    return transaction_obj


def generate_artist_reports(year: int, month: int):
    artists = User.objects.filter(role=User.Role.ARTIST, artist_status=User.ArtistStatus.APPROVED, is_active=True)
    results = []
    for artist in artists:
        events = StreamEvent.objects.filter(
            track__artist=artist,
            listened_at__year=year,
            listened_at__month=month,
        )
        aggregates = events.aggregate(
            streams=Count("id"),
            unique_listeners=Count("user_id", distinct=True),
        )
        streams = aggregates["streams"] or 0
        unique_listeners = aggregates["unique_listeners"] or 0
        reward = (Decimal(unique_listeners) * UNIQUE_LISTENER_REWARD + Decimal(streams) * STREAM_REWARD).quantize(Decimal("1"))
        report, _ = MonthlyArtistReport.objects.update_or_create(
            artist=artist,
            year=year,
            month=month,
            defaults={
                "streams": streams,
                "unique_listeners": unique_listeners,
                "reward": reward,
            },
        )
        results.append(report)
    return results
