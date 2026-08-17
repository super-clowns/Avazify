from rest_framework import serializers

from apps.accounts.serializers import ArtistApplicationSerializer, UserSerializer
from apps.billing.serializers import MonthlyArtistReportSerializer
from apps.music.serializers import AlbumSerializer, PlaylistSerializer, TrackSerializer
from apps.support.serializers import NotificationSerializer, TicketSerializer


class SystemMessageResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()


class HealthResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    service = serializers.CharField()
    version = serializers.CharField()


class BootstrapSubscriptionPriceMapSerializer(serializers.Serializer):
    silver = serializers.IntegerField()
    gold = serializers.IntegerField()


class BootstrapSubscriptionCountSerializer(serializers.Serializer):
    free = serializers.IntegerField()
    silver = serializers.IntegerField()
    gold = serializers.IntegerField()


class BootstrapBillingSummarySerializer(serializers.Serializer):
    subscriptions = BootstrapSubscriptionCountSerializer()
    monthlyRevenue = serializers.IntegerField()
    verifiedPayments = serializers.IntegerField()


class BootstrapResponseSerializer(serializers.Serializer):
    currentUser = UserSerializer()
    users = UserSerializer(many=True)
    tracks = TrackSerializer(many=True)
    albums = AlbumSerializer(many=True)
    playlists = PlaylistSerializer(many=True)
    notifications = NotificationSerializer(many=True)
    artistRequests = ArtistApplicationSerializer(many=True)
    tickets = TicketSerializer(many=True)
    finance = MonthlyArtistReportSerializer(many=True)
    prices = BootstrapSubscriptionPriceMapSerializer()
    recommendations = TrackSerializer(many=True)
    billingSummary = BootstrapBillingSummarySerializer()
