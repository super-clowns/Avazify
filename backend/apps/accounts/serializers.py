from __future__ import annotations

from django.contrib.auth import authenticate, password_validation
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.fields import FlexibleImageField

from .models import ArtistApplication, ArtistPortfolioItem, User, UserPreference


class NotificationPreferencesSerializer(serializers.Serializer):
    followedArtistReleases = serializers.BooleanField(source="notify_followed_artist_releases", required=False)
    subscriptionExpiry = serializers.BooleanField(source="notify_subscription_expiry", required=False)
    artistVerification = serializers.BooleanField(source="notify_artist_verification", required=False)
    financialReports = serializers.BooleanField(source="notify_financial_reports", required=False)
    supportTickets = serializers.BooleanField(source="notify_support_tickets", required=False)


class UserPreferenceSerializer(serializers.ModelSerializer):
    notifications = NotificationPreferencesSerializer(source="*", required=False)
    soundEnabled = serializers.BooleanField(source="sound_enabled", required=False)
    compactMode = serializers.BooleanField(source="compact_mode", required=False)

    class Meta:
        model = UserPreference
        fields = ("notifications", "soundEnabled", "language", "compactMode")

    def update(self, instance, validated_data):
        notification_fields = {
            "notify_followed_artist_releases",
            "notify_subscription_expiry",
            "notify_artist_verification",
            "notify_financial_reports",
            "notify_support_tickets",
        }
        nested = validated_data.pop("notifications", {})
        validated_data.update(nested)
        for field, value in validated_data.items():
            if field in notification_fields or hasattr(instance, field):
                setattr(instance, field, value)
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    displayName = serializers.CharField(source="display_name")
    subscription = serializers.SerializerMethodField()
    subscriptionExpiresAt = serializers.DateTimeField(source="subscription_expires_at", allow_null=True)
    birthDate = serializers.DateField(source="birth_date", allow_null=True)
    joinedAt = serializers.DateTimeField(source="date_joined")
    artistStatus = serializers.CharField(source="artist_status")
    followers = serializers.SerializerMethodField()
    following = serializers.SerializerMethodField()
    dailyStreams = serializers.SerializerMethodField()
    totalStreams = serializers.SerializerMethodField()
    followedUserIds = serializers.SerializerMethodField()
    portfolio = serializers.SerializerMethodField()
    settings = UserPreferenceSerializer(source="preferences")
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "displayName", "username", "email", "role", "subscription",
            "subscriptionExpiresAt", "avatar", "bio", "birthDate", "gender",
            "joinedAt", "followers", "following", "dailyStreams", "totalStreams",
            "followedUserIds", "artistStatus", "portfolio", "settings",
        )

    def get_subscription(self, obj):
        return obj.effective_subscription_tier

    def get_avatar(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url

    def get_followers(self, obj):
        return obj.followers_set.count()

    def get_following(self, obj):
        return obj.followed_users.count()

    def get_dailyStreams(self, obj):
        today = timezone.localdate()
        return obj.stream_events.filter(listened_at__date=today).count()

    def get_totalStreams(self, obj):
        return obj.imported_total_streams + obj.stream_events.count()

    def get_followedUserIds(self, obj):
        return [str(value) for value in obj.followed_users.values_list("id", flat=True)]

    def get_portfolio(self, obj):
        application = getattr(obj, "artist_application", None)
        if not application:
            return []
        values = list(application.portfolio_urls)
        request = self.context.get("request")
        for item in application.portfolio_items.all():
            url = item.file.url
            values.append(request.build_absolute_uri(url) if request else url)
        return values

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        viewer = getattr(request, "user", None)
        if not viewer or not viewer.is_authenticated or (viewer != instance and viewer.role not in {User.Role.SUPPORT, User.Role.ADMIN}):
            data["email"] = ""
        return data


class UserUpdateSerializer(serializers.ModelSerializer):
    displayName = serializers.CharField(source="display_name", required=False, max_length=120)
    birthDate = serializers.DateField(source="birth_date", required=False, allow_null=True)
    avatar = FlexibleImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ("displayName", "email", "bio", "birthDate", "gender", "avatar")

    def validate_email(self, value):
        value = value.strip().lower()
        queryset = User.objects.filter(email=value).exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("این ایمیل قبلاً ثبت شده است.")
        return value

    def validate_avatar(self, value):
        user = self.instance
        if value and user.effective_subscription_tier == User.SubscriptionTier.FREE:
            raise serializers.ValidationError("تغییر عکس نمایه برای اشتراک پایه فعال نیست.")
        return value


class ListenerRegistrationSerializer(serializers.Serializer):
    displayName = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    birthDate = serializers.DateField()
    gender = serializers.ChoiceField(choices=User.Gender.choices)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("این ایمیل قبلاً ثبت شده است.")
        return value

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            display_name=validated_data["displayName"].strip(),
            birth_date=validated_data["birthDate"],
            gender=validated_data["gender"],
            role=User.Role.LISTENER,
            artist_status=User.ArtistStatus.NOT_APPLICABLE,
        )
        return user


class ArtistRegistrationSerializer(serializers.Serializer):
    artistName = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    portfolioUrl = serializers.URLField(required=False, allow_blank=True)
    portfolioFiles = serializers.ListField(child=serializers.FileField(), required=False, allow_empty=True)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("این ایمیل قبلاً ثبت شده است.")
        return value

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    @transaction.atomic
    def create(self, validated_data):
        files = validated_data.pop("portfolioFiles", [])
        portfolio_url = validated_data.pop("portfolioUrl", "").strip()
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            display_name=validated_data["artistName"].strip(),
            role=User.Role.ARTIST,
            artist_status=User.ArtistStatus.PENDING,
        )
        application = ArtistApplication.objects.create(
            user=user,
            artist_name=user.display_name,
            portfolio_urls=[portfolio_url] if portfolio_url else [],
        )
        for file in files:
            ArtistPortfolioItem.objects.create(application=application, file=file, original_name=file.name)
        return user


class ArtistApplicationReviewSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
    reason = serializers.CharField(required=False, allow_blank=True, max_length=1000)

    def validate(self, attrs):
        reason = attrs.get("reason", "").strip()
        if not attrs["approved"] and len(reason) < 10:
            raise serializers.ValidationError({"reason": "علت رد باید حداقل ۱۰ کاراکتر باشد."})
        attrs["reason"] = reason
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(request=self.context.get("request"), email=attrs["email"].strip().lower(), password=attrs["password"])
        if not user or not user.is_active:
            raise serializers.ValidationError("ایمیل یا رمز عبور صحیح نیست.")
        attrs["user"] = user
        return attrs

    def create_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role
        refresh["email"] = user.email
        return {"refresh": str(refresh), "access": str(refresh.access_token)}


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value


class ArtistApplicationSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source="user_id")
    artistName = serializers.CharField(source="artist_name")
    email = serializers.EmailField(source="user.email")
    portfolio = serializers.SerializerMethodField()
    submittedAt = serializers.DateTimeField(source="submitted_at")
    rejectionReason = serializers.CharField(source="rejection_reason")

    class Meta:
        model = ArtistApplication
        fields = ("id", "userId", "artistName", "email", "portfolio", "submittedAt", "status", "rejectionReason")

    def get_portfolio(self, obj):
        request = self.context.get("request")
        values = list(obj.portfolio_urls)
        for item in obj.portfolio_items.all():
            url = item.file.url
            values.append(request.build_absolute_uri(url) if request else url)
        return values
