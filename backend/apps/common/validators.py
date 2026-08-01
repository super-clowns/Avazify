from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError

AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg"}


def validate_audio_file(value):
    extension = Path(value.name).suffix.lower()
    if extension not in AUDIO_EXTENSIONS:
        raise ValidationError("فرمت فایل صوتی باید MP3، WAV یا FLAC باشد.")
    if value.size > settings.MAX_AUDIO_UPLOAD_MB * 1024 * 1024:
        raise ValidationError(f"حجم فایل صوتی نباید بیشتر از {settings.MAX_AUDIO_UPLOAD_MB} مگابایت باشد.")


def validate_image_file(value):
    extension = Path(value.name).suffix.lower()
    if extension not in IMAGE_EXTENSIONS:
        raise ValidationError("فرمت تصویر مجاز نیست.")
    if value.size > settings.MAX_IMAGE_UPLOAD_MB * 1024 * 1024:
        raise ValidationError(f"حجم تصویر نباید بیشتر از {settings.MAX_IMAGE_UPLOAD_MB} مگابایت باشد.")
