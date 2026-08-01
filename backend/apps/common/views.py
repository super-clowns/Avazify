from __future__ import annotations

from django.conf import settings
from django.core.management import call_command
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import ArtistApplication, User
from apps.accounts.serializers import ArtistApplicationSerializer, UserSerializer
from apps.billing.models import MonthlyArtistReport, PaymentTransaction, SubscriptionPlan
from apps.billing.serializers import MonthlyArtistReportSerializer
from apps.common.permissions import IsAdminRole
from apps.music.models import Album, Playlist
from apps.music.serializers import AlbumSerializer, PlaylistSerializer, TrackSerializer
from apps.music.services import accessible_tracks_for
from apps.recommendations.services import recommend_tracks
from apps.support.models import Notification, Ticket
from apps.support.serializers import NotificationSerializer, TicketSerializer


class HealthAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok", "service": "avazify-api", "version": "2.0.0"})


class BootstrapAPIView(APIView):
    """Return the role-aware data needed to hydrate the React application.

    Aggregation belongs to the backend so the frontend receives display-ready
    values rather than downloading raw rows and calculating reports itself.
    """

    def get(self, request):
        user = request.user
        tracks = (
            accessible_tracks_for(user)
            .select_related("artist", "album")
            .annotate(
                streams_count=Count("stream_events"),
                listeners_count=Count("stream_events__user", distinct=True),
            )
        )
        albums = (
            Album.objects.filter(tracks__in=tracks, tracks__is_published=True)
            .select_related("artist")
            .distinct()
        )
        users = (
            User.objects.filter(is_active=True)
            .select_related("preferences")
            .prefetch_related("followed_users", "artist_application__portfolio_items")
        )
        playlists = Playlist.objects.filter(user=user).prefetch_related("playlist_tracks")
        notifications = Notification.objects.filter(user=user)

        if user.role in {User.Role.SUPPORT, User.Role.ADMIN}:
            tickets = Ticket.objects.all().select_related("user").prefetch_related("messages")
            applications = (
                ArtistApplication.objects.all()
                .select_related("user", "reviewed_by")
                .prefetch_related("portfolio_items")
            )
        else:
            tickets = Ticket.objects.filter(user=user).select_related("user").prefetch_related("messages")
            applications = (
                ArtistApplication.objects.filter(user=user)
                .select_related("user", "reviewed_by")
                .prefetch_related("portfolio_items")
            )

        if user.role == User.Role.ADMIN:
            finance = MonthlyArtistReport.objects.select_related("artist", "settled_by")
        elif user.role == User.Role.ARTIST:
            finance = MonthlyArtistReport.objects.filter(artist=user).select_related("artist", "settled_by")
        else:
            finance = MonthlyArtistReport.objects.none()

        plans = {plan.tier: plan.monthly_price for plan in SubscriptionPlan.objects.filter(active=True)}
        recommendations = recommend_tracks(user, limit=12)

        subscription_counts = {tier: 0 for tier in User.SubscriptionTier.values}
        for listener in User.objects.filter(role=User.Role.LISTENER, is_active=True).only(
            "subscription_tier", "subscription_expires_at"
        ):
            subscription_counts[listener.effective_subscription_tier] += 1

        billing_summary = {
            "subscriptions": {
                "free": subscription_counts[User.SubscriptionTier.FREE],
                "silver": subscription_counts[User.SubscriptionTier.SILVER],
                "gold": subscription_counts[User.SubscriptionTier.GOLD],
            },
            "monthlyRevenue": 0,
            "verifiedPayments": 0,
        }
        if user.role == User.Role.ADMIN:
            now = timezone.localtime()
            verified_payments = PaymentTransaction.objects.filter(
                status=PaymentTransaction.Status.VERIFIED,
                verified_at__year=now.year,
                verified_at__month=now.month,
            )
            billing_summary["monthlyRevenue"] = (
                verified_payments.aggregate(total=Sum("amount"))["total"] or 0
            )
            billing_summary["verifiedPayments"] = verified_payments.count()

        context = {"request": request}
        return Response(
            {
                "currentUser": UserSerializer(user, context=context).data,
                "users": UserSerializer(users, many=True, context=context).data,
                "tracks": TrackSerializer(tracks, many=True, context=context).data,
                "albums": AlbumSerializer(albums, many=True, context=context).data,
                "playlists": PlaylistSerializer(playlists, many=True, context=context).data,
                "notifications": NotificationSerializer(notifications, many=True).data,
                "artistRequests": ArtistApplicationSerializer(applications, many=True, context=context).data,
                "tickets": TicketSerializer(tickets, many=True, context=context).data,
                "finance": MonthlyArtistReportSerializer(finance, many=True).data,
                "prices": {
                    "silver": plans.get(User.SubscriptionTier.SILVER, 0),
                    "gold": plans.get(User.SubscriptionTier.GOLD, 0),
                },
                "recommendations": TrackSerializer(recommendations, many=True, context=context).data,
                "billingSummary": billing_summary,
            }
        )


class DemoResetAPIView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        if not settings.ALLOW_DEMO_RESET:
            return Response(
                {"success": False, "message": "بازنشانی داده‌های نمایشی غیرفعال است."},
                status=status.HTTP_403_FORBIDDEN,
            )
        call_command("seed_demo", reset=True)
        return Response({"success": True, "message": "داده‌های نمایشی بازنشانی شدند."})
