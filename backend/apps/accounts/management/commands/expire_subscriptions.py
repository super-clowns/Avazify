from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.support.models import Notification


class Command(BaseCommand):
    help = "Downgrade expired paid subscriptions and notify affected users."

    def handle(self, *args, **options):
        expired = User.objects.filter(
            subscription_tier__in=[User.SubscriptionTier.SILVER, User.SubscriptionTier.GOLD],
            subscription_expires_at__lte=timezone.now(),
            is_active=True,
        )
        count = 0
        for user in expired.iterator():
            user.subscription_tier = User.SubscriptionTier.FREE
            user.subscription_expires_at = None
            user.save(update_fields=["subscription_tier", "subscription_expires_at"])
            Notification.objects.create(
                user=user,
                title="اشتراک شما به پایان رسید",
                message="اشتراک حساب به سطح پایه بازگشت. از تنظیمات می‌توانید آن را تمدید کنید.",
                kind=Notification.Kind.SUBSCRIPTION,
                link="/settings",
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f"Expired subscriptions processed: {count}"))
