from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.accounts.models import User

from .models import Notification, Ticket, TicketMessage


@receiver(post_save, sender=Ticket)
def notify_support_about_new_ticket(sender, instance, created, **kwargs):
    if not created:
        return
    support_users = User.objects.filter(role__in=[User.Role.SUPPORT, User.Role.ADMIN], is_active=True)
    Notification.objects.bulk_create([
        Notification(
            user=user,
            title="تیکت جدید ثبت شد",
            message=f"{instance.user.display_name} تیکت «{instance.subject}» را ثبت کرد.",
            kind=Notification.Kind.SUPPORT,
            link="/dashboard",
        )
        for user in support_users
        if getattr(user, "preferences", None) is None or user.preferences.notify_support_tickets
    ])


@receiver(post_save, sender=TicketMessage)
def notify_ticket_reply(sender, instance, created, **kwargs):
    if not created or instance.author_kind != TicketMessage.AuthorKind.SUPPORT:
        return
    Notification.objects.create(
        user=instance.ticket.user,
        title="پاسخ جدید پشتیبانی",
        message=f"برای تیکت «{instance.ticket.subject}» پاسخ جدیدی ثبت شد.",
        kind=Notification.Kind.SUPPORT,
        link="/support",
    )
