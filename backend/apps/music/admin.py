from django.contrib import admin

from .models import Album, DownloadEvent, Playlist, PlaylistTrack, StreamEvent, Track

admin.site.register(Album)
admin.site.register(Track)
admin.site.register(Playlist)
admin.site.register(PlaylistTrack)
admin.site.register(StreamEvent)
admin.site.register(DownloadEvent)
