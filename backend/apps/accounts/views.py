from __future__ import annotations

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import transaction
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from drf_spectacular.utils import OpenApiResponse, extend_schema

from apps.common.permissions import IsSupportOrAdmin
from apps.support.models import Notification

from .models import ArtistApplication, User
from .serializers import (
    ArtistApplicationReviewSerializer,
    AuthResponseSerializer,
    FollowResponseSerializer,
    ArtistApplicationSerializer,
    ArtistRegistrationSerializer,
    ListenerRegistrationSerializer,
    LoginSerializer,
    LogoutSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    SuccessMessageSerializer,
    UserPreferenceSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


class RegistrationResponseMixin:
    def response_for_user(self, user, request):
        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role
        return Response({
            "success": True,
            "message": "ثبت‌نام با موفقیت انجام شد.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user, context={"request": request}).data,
        }, status=status.HTTP_201_CREATED)


class ListenerRegisterAPIView(RegistrationResponseMixin, APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=ListenerRegistrationSerializer,
        responses={201: AuthResponseSerializer},
        summary="ثبت‌نام شنونده",
        description="یک حساب شنونده ایجاد می‌کند و Access/Refresh JWT را برمی‌گرداند.",
        tags=["auth"],
    )
    def post(self, request):
        serializer = ListenerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self.response_for_user(serializer.save(), request)


class ArtistRegisterAPIView(RegistrationResponseMixin, APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(
        request=ArtistRegistrationSerializer,
        responses={201: AuthResponseSerializer},
        summary="ثبت‌نام هنرمند",
        description="حساب هنرمند با وضعیت pending می‌سازد و نمونه‌کارها را دریافت می‌کند.",
        tags=["auth"],
    )
    def post(self, request):
        serializer = ArtistRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        Notification.objects.create(
            user=user,
            title="درخواست هنرمندی ثبت شد",
            message="درخواست شما در صف بررسی تیم پشتیبانی قرار گرفت.",
            kind=Notification.Kind.VERIFICATION,
            link="/profile",
        )
        return self.response_for_user(user, request)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: AuthResponseSerializer},
        summary="ورود کاربر",
        description="ایمیل و رمز عبور را بررسی کرده و Access/Refresh JWT صادر می‌کند.",
        tags=["auth"],
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = serializer.create_tokens(user)
        return Response({
            "success": True,
            "message": "ورود با موفقیت انجام شد.",
            **tokens,
            "user": UserSerializer(user, context={"request": request}).data,
        })


class LogoutAPIView(APIView):
    @extend_schema(
        request=LogoutSerializer,
        responses={200: SuccessMessageSerializer},
        summary="خروج کاربر",
        description="Refresh token را blacklist می‌کند.",
        tags=["auth"],
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        except TokenError:
            pass
        return Response({"success": True, "message": "خروج با موفقیت انجام شد."})


class PasswordResetRequestAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses={200: SuccessMessageSerializer},
        summary="درخواست بازیابی رمز",
        tags=["auth"],
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email=serializer.validated_data["email"].strip().lower(), is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            send_mail("بازیابی رمز عبور آوازیفای", f"برای تعیین رمز جدید از این لینک استفاده کنید:\n{url}", settings.DEFAULT_FROM_EMAIL, [user.email])
        return Response({"success": True, "message": "در صورت وجود حساب، لینک بازیابی ارسال می‌شود."})


class PasswordResetConfirmAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={200: SuccessMessageSerializer, 400: SuccessMessageSerializer},
        summary="تأیید بازیابی رمز",
        tags=["auth"],
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=user_id)
        except (ValueError, TypeError, User.DoesNotExist):
            return Response({"success": False, "message": "لینک بازیابی معتبر نیست."}, status=400)
        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response({"success": False, "message": "لینک بازیابی منقضی یا نامعتبر است."}, status=400)
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"success": True, "message": "رمز عبور با موفقیت تغییر کرد."})


@extend_schema(tags=["users"])
class UserViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.filter(is_active=True).select_related("preferences").prefetch_related("followed_users")
    search_fields = ("display_name", "username", "email")
    ordering_fields = ("display_name", "date_joined")

    @extend_schema(
        responses={200: UserSerializer},
        summary="نمایه کاربر جاری",
        tags=["users"],
    )
    @action(detail=False, methods=["get"], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def me(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    @extend_schema(
        request=UserUpdateSerializer,
        responses={200: UserSerializer},
        summary="ویرایش نمایه کاربر جاری",
        tags=["users"],
    )
    @me.mapping.patch
    def update_me(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={"request": request}).data)

    @extend_schema(
        request=None,
        responses={204: OpenApiResponse(description="حساب کاربر غیرفعال شد.")},
        summary="غیرفعال‌کردن حساب کاربر جاری",
        tags=["users"],
    )
    @me.mapping.delete
    def delete_me(self, request):
        request.user.is_active = False
        request.user.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        request=UserPreferenceSerializer,
        responses={200: UserPreferenceSerializer},
        summary="ویرایش تنظیمات کاربر",
        tags=["users"],
    )
    @action(detail=False, methods=["patch"], url_path="me/settings")
    def settings(self, request):
        serializer = UserPreferenceSerializer(request.user.preferences, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserPreferenceSerializer(request.user.preferences).data)

    @extend_schema(
        request=None,
        responses={200: FollowResponseSerializer},
        summary="دنبال‌کردن/لغو دنبال‌کردن کاربر",
        tags=["users"],
    )
    @action(detail=True, methods=["post"])
    def follow(self, request, pk=None):
        target = self.get_object()
        if target == request.user:
            return Response({"success": False, "message": "نمی‌توانید خودتان را دنبال کنید."}, status=400)
        if request.user.followed_users.filter(pk=target.pk).exists():
            request.user.followed_users.remove(target)
            following = False
        else:
            request.user.followed_users.add(target)
            following = True
        return Response({"success": True, "following": following})


@extend_schema(tags=["artist-applications"])
class ArtistApplicationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = ArtistApplicationSerializer
    queryset = ArtistApplication.objects.select_related("user", "reviewed_by").prefetch_related("portfolio_items")

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role in {User.Role.SUPPORT, User.Role.ADMIN}:
            return queryset
        return queryset.filter(user=self.request.user)

    @extend_schema(
        request=ArtistApplicationReviewSerializer,
        responses={200: ArtistApplicationSerializer},
        summary="بررسی درخواست هنرمندی",
        tags=["artist-applications"],
    )
    @action(detail=True, methods=["post"], permission_classes=[IsSupportOrAdmin])
    @transaction.atomic
    def review(self, request, pk=None):
        application = self.get_object()
        serializer = ArtistApplicationReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        approved = serializer.validated_data["approved"]
        reason = serializer.validated_data["reason"]
        from django.utils import timezone
        application.status = ArtistApplication.Status.APPROVED if approved else ArtistApplication.Status.REJECTED
        application.rejection_reason = "" if approved else reason
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save()
        application.user.artist_status = User.ArtistStatus.APPROVED if approved else User.ArtistStatus.REJECTED
        application.user.save(update_fields=["artist_status"])
        Notification.objects.create(
            user=application.user,
            title="درخواست هنرمندی تأیید شد" if approved else "درخواست هنرمندی رد شد",
            message="حساب هنرمندی شما فعال شد." if approved else f"علت رد: {reason}",
            kind=Notification.Kind.VERIFICATION,
            link="/studio" if approved else "/profile",
        )
        return Response(ArtistApplicationSerializer(application, context={"request": request}).data)
