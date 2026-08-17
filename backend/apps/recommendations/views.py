from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from apps.music.serializers import TrackSerializer

from .serializers import RecommendationResponseSerializer
from .services import recommend_tracks


class RecommendationAPIView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter(name="limit", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=False, description="تعداد پیشنهادها بین 1 تا 30", default=12),
        ],
        responses={200: RecommendationResponseSerializer},
        summary="پیشنهاد آهنگ برای کاربر",
        description="بر اساس سابقه شنیدن، ژانر، هنرمند، دنبال‌کردن، محبوبیت و تازگی رتبه‌بندی می‌کند.",
        tags=["recommendations"],
    )
    def get(self, request):
        try:
            limit = min(30, max(1, int(request.query_params.get("limit", 12))))
        except ValueError:
            limit = 12
        tracks = recommend_tracks(request.user, limit=limit)
        return Response({
            "strategy": "content-based-history-follow-popularity",
            "results": TrackSerializer(tracks, many=True, context={"request": request}).data,
        })
