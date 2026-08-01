from __future__ import annotations

from django.db.models import Q
from django.utils import timezone

from apps.accounts.models import User
from apps.billing.models import SubscriptionPlan

from .models import StreamEvent, Track


def accessible_tracks_for(user):
    queryset = Track.objects.filter(is_published=True)
    if not user or not user.is_authenticated:
        return queryset.filter(early_access=False)
    if user.effective_subscription_tier == User.SubscriptionTier.GOLD:
        return queryset
    return queryset.filter(Q(early_access=False) | Q(artist=user))


def can_stream(user, track):
    if track.early_access and user.effective_subscription_tier != User.SubscriptionTier.GOLD and track.artist_id != user.id:
        return False, "این اثر فعلاً فقط برای کاربران طلایی در دسترس است."
    plan = SubscriptionPlan.objects.filter(tier=user.effective_subscription_tier, active=True).first()
    limit = plan.daily_stream_limit if plan else (60 if user.effective_subscription_tier == User.SubscriptionTier.FREE else None)
    if limit is not None:
        count = StreamEvent.objects.filter(user=user, listened_at__date=timezone.localdate()).count()
        if count >= limit:
            return False, "سقف استریم روزانه اشتراک شما تکمیل شده است."
    return True, ""
