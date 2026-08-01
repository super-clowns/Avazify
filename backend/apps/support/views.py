from __future__ import annotations

from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import User

from .models import Notification, Ticket, TicketMessage
from .serializers import NotificationSerializer, TicketReplySerializer, TicketSerializer, TicketStatusSerializer


class NotificationViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save(update_fields=["read"])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=["post"], url_path="read-all")
    def read_all(self, request):
        updated = self.get_queryset().filter(read=False).update(read=True)
        return Response({"success": True, "updated": updated})


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    search_fields = ("subject", "user__display_name", "user__email")
    ordering_fields = ("created_at", "updated_at", "status")
    ordering = ("-updated_at",)

    def get_queryset(self):
        queryset = Ticket.objects.select_related("user", "assigned_to").prefetch_related("messages__author")
        if self.request.user.role in {User.Role.SUPPORT, User.Role.ADMIN}:
            return queryset
        return queryset.filter(user=self.request.user)

    def get_permissions(self):
        if self.action == "destroy":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        if self.request.user.role not in {User.Role.SUPPORT, User.Role.ADMIN}:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("تغییر مستقیم تیکت فقط برای پشتیبانی مجاز است.")
        serializer.save()

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if ticket.status == Ticket.Status.CLOSED:
            return Response({"success": False, "message": "تیکت بسته است. ابتدا آن را باز کنید."}, status=400)
        is_support = request.user.role in {User.Role.SUPPORT, User.Role.ADMIN}
        if not is_support and ticket.user != request.user:
            return Response({"success": False, "message": "به این تیکت دسترسی ندارید."}, status=403)
        TicketMessage.objects.create(
            ticket=ticket,
            author=request.user,
            author_kind=TicketMessage.AuthorKind.SUPPORT if is_support else TicketMessage.AuthorKind.USER,
            body=serializer.validated_data["body"].strip(),
        )
        if is_support:
            ticket.status = Ticket.Status.ANSWERED
            ticket.assigned_to = request.user
            ticket.save(update_fields=["status", "assigned_to", "updated_at"])
        else:
            ticket.status = Ticket.Status.OPEN
            ticket.save(update_fields=["status", "updated_at"])
        ticket.refresh_from_db()
        return Response(TicketSerializer(ticket, context={"request": request}).data, status=201)

    @action(detail=True, methods=["patch"])
    def status(self, request, pk=None):
        if request.user.role not in {User.Role.SUPPORT, User.Role.ADMIN}:
            return Response({"success": False, "message": "فقط پشتیبانی می‌تواند وضعیت تیکت را تغییر دهد."}, status=403)
        ticket = self.get_object()
        serializer = TicketStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket.status = serializer.validated_data["status"]
        ticket.assigned_to = request.user
        ticket.save(update_fields=["status", "assigned_to", "updated_at"])
        return Response(TicketSerializer(ticket, context={"request": request}).data)
