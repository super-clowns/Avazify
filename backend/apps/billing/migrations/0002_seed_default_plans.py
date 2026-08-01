from django.db import migrations


def seed_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model("billing", "SubscriptionPlan")
    defaults = {
        "free": {
            "display_name": "پایه",
            "monthly_price": 0,
            "daily_stream_limit": 60,
            "playlist_limit": 6,
            "can_upload_avatar": False,
            "can_download": False,
            "early_access": False,
            "analytics_access": False,
            "active": True,
        },
        "silver": {
            "display_name": "نقره‌ای",
            "monthly_price": 189000,
            "daily_stream_limit": None,
            "playlist_limit": 100,
            "can_upload_avatar": True,
            "can_download": True,
            "early_access": False,
            "analytics_access": False,
            "active": True,
        },
        "gold": {
            "display_name": "طلایی",
            "monthly_price": 329000,
            "daily_stream_limit": None,
            "playlist_limit": None,
            "can_upload_avatar": True,
            "can_download": True,
            "early_access": True,
            "analytics_access": True,
            "active": True,
        },
    }
    for tier, values in defaults.items():
        SubscriptionPlan.objects.update_or_create(tier=tier, defaults=values)


def remove_plans(apps, schema_editor):
    apps.get_model("billing", "SubscriptionPlan").objects.filter(
        tier__in=["free", "silver", "gold"]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [("billing", "0001_initial")]
    operations = [migrations.RunPython(seed_plans, remove_plans)]
