from __future__ import annotations

from django.db import transaction
from rest_framework import serializers

from apps.common.fields import FlexibleImageField

from .models import Album, Playlist, Track


def file_url(field, request):
    if not field:
        return None
    return request.build_absolute_uri(field.url) if request else field.url


class TrackSerializer(serializers.ModelSerializer):
    artistId = serializers.UUIDField(source="artist_id", read_only=True)
    artistName = serializers.CharField(source="artist.display_name", read_only=True)
    albumId = serializers.UUIDField(source="album_id", read_only=True, allow_null=True)
    albumTitle = serializers.CharField(source="album.title", read_only=True, allow_null=True)
    cover = serializers.SerializerMethodField()
    audioUrl = serializers.SerializerMethodField()
    audioLowQualityUrl = serializers.SerializerMethodField()
    duration = serializers.IntegerField(source="duration_seconds")
    releaseDate = serializers.DateField(source="release_date")
    listeners = serializers.SerializerMethodField()
    streams = serializers.SerializerMethodField()
    earlyAccess = serializers.BooleanField(source="early_access")
    albumTitleInput = serializers.CharField(write_only=True, required=False, allow_blank=True)
    coverFile = FlexibleImageField(source="cover", write_only=True, required=False)
    audioFile = serializers.FileField(source="audio_file", write_only=True, required=False)
    audioLowQuality = serializers.FileField(source="audio_low_quality", write_only=True, required=False, allow_null=True)

    class Meta:
        model = Track
        fields = (
            "id", "title", "artistId", "artistName", "albumId", "albumTitle",
            "cover", "audioUrl", "audioLowQualityUrl", "duration", "releaseDate",
            "listeners", "streams", "genre", "lyrics", "earlyAccess", "collaborators",
            "albumTitleInput", "coverFile", "audioFile", "audioLowQuality",
        )

    def get_cover(self, obj):
        return file_url(obj.cover, self.context.get("request"))

    def get_audioUrl(self, obj):
        return file_url(obj.audio_file, self.context.get("request"))

    def get_audioLowQualityUrl(self, obj):
        return file_url(obj.audio_low_quality, self.context.get("request"))

    def get_listeners(self, obj):
        annotated = getattr(obj, "listeners_count", None)
        return obj.imported_listeners + (annotated if annotated is not None else obj.stream_events.values("user_id").distinct().count())

    def get_streams(self, obj):
        annotated = getattr(obj, "streams_count", None)
        return obj.imported_streams + (annotated if annotated is not None else obj.stream_events.count())

    def validate(self, attrs):
        if not self.instance and "audio_file" not in attrs:
            raise serializers.ValidationError({"audioFile": "فایل صوتی الزامی است."})
        if not self.instance and "cover" not in attrs:
            raise serializers.ValidationError({"coverFile": "تصویر کاور الزامی است."})
        return attrs

    def _resolve_album(self, artist, title, attrs):
        title = title.strip()
        if not title:
            return None
        cover = attrs.get("cover") or (self.instance.cover if self.instance else None)
        album, created = Album.objects.get_or_create(
            artist=artist,
            title=title,
            defaults={
                "cover": cover,
                "release_date": attrs.get("release_date") or self.instance.release_date,
                "genre": attrs.get("genre") or self.instance.genre,
            },
        )
        if not created:
            changed = False
            if attrs.get("release_date") and album.release_date != attrs["release_date"]:
                album.release_date = attrs["release_date"]
                changed = True
            if attrs.get("genre") and album.genre != attrs["genre"]:
                album.genre = attrs["genre"]
                changed = True
            if changed:
                album.save()
        return album

    @transaction.atomic
    def create(self, validated_data):
        album_title = validated_data.pop("albumTitleInput", "")
        artist = self.context["request"].user
        album = self._resolve_album(artist, album_title, validated_data)
        return Track.objects.create(artist=artist, album=album, **validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        album_title = validated_data.pop("albumTitleInput", None)
        if album_title is not None:
            instance.album = self._resolve_album(instance.artist, album_title, validated_data)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        Album.objects.filter(artist=instance.artist, tracks__isnull=True).delete()
        return instance


class AlbumSerializer(serializers.ModelSerializer):
    artistId = serializers.UUIDField(source="artist_id", read_only=True)
    artistName = serializers.CharField(source="artist.display_name", read_only=True)
    cover = serializers.SerializerMethodField()
    releaseDate = serializers.DateField(source="release_date")
    trackIds = serializers.SerializerMethodField()
    coverFile = FlexibleImageField(source="cover", write_only=True, required=False)

    class Meta:
        model = Album
        fields = ("id", "title", "artistId", "artistName", "cover", "releaseDate", "genre", "trackIds", "coverFile")

    def get_cover(self, obj):
        return file_url(obj.cover, self.context.get("request"))

    def get_trackIds(self, obj):
        return [str(value) for value in obj.tracks.filter(is_published=True).values_list("id", flat=True)]

    def create(self, validated_data):
        return Album.objects.create(artist=self.context["request"].user, **validated_data)


class PlaylistSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source="user_id", read_only=True)
    trackIds = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Playlist
        fields = ("id", "userId", "name", "description", "trackIds", "createdAt", "updatedAt")

    def get_trackIds(self, obj):
        return [str(value) for value in obj.playlist_tracks.order_by("position").values_list("track_id", flat=True)]


class PlaylistAddTrackSerializer(serializers.Serializer):
    trackId = serializers.UUIDField()


class PlaylistReorderSerializer(serializers.Serializer):
    trackIds = serializers.ListField(child=serializers.UUIDField(), allow_empty=True)
