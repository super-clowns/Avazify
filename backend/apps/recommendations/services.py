from __future__ import annotations

from collections import Counter
from math import log1p

from django.db.models import Count

from apps.music.models import StreamEvent
from apps.music.services import accessible_tracks_for


def recommend_tracks(user, limit=12):
    history = list(
        StreamEvent.objects.filter(user=user)
        .select_related("track__artist")
        .order_by("-listened_at")[:200]
    )
    genre_affinity = Counter(event.track.genre for event in history)
    artist_affinity = Counter(str(event.track.artist_id) for event in history)
    recently_played = {event.track_id for event in history[:30]}
    followed_ids = {str(value) for value in user.followed_users.values_list("id", flat=True)}

    candidates = list(
        accessible_tracks_for(user)
        .exclude(id__in=recently_played)
        .select_related("artist", "album")
        .annotate(streams_count=Count("stream_events"), listeners_count=Count("stream_events__user", distinct=True))[:200]
    )
    if not candidates:
        candidates = list(
            accessible_tracks_for(user)
            .select_related("artist", "album")
            .annotate(streams_count=Count("stream_events"), listeners_count=Count("stream_events__user", distinct=True))[:200]
        )

    def score(track):
        genre_score = genre_affinity[track.genre] * 3.0
        artist_score = artist_affinity[str(track.artist_id)] * 4.0
        follow_score = 20.0 if str(track.artist_id) in followed_ids else 0.0
        popularity_score = log1p(getattr(track, "streams_count", 0)) * 1.5
        freshness_score = max(0.0, (track.release_date.year - 2024) * 0.5)
        return genre_score + artist_score + follow_score + popularity_score + freshness_score

    ranked = sorted(candidates, key=lambda item: (score(item), item.release_date), reverse=True)
    return ranked[:limit]
