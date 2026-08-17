from rest_framework import serializers

from apps.music.serializers import TrackSerializer


class RecommendationResponseSerializer(serializers.Serializer):
    strategy = serializers.CharField()
    results = TrackSerializer(many=True)
