from rest_framework.routers import DefaultRouter

from .views import AlbumViewSet, PlaylistViewSet, TrackViewSet

router = DefaultRouter()
router.register("tracks", TrackViewSet, basename="track")
router.register("albums", AlbumViewSet, basename="album")
router.register("playlists", PlaylistViewSet, basename="playlist")
urlpatterns = router.urls
