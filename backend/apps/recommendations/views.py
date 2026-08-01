from rest_framework.response import Response
from rest_framework.views import APIView

from apps.music.serializers import TrackSerializer

from .services import recommend_tracks


class RecommendationAPIView(APIView):
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
