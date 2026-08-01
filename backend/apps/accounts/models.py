from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models import Q

from apps.common.validators import validate_image_file


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email).lower()
        username = extra_fields.pop("username", None) or self._unique_username(email.split("@", 1)[0])
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def _unique_username(self, base):
        cleaned = "".join(ch if ch.isalnum() or ch == "_" else "_" for ch in base.lower()).strip("_") or "avazify_user"
        candidate = cleaned
        suffix = 2
        while self.model.objects.filter(username=candidate).exists():
            candidate = f"{cleaned}_{suffix}"
            suffix += 1
        return candidate

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        if extra_fields.get("is_staff") is not True or extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_staff=True and is_superuser=True")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        LISTENER = "listener", "Listener"
        ARTIST = "artist", "Artist"
        SUPPORT = "support", "Support"
        ADMIN = "admin", "Admin"

    class SubscriptionTier(models.TextChoices):
        FREE = "free", "Free"
        SILVER = "silver", "Silver"
        GOLD = "gold", "Gold"

    class ArtistStatus(models.TextChoices):
        NOT_APPLICABLE = "not-applicable", "Not applicable"
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    class Gender(models.TextChoices):
        FEMALE = "female", "Female"
        MALE = "male", "Male"
        OTHER = "other", "Other"
        PREFER_NOT_TO_SAY = "prefer-not-to-say", "Prefer not to say"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=120)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.LISTENER, db_index=True)
    subscription_tier = models.CharField(max_length=12, choices=SubscriptionTier.choices, default=SubscriptionTier.FREE, db_index=True)
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    avatar = models.FileField(upload_to="avatars/%Y/%m/", null=True, blank=True, validators=[validate_image_file])
    bio = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=24, choices=Gender.choices, default=Gender.PREFER_NOT_TO_SAY)
    artist_status = models.CharField(max_length=24, choices=ArtistStatus.choices, default=ArtistStatus.NOT_APPLICABLE, db_index=True)
    imported_total_streams = models.PositiveBigIntegerField(default=0)
    followed_users = models.ManyToManyField("self", symmetrical=False, related_name="followers_set", blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["display_name"]
    objects = UserManager()

    class Meta:
        ordering = ["display_name", "email"]
        constraints = [
            models.CheckConstraint(
                condition=Q(role="artist") | Q(artist_status="not-applicable"),
                name="non_artist_status_not_applicable",
            )
        ]

    def __str__(self):
        return f"{self.display_name} <{self.email}>"

    @property
    def effective_subscription_tier(self):
        from django.utils import timezone

        if self.subscription_tier == self.SubscriptionTier.FREE:
            return self.SubscriptionTier.FREE
        if self.subscription_expires_at and self.subscription_expires_at <= timezone.now():
            return self.SubscriptionTier.FREE
        return self.subscription_tier


class UserPreference(models.Model):
    class Language(models.TextChoices):
        PERSIAN = "fa", "Persian"
        ENGLISH = "en", "English"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preferences")
    notify_followed_artist_releases = models.BooleanField(default=True)
    notify_subscription_expiry = models.BooleanField(default=True)
    notify_artist_verification = models.BooleanField(default=True)
    notify_financial_reports = models.BooleanField(default=True)
    notify_support_tickets = models.BooleanField(default=True)
    sound_enabled = models.BooleanField(default=True)
    language = models.CharField(max_length=2, choices=Language.choices, default=Language.PERSIAN)
    compact_mode = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences({self.user.email})"


class ArtistApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="artist_application")
    artist_name = models.CharField(max_length=120)
    portfolio_urls = models.JSONField(default=list, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING, db_index=True)
    rejection_reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_artist_applications")
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at"]


class ArtistPortfolioItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(ArtistApplication, on_delete=models.CASCADE, related_name="portfolio_items")
    file = models.FileField(upload_to="artist_portfolios/%Y/%m/")
    original_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
