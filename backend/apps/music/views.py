from __future__ import annotations

from django.db import transaction
from django.db.models import Count, Max, Q
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema

from apps.accounts.models import User
from apps.billing.models import SubscriptionPlan
from apps.common.permissions import IsApprovedArtist

from .models import Album, DownloadEvent, Playlist, PlaylistTrack, StreamEvent
from .serializers import (
    AlbumSerializer,
    PlaylistAddTrackSerializer,
    PlaylistReorderSerializer,
    PlaylistSerializer,
    StreamCreateSerializer,
    StreamResponseSerializer,
    TrackSerializer,
)
from .services import accessible_tracks_for, can_stream


@extend_schema(tags=["music-tracks"])
class TrackViewSet(viewsets.ModelViewSet):
    serializer_class = TrackSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ("title", "artist__display_name", "album__title", "genre")
    ordering_fields = ("release_date", "listeners_count", "streams_count", "title")
    ordering = ("-release_date",)

    def get_queryset(self):
        return accessible_tracks_for(self.request.user).select_related("artist", "album").annotate(
            streams_count=Count("stream_events", distinct=True),
            listeners_count=Count("stream_events__user", distinct=True),
        )

    def get_permissions(self):
        if self.action == "create":
            return [IsApprovedArtist()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        track = self.get_object()
        if track.artist != self.request.user and self.request.user.role != User.Role.ADMIN:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("فقط صاحب اثر یا مدیر می‌تواند آن را ویرایش کند.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.artist != self.request.user and self.request.user.role != User.Role.ADMIN:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("فقط صاحب اثر یا مدیر می‌تواند آن را حذف کند.")
        instance.delete()

    @extend_schema(
        request=StreamCreateSerializer,
        responses={201: StreamResponseSerializer},
        summary="ثبت استریم آهنگ",
        description="دسترسی Early Access و محدودیت روزانه اشتراک را بررسی و StreamEvent ایجاد می‌کند.",
        tags=["music-tracks"],
    )
    @action(detail=True, methods=["post"])
    def stream(self, request, pk=None):
        track = self.get_object()
        input_serializer = StreamCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        allowed, message = can_stream(request.user, track)
        if not allowed:
            return Response({"success": False, "message": message}, status=403)
        event = StreamEvent.objects.create(
            track=track,
            user=request.user,
            client_session=input_serializer.validated_data.get("clientSession", ""),
            seconds_listened=input_serializer.validated_data.get("secondsListened", 0),
        )
        return Response({
            "success": True,
            "streamId": str(event.id),
            "streams": track.imported_streams + track.stream_events.count(),
            "listeners": track.imported_listeners + track.stream_events.values("user_id").distinct().count(),
        }, status=201)

    @extend_schema(
        request=None,
        responses={200: OpenApiResponse(response=OpenApiTypes.BINARY, description="فایل صوتی به‌صورت attachment")},
        summary="دانلود آهنگ",
        description="فقط برای اشتراک نقره‌ای و طلایی فعال است.",
        tags=["music-tracks"],
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        track = self.get_object()
        if request.user.effective_subscription_tier == User.SubscriptionTier.FREE:
            return Response({"success": False, "message": "دانلود برای اشتراک نقره‌ای و طلایی فعال است."}, status=403)
        DownloadEvent.objects.create(track=track, user=request.user)
        response = FileResponse(track.audio_file.open("rb"), as_attachment=True, filename=track.audio_file.name.rsplit("/", 1)[-1])
        return response


@extend_schema(tags=["music-albums"])
class AlbumViewSet(viewsets.ModelViewSet):
    serializer_class = AlbumSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ("title", "artist__display_name", "genre")
    ordering_fields = ("release_date", "title")
    ordering = ("-release_date",)

    def get_queryset(self):
        accessible_ids = accessible_tracks_for(self.request.user).values("album_id")
        return Album.objects.filter(Q(id__in=accessible_ids) | Q(artist=self.request.user)).select_related("artist").prefetch_related("tracks").distinct()

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy"}:
            return [IsApprovedArtist()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        album = self.get_object()
        if album.artist != self.request.user and self.request.user.role != User.Role.ADMIN:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("فقط صاحب آلبوم یا مدیر می‌تواند آن را ویرایش کند.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.artist != self.request.user and self.request.user.role != User.Role.ADMIN:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("فقط صاحب آلبوم یا مدیر می‌تواند آن را حذف کند.")
        instance.delete()


@extend_schema(tags=["playlists"])
class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer

    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user).prefetch_related("playlist_tracks")

    def perform_create(self, serializer):
        plan = SubscriptionPlan.objects.filter(tier=self.request.user.effective_subscription_tier, active=True).first()
        limit = plan.playlist_limit if plan else (6 if self.request.user.effective_subscription_tier == User.SubscriptionTier.FREE else 100 if self.request.user.effective_subscription_tier == User.SubscriptionTier.SILVER else None)
        if limit is not None and self.request.user.playlists.count() >= limit:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"name": "به سقف تعداد پلی‌لیست مجاز رسیده‌اید."})
        serializer.save(user=self.request.user)

    @extend_schema(
        request=PlaylistAddTrackSerializer,
        responses={201: PlaylistSerializer},
        summary="افزودن آهنگ به پلی‌لیست",
        tags=["playlists"],
    )
    @action(detail=True, methods=["post"], url_path="tracks")
    def add_track(self, request, pk=None):
        playlist = self.get_object()
        serializer = PlaylistAddTrackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        track = get_object_or_404(accessible_tracks_for(request.user), pk=serializer.validated_data["trackId"])
        if PlaylistTrack.objects.filter(playlist=playlist, track=track).exists():
            return Response({"success": False, "message": "این آهنگ قبلاً در پلی‌لیست وجود دارد."}, status=400)
        position = (playlist.playlist_tracks.aggregate(value=Max("position"))["value"] or -1) + 1
        PlaylistTrack.objects.create(playlist=playlist, track=track, position=position)
        playlist.save(update_fields=["updated_at"])
        return Response(PlaylistSerializer(playlist, context={"request": request}).data, status=201)

    @extend_schema(
        request=None,
        responses={204: OpenApiResponse(description="آهنگ از پلی‌لیست حذف شد.")},
        summary="حذف آهنگ از پلی‌لیست",
        tags=["playlists"],
    )
    @action(detail=True, methods=["delete"], url_path=r"tracks/(?P<track_id>[^/.]+)")
    def remove_track(self, request, pk=None, track_id=None):
        playlist = self.get_object()
        deleted, _ = PlaylistTrack.objects.filter(playlist=playlist, track_id=track_id).delete()
        if not deleted:
            return Response({"success": False, "message": "آهنگ در پلی‌لیست پیدا نشد."}, status=404)
        self._normalize_positions(playlist)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        request=PlaylistReorderSerializer,
        responses={200: PlaylistSerializer},
        summary="مرتب‌سازی آهنگ‌های پلی‌لیست",
        tags=["playlists"],
    )
    @action(detail=True, methods=["put"])
    @transaction.atomic
    def reorder(self, request, pk=None):
        playlist = self.get_object()
        serializer = PlaylistReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        requested = [str(value) for value in serializer.validated_data["trackIds"]]
        current = [str(value) for value in playlist.playlist_tracks.values_list("track_id", flat=True)]
        if sorted(requested) != sorted(current):
            return Response({"success": False, "message": "فهرست آهنگ‌ها با پلی‌لیست مطابقت ندارد."}, status=400)
        entries = {str(entry.track_id): entry for entry in playlist.playlist_tracks.all()}
        for entry in entries.values():
            entry.position += 100000
            entry.save(update_fields=["position"])
        for index, track_id in enumerate(requested):
            entry = entries[track_id]
            entry.position = index
            entry.save(update_fields=["position"])
        playlist.save(update_fields=["updated_at"])
        return Response(PlaylistSerializer(playlist, context={"request": request}).data)

    @staticmethod
    def _normalize_positions(playlist):
        with transaction.atomic():
            entries = list(playlist.playlist_tracks.order_by("position", "added_at"))
            for entry in entries:
                entry.position += 100000
                entry.save(update_fields=["position"])
            for index, entry in enumerate(entries):
                entry.position = index
                entry.save(update_fields=["position"])
            playlist.save(update_fields=["updated_at"])
