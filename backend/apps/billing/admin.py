from django.contrib import admin

from .models import MonthlyArtistReport, PaymentTransaction, SubscriptionPlan

admin.site.register(SubscriptionPlan)
admin.site.register(PaymentTransaction)
admin.site.register(MonthlyArtistReport)
