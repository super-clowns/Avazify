# Generated for the Avazify course project.
from __future__ import annotations

import uuid

import apps.accounts.models
import apps.common.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("is_superuser", models.BooleanField(default=False, help_text="Designates that this user has all permissions without explicitly assigning them.", verbose_name="superuser status")),
                ("username", models.CharField(error_messages={"unique": "A user with that username already exists."}, help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.", max_length=150, unique=True, verbose_name="username")),
                ("first_name", models.CharField(blank=True, max_length=150, verbose_name="first name")),
                ("last_name", models.CharField(blank=True, max_length=150, verbose_name="last name")),
                ("is_staff", models.BooleanField(default=False, help_text="Designates whether the user can log into this admin site.", verbose_name="staff status")),
                ("is_active", models.BooleanField(default=True, help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.", verbose_name="active")),
                ("date_joined", models.DateTimeField(default=django.utils.timezone.now, verbose_name="date joined")),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("display_name", models.CharField(max_length=120)),
                ("role", models.CharField(choices=[("listener", "Listener"), ("artist", "Artist"), ("support", "Support"), ("admin", "Admin")], db_index=True, default="listener", max_length=16)),
                ("subscription_tier", models.CharField(choices=[("free", "Free"), ("silver", "Silver"), ("gold", "Gold")], db_index=True, default="free", max_length=12)),
                ("subscription_expires_at", models.DateTimeField(blank=True, null=True)),
                ("avatar", models.FileField(blank=True, null=True, upload_to="avatars/%Y/%m/", validators=[apps.common.validators.validate_image_file])),
                ("bio", models.TextField(blank=True)),
                ("birth_date", models.DateField(blank=True, null=True)),
                ("gender", models.CharField(choices=[("female", "Female"), ("male", "Male"), ("other", "Other"), ("prefer-not-to-say", "Prefer not to say")], default="prefer-not-to-say", max_length=24)),
                ("artist_status", models.CharField(choices=[("not-applicable", "Not applicable"), ("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")], db_index=True, default="not-applicable", max_length=24)),
                ("imported_total_streams", models.PositiveBigIntegerField(default=0)),
                ("followed_users", models.ManyToManyField(blank=True, related_name="followers_set", to=settings.AUTH_USER_MODEL)),
                ("groups", models.ManyToManyField(blank=True, help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.", related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups")),
                ("user_permissions", models.ManyToManyField(blank=True, help_text="Specific permissions for this user.", related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions")),
            ],
            options={"ordering": ["display_name", "email"]},
            managers=[("objects", apps.accounts.models.UserManager())],
        ),
        migrations.AddConstraint(
            model_name="user",
            constraint=models.CheckConstraint(condition=models.Q(("role", "artist"), ("artist_status", "not-applicable"), _connector="OR"), name="non_artist_status_not_applicable"),
        ),
        migrations.CreateModel(
            name="UserPreference",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("notify_followed_artist_releases", models.BooleanField(default=True)),
                ("notify_subscription_expiry", models.BooleanField(default=True)),
                ("notify_artist_verification", models.BooleanField(default=True)),
                ("notify_financial_reports", models.BooleanField(default=True)),
                ("notify_support_tickets", models.BooleanField(default=True)),
                ("sound_enabled", models.BooleanField(default=True)),
                ("language", models.CharField(choices=[("fa", "Persian"), ("en", "English")], default="fa", max_length=2)),
                ("compact_mode", models.BooleanField(default=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="preferences", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="ArtistApplication",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("artist_name", models.CharField(max_length=120)),
                ("portfolio_urls", models.JSONField(blank=True, default=list)),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")], db_index=True, default="pending", max_length=12)),
                ("rejection_reason", models.TextField(blank=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("reviewed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="reviewed_artist_applications", to=settings.AUTH_USER_MODEL)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="artist_application", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-submitted_at"]},
        ),
        migrations.CreateModel(
            name="ArtistPortfolioItem",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("file", models.FileField(upload_to="artist_portfolios/%Y/%m/")),
                ("original_name", models.CharField(max_length=255)),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                ("application", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="portfolio_items", to="accounts.artistapplication")),
            ],
        ),
    ]
