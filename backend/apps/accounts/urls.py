from rest_framework.routers import DefaultRouter

from .views import ArtistApplicationViewSet, UserViewSet

router = DefaultRouter()
router.register("", UserViewSet, basename="user")
router.register("artist-applications", ArtistApplicationViewSet, basename="artist-application")
urlpatterns = router.urls
