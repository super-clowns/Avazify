from __future__ import annotations

import uuid

import apps.common.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name="Album",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=180)),
                ("cover", models.FileField(upload_to="album_covers/%Y/%m/", validators=[apps.common.validators.validate_image_file])),
                ("release_date", models.DateField(db_index=True)),
                ("genre", models.CharField(db_index=True, max_length=80)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("artist", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="albums", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-release_date", "title"]},
        ),
        migrations.AddConstraint(model_name="album", constraint=models.UniqueConstraint(fields=("artist", "title"), name="unique_album_title_per_artist")),
        migrations.CreateModel(
            name="Track",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=180)),
                ("cover", models.FileField(upload_to="track_covers/%Y/%m/", validators=[apps.common.validators.validate_image_file])),
                ("audio_file", models.FileField(upload_to="tracks/high/%Y/%m/", validators=[apps.common.validators.validate_audio_file])),
                ("audio_low_quality", models.FileField(blank=True, null=True, upload_to="tracks/low/%Y/%m/", validators=[apps.common.validators.validate_audio_file])),
                ("duration_seconds", models.PositiveIntegerField(default=0)),
                ("release_date", models.DateField(db_index=True)),
                ("genre", models.CharField(db_index=True, max_length=80)),
                ("lyrics", models.TextField(blank=True)),
                ("early_access", models.BooleanField(db_index=True, default=False)),
                ("collaborators", models.JSONField(blank=True, default=list)),
                ("imported_streams", models.PositiveBigIntegerField(default=0)),
                ("imported_listeners", models.PositiveBigIntegerField(default=0)),
                ("is_published", models.BooleanField(db_index=True, default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("album", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="tracks", to="music.album")),
                ("artist", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tracks", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-release_date", "title"],
                "indexes": [
                    models.Index(fields=["genre", "-release_date"], name="music_track_genre_rel_idx"),
                    models.Index(fields=["artist", "-release_date"], name="music_track_artist_re_idx"),
                ],
            },
        ),
        migrations.AddConstraint(model_name="track", constraint=models.CheckConstraint(condition=models.Q(("duration_seconds__gte", 0)), name="track_duration_nonnegative")),
        migrations.CreateModel(
            name="Playlist",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=120)),
                ("description", models.CharField(blank=True, max_length=500)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="playlists", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.AddConstraint(model_name="playlist", constraint=models.UniqueConstraint(fields=("user", "name"), name="unique_playlist_name_per_user")),
        migrations.CreateModel(
            name="PlaylistTrack",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("position", models.PositiveIntegerField(default=0)),
                ("added_at", models.DateTimeField(auto_now_add=True)),
                ("playlist", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="playlist_tracks", to="music.playlist")),
                ("track", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="playlist_entries", to="music.track")),
            ],
            options={"ordering": ["position", "added_at"]},
        ),
        migrations.AddConstraint(model_name="playlisttrack", constraint=models.UniqueConstraint(fields=("playlist", "track"), name="unique_track_per_playlist")),
        migrations.AddConstraint(model_name="playlisttrack", constraint=models.UniqueConstraint(fields=("playlist", "position"), name="unique_playlist_position")),
        migrations.AddField(name="tracks", model_name="playlist", field=models.ManyToManyField(related_name="playlists", through="music.PlaylistTrack", to="music.track")),
        migrations.CreateModel(
            name="StreamEvent",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("listened_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("client_session", models.CharField(blank=True, max_length=80)),
                ("seconds_listened", models.PositiveIntegerField(default=0)),
                ("track", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="stream_events", to="music.track")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="stream_events", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-listened_at"],
                "indexes": [
                    models.Index(fields=["user", "-listened_at"], name="music_stream_user_list_idx"),
                    models.Index(fields=["track", "-listened_at"], name="music_stream_track_lis_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="DownloadEvent",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("downloaded_at", models.DateTimeField(auto_now_add=True)),
                ("track", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="download_events", to="music.track")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="download_events", to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
