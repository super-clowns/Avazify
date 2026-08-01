from django.contrib import admin

from .models import Notification, Ticket, TicketMessage

admin.site.register(Notification)
admin.site.register(Ticket)
admin.site.register(TicketMessage)
