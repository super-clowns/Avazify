from __future__ import annotations

from rest_framework import serializers

from .models import Notification, Ticket, TicketMessage


class NotificationSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source="user_id")
    createdAt = serializers.DateTimeField(source="created_at")

    class Meta:
        model = Notification
        fields = ("id", "userId", "title", "message", "createdAt", "read", "kind", "link")


class TicketMessageSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author_kind")
    createdAt = serializers.DateTimeField(source="created_at")

    class Meta:
        model = TicketMessage
        fields = ("id", "author", "body", "createdAt")


class TicketSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source="user_id", read_only=True)
    userName = serializers.CharField(source="user.display_name", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    messages = TicketMessageSerializer(many=True, read_only=True)
    message = serializers.CharField(write_only=True, required=False, min_length=2)

    class Meta:
        model = Ticket
        fields = ("id", "userId", "userName", "subject", "createdAt", "status", "messages", "message")
        read_only_fields = ("status",)

    def validate(self, attrs):
        if not self.instance and not attrs.get("message", "").strip():
            raise serializers.ValidationError({"message": "متن اولیه تیکت الزامی است."})
        return attrs

    def create(self, validated_data):
        message = validated_data.pop("message").strip()
        user = self.context["request"].user
        ticket = Ticket.objects.create(user=user, **validated_data)
        TicketMessage.objects.create(ticket=ticket, author=user, author_kind=TicketMessage.AuthorKind.USER, body=message)
        return ticket


class TicketReplySerializer(serializers.Serializer):
    body = serializers.CharField(min_length=1, max_length=5000)


class TicketStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Ticket.Status.choices)


class ReadAllNotificationsResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    updated = serializers.IntegerField()
