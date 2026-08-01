from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import ArtistApplication, ArtistPortfolioItem, User, UserPreference


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ("email",)
    list_display = ("email", "display_name", "role", "subscription_tier", "artist_status", "is_active")
    list_filter = ("role", "subscription_tier", "artist_status", "is_active")
    search_fields = ("email", "display_name", "username")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Avazify", {"fields": ("display_name", "role", "subscription_tier", "subscription_expires_at", "avatar", "bio", "birth_date", "gender", "artist_status", "followed_users")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("Avazify", {"fields": ("email", "display_name", "role")}),
    )


admin.site.register(UserPreference)
admin.site.register(ArtistApplication)
admin.site.register(ArtistPortfolioItem)
