import base64
import binascii
import uuid
from pathlib import Path

from django.core.files.base import ContentFile
from rest_framework import serializers


class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith("data:image"):
            try:
                header, encoded = data.split(";base64,", 1)
                extension = header.split("/")[-1].replace("svg+xml", "svg")
                decoded = base64.b64decode(encoded)
            except (ValueError, binascii.Error) as exc:
                raise serializers.ValidationError("تصویر Base64 معتبر نیست.") from exc
            data = ContentFile(decoded, name=f"{uuid.uuid4().hex}.{extension}")
        return super().to_internal_value(data)


class FlexibleImageField(serializers.FileField):
    """Accept regular image uploads, SVG files, or data URLs."""

    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith("data:image"):
            try:
                header, encoded = data.split(";base64,", 1)
                extension = header.split("/")[-1].replace("svg+xml", "svg")
                decoded = base64.b64decode(encoded)
            except (ValueError, binascii.Error) as exc:
                raise serializers.ValidationError("تصویر Base64 معتبر نیست.") from exc
            data = ContentFile(decoded, name=f"{uuid.uuid4().hex}.{extension}")
        value = super().to_internal_value(data)
        if Path(value.name).suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".svg"}:
            raise serializers.ValidationError("فرمت تصویر مجاز نیست.")
        return value
