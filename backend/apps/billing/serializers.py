from rest_framework import serializers

from .models import MonthlyArtistReport, PaymentTransaction, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    monthlyPrice = serializers.IntegerField(source="monthly_price")
    dailyStreamLimit = serializers.IntegerField(source="daily_stream_limit", allow_null=True)
    playlistLimit = serializers.IntegerField(source="playlist_limit", allow_null=True)
    canUploadAvatar = serializers.BooleanField(source="can_upload_avatar")
    canDownload = serializers.BooleanField(source="can_download")
    earlyAccess = serializers.BooleanField(source="early_access")
    analyticsAccess = serializers.BooleanField(source="analytics_access")

    class Meta:
        model = SubscriptionPlan
        fields = (
            "tier", "display_name", "monthlyPrice", "dailyStreamLimit", "playlistLimit",
            "canUploadAvatar", "canDownload", "earlyAccess", "analyticsAccess", "active",
        )


class PaymentCreateSerializer(serializers.Serializer):
    tier = serializers.ChoiceField(choices=["free", "silver", "gold"])
    duration = serializers.ChoiceField(choices=[1, 3, 6, 12])

    def validate(self, attrs):
        if attrs["tier"] == "free" and attrs["duration"] != 1:
            attrs["duration"] = 1
        return attrs


class PaymentTransactionSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source="user_id")
    tier = serializers.CharField(source="plan_id")
    duration = serializers.IntegerField(source="duration_months")
    discount = serializers.IntegerField(source="discount_percent")
    referenceId = serializers.CharField(source="reference_id")
    createdAt = serializers.DateTimeField(source="created_at")
    verifiedAt = serializers.DateTimeField(source="verified_at", allow_null=True)

    class Meta:
        model = PaymentTransaction
        fields = ("id", "userId", "tier", "duration", "amount", "discount", "provider", "authority", "referenceId", "status", "createdAt", "verifiedAt")


class MonthlyArtistReportSerializer(serializers.ModelSerializer):
    artistId = serializers.UUIDField(source="artist_id")
    artistName = serializers.CharField(source="artist.display_name")
    uniqueListeners = serializers.IntegerField(source="unique_listeners")
    reward = serializers.IntegerField()

    class Meta:
        model = MonthlyArtistReport
        fields = ("id", "artistId", "artistName", "year", "month", "uniqueListeners", "streams", "reward", "status")


class SubscriptionPriceUpdateSerializer(serializers.Serializer):
    silver = serializers.IntegerField(min_value=1)
    gold = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        if attrs["gold"] <= attrs["silver"]:
            raise serializers.ValidationError({"gold": "قیمت طلایی باید بیشتر از قیمت نقره‌ای باشد."})
        return attrs


class SubscriptionPriceUpdateResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    silver = serializers.IntegerField()
    gold = serializers.IntegerField()


class PaymentCreateResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    paymentUrl = serializers.CharField(required=False, allow_blank=True)
    transaction = PaymentTransactionSerializer(required=False)
    status = serializers.CharField(required=False)


class PaymentVerifyResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    transaction = PaymentTransactionSerializer(required=False)


class ReportGenerateSerializer(serializers.Serializer):
    year = serializers.IntegerField(required=False, min_value=2000, max_value=2200)
    month = serializers.IntegerField(required=False, min_value=1, max_value=12)


class SubscriptionCountSerializer(serializers.Serializer):
    free = serializers.IntegerField()
    silver = serializers.IntegerField()
    gold = serializers.IntegerField()


class AdminBillingSummarySerializer(serializers.Serializer):
    subscriptions = SubscriptionCountSerializer()
    monthlyRevenue = serializers.IntegerField()
