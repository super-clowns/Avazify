from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.common.views import BootstrapAPIView, HealthAPIView, DemoResetAPIView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthAPIView.as_view(), name="health"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/bootstrap/", BootstrapAPIView.as_view(), name="bootstrap"),
    path("api/system/reset-demo/", DemoResetAPIView.as_view(), name="reset-demo"),
    path("api/auth/", include("apps.accounts.auth_urls")),
    path("api/users/", include("apps.accounts.urls")),
    path("api/music/", include("apps.music.urls")),
    path("api/support/", include("apps.support.urls")),
    path("api/billing/", include("apps.billing.urls")),
    path("api/recommendations/", include("apps.recommendations.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
