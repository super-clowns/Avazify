from __future__ import annotations

import decimal
import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name="SubscriptionPlan",
            fields=[
                ("tier", models.CharField(choices=[("free", "Free"), ("silver", "Silver"), ("gold", "Gold")], max_length=12, primary_key=True, serialize=False)),
                ("display_name", models.CharField(max_length=80)),
                ("monthly_price", models.PositiveBigIntegerField(default=0)),
                ("daily_stream_limit", models.PositiveIntegerField(blank=True, null=True)),
                ("playlist_limit", models.PositiveIntegerField(blank=True, null=True)),
                ("can_upload_avatar", models.BooleanField(default=False)),
                ("can_download", models.BooleanField(default=False)),
                ("early_access", models.BooleanField(default=False)),
                ("analytics_access", models.BooleanField(default=False)),
                ("active", models.BooleanField(default=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["monthly_price"]},
        ),
        migrations.CreateModel(
            name="PaymentTransaction",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("duration_months", models.PositiveSmallIntegerField()),
                ("amount", models.PositiveBigIntegerField()),
                ("discount_percent", models.PositiveSmallIntegerField(default=0)),
                ("provider", models.CharField(default="mock", max_length=40)),
                ("authority", models.CharField(blank=True, max_length=150)),
                ("reference_id", models.CharField(blank=True, max_length=150)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("verified", "Verified"), ("failed", "Failed"), ("cancelled", "Cancelled")], db_index=True, default="pending", max_length=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("verified_at", models.DateTimeField(blank=True, null=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("plan", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="transactions", to="billing.subscriptionplan")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="payment_transactions", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddConstraint(model_name="paymenttransaction", constraint=models.CheckConstraint(condition=models.Q(("duration_months__in", [1, 3, 6, 12])), name="valid_subscription_duration")),
        migrations.CreateModel(
            name="MonthlyArtistReport",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("year", models.PositiveSmallIntegerField()),
                ("month", models.PositiveSmallIntegerField()),
                ("unique_listeners", models.PositiveIntegerField(default=0)),
                ("streams", models.PositiveIntegerField(default=0)),
                ("reward", models.DecimalField(decimal_places=0, default=decimal.Decimal("0"), max_digits=18)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("settled", "Settled")], db_index=True, default="pending", max_length=12)),
                ("calculated_at", models.DateTimeField(auto_now=True)),
                ("settled_at", models.DateTimeField(blank=True, null=True)),
                ("artist", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="monthly_reports", to=settings.AUTH_USER_MODEL)),
                ("settled_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="settled_reports", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-year", "-month", "artist__display_name"]},
        ),
        migrations.AddConstraint(model_name="monthlyartistreport", constraint=models.UniqueConstraint(fields=("artist", "year", "month"), name="unique_artist_monthly_report")),
        migrations.AddConstraint(model_name="monthlyartistreport", constraint=models.CheckConstraint(condition=models.Q(("month__gte", 1), ("month__lte", 12)), name="valid_report_month")),
    ]
