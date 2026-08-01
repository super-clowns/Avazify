from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.common.validators import validate_audio_file, validate_image_file


class Album(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=180)
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="albums")
    cover = models.FileField(upload_to="album_covers/%Y/%m/", validators=[validate_image_file])
    release_date = models.DateField(db_index=True)
    genre = models.CharField(max_length=80, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-release_date", "title"]
        constraints = [models.UniqueConstraint(fields=["artist", "title"], name="unique_album_title_per_artist")]

    def __str__(self):
        return f"{self.title} — {self.artist.display_name}"


class Track(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=180)
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tracks")
    album = models.ForeignKey(Album, null=True, blank=True, on_delete=models.SET_NULL, related_name="tracks")
    cover = models.FileField(upload_to="track_covers/%Y/%m/", validators=[validate_image_file])
    audio_file = models.FileField(upload_to="tracks/high/%Y/%m/", validators=[validate_audio_file])
    audio_low_quality = models.FileField(upload_to="tracks/low/%Y/%m/", null=True, blank=True, validators=[validate_audio_file])
    duration_seconds = models.PositiveIntegerField(default=0)
    release_date = models.DateField(db_index=True)
    genre = models.CharField(max_length=80, db_index=True)
    lyrics = models.TextField(blank=True)
    early_access = models.BooleanField(default=False, db_index=True)
    collaborators = models.JSONField(default=list, blank=True)
    imported_streams = models.PositiveBigIntegerField(default=0)
    imported_listeners = models.PositiveBigIntegerField(default=0)
    is_published = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-release_date", "title"]
        indexes = [
            models.Index(fields=["genre", "-release_date"]),
            models.Index(fields=["artist", "-release_date"]),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(duration_seconds__gte=0), name="track_duration_nonnegative")
        ]

    def __str__(self):
        return f"{self.title} — {self.artist.display_name}"


class Playlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="playlists")
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=500, blank=True)
    tracks = models.ManyToManyField(Track, through="PlaylistTrack", related_name="playlists")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [models.UniqueConstraint(fields=["user", "name"], name="unique_playlist_name_per_user")]

    def __str__(self):
        return f"{self.name} ({self.user.email})"


class PlaylistTrack(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="playlist_tracks")
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="playlist_entries")
    position = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position", "added_at"]
        constraints = [
            models.UniqueConstraint(fields=["playlist", "track"], name="unique_track_per_playlist"),
            models.UniqueConstraint(fields=["playlist", "position"], name="unique_playlist_position"),
        ]


class StreamEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="stream_events")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="stream_events")
    listened_at = models.DateTimeField(auto_now_add=True, db_index=True)
    client_session = models.CharField(max_length=80, blank=True)
    seconds_listened = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-listened_at"]
        indexes = [
            models.Index(fields=["user", "-listened_at"]),
            models.Index(fields=["track", "-listened_at"]),
        ]


class DownloadEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="download_events")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="download_events")
    downloaded_at = models.DateTimeField(auto_now_add=True)
