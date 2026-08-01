from __future__ import annotations

import shutil
import tempfile
from datetime import date
from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import ArtistApplication, User
from apps.billing.models import MonthlyArtistReport, PaymentTransaction, SubscriptionPlan
from apps.billing.services import calculate_payment_amount, generate_artist_reports
from apps.music.models import Playlist, StreamEvent, Track
from apps.recommendations.services import recommend_tracks
from apps.support.models import Notification, Ticket, TicketMessage


TEST_MEDIA_ROOT = tempfile.mkdtemp(prefix="avazify-test-media-")


def svg_file(name="cover.svg"):
    return SimpleUploadedFile(name, b'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"/>', content_type="image/svg+xml")


def audio_file(name="demo.wav"):
    return SimpleUploadedFile(name, b"RIFF\x00\x00\x00\x00WAVEfmt ", content_type="audio/wav")


@override_settings(MEDIA_ROOT=TEST_MEDIA_ROOT, PAYMENT_PROVIDER="mock", EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class AvazifyAPITests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEST_MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        SubscriptionPlan.objects.create(
            tier="free", display_name="پایه", monthly_price=0, daily_stream_limit=60,
            playlist_limit=6, can_upload_avatar=False, can_download=False,
            early_access=False, analytics_access=False,
        )
        SubscriptionPlan.objects.create(
            tier="silver", display_name="نقره‌ای", monthly_price=189000,
            daily_stream_limit=None, playlist_limit=100, can_upload_avatar=True,
            can_download=True, early_access=False, analytics_access=False,
        )
        SubscriptionPlan.objects.create(
            tier="gold", display_name="طلایی", monthly_price=329000,
            daily_stream_limit=None, playlist_limit=None, can_upload_avatar=True,
            can_download=True, early_access=True, analytics_access=True,
        )
        self.listener = User.objects.create_user(
            email="listener@example.com", password="Demo1234", display_name="کاربر شنونده",
            role=User.Role.LISTENER,
        )
        self.gold = User.objects.create_user(
            email="gold@example.com", password="Demo1234", display_name="کاربر طلایی",
            role=User.Role.LISTENER, subscription_tier=User.SubscriptionTier.GOLD,
            subscription_expires_at=timezone.now() + timezone.timedelta(days=30),
        )
        self.artist = User.objects.create_user(
            email="artist@example.com", password="Demo1234", display_name="هنرمند تأییدشده",
            role=User.Role.ARTIST, artist_status=User.ArtistStatus.APPROVED,
        )
        self.pending_artist = User.objects.create_user(
            email="pending@example.com", password="Demo1234", display_name="هنرمند منتظر",
            role=User.Role.ARTIST, artist_status=User.ArtistStatus.PENDING,
        )
        self.application = ArtistApplication.objects.create(
            user=self.pending_artist, artist_name=self.pending_artist.display_name,
            portfolio_urls=["https://example.com/portfolio"],
        )
        self.support = User.objects.create_user(
            email="support@example.com", password="Demo1234", display_name="پشتیبان",
            role=User.Role.SUPPORT,
        )
        self.admin = User.objects.create_superuser(
            email="admin@example.com", password="Demo1234", display_name="مدیر",
        )
        self.track = Track.objects.create(
            title="آهنگ عمومی", artist=self.artist, cover=svg_file("public.svg"),
            audio_file=audio_file("public.wav"), duration_seconds=180,
            release_date=date.today(), genre="پاپ", early_access=False,
        )
        self.early_track = Track.objects.create(
            title="دسترسی زودهنگام", artist=self.artist, cover=svg_file("early.svg"),
            audio_file=audio_file("early.wav"), duration_seconds=200,
            release_date=date.today(), genre="الکترونیک", early_access=True,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    # Authentication and user module
    def test_listener_registration_creates_free_user_and_tokens(self):
        response = self.client.post(reverse("register-listener"), {
            "displayName": "کاربر جدید", "email": "new@example.com",
            "password": "StrongDemo#2026", "birthDate": "2002-05-12", "gender": "other",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        user = User.objects.get(email="new@example.com")
        self.assertEqual(user.subscription_tier, User.SubscriptionTier.FREE)
        self.assertTrue(hasattr(user, "preferences"))

    def test_duplicate_registration_is_rejected(self):
        response = self.client.post(reverse("register-listener"), {
            "displayName": "تکراری", "email": self.listener.email,
            "password": "StrongDemo#2026", "birthDate": "2002-05-12", "gender": "female",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_jwt_pair(self):
        response = self.client.post(reverse("login"), {"email": self.listener.email, "password": "Demo1234"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_login_is_rejected(self):
        response = self.client.post(reverse("login"), {"email": self.listener.email, "password": "wrong"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_request_does_not_leak_account_existence(self):
        first = self.client.post(reverse("password-reset"), {"email": self.listener.email}, format="json")
        second = self.client.post(reverse("password-reset"), {"email": "missing@example.com"}, format="json")
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(first.data["message"], second.data["message"])

    def test_user_can_update_profile(self):
        self.authenticate(self.listener)
        response = self.client.patch(reverse("user-me"), {"displayName": "نام تازه", "bio": "درباره من"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.listener.refresh_from_db()
        self.assertEqual(self.listener.display_name, "نام تازه")

    def test_free_user_cannot_upload_avatar(self):
        self.authenticate(self.listener)
        response = self.client.patch(reverse("user-me"), {"avatar": svg_file("avatar.svg")}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_preferences_are_synchronized_in_backend(self):
        self.authenticate(self.listener)
        response = self.client.patch(reverse("user-settings"), {
            "soundEnabled": False,
            "compactMode": True,
            "language": "en",
            "notifications": {"subscriptionExpiry": False},
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.listener.preferences.refresh_from_db()
        self.assertFalse(self.listener.preferences.sound_enabled)
        self.assertTrue(self.listener.preferences.compact_mode)
        self.assertFalse(self.listener.preferences.notify_subscription_expiry)

    def test_follow_action_toggles_relation(self):
        self.authenticate(self.listener)
        url = reverse("user-follow", args=[self.artist.pk])
        first = self.client.post(url)
        second = self.client.post(url)
        self.assertTrue(first.data["following"])
        self.assertFalse(second.data["following"])

    def test_protected_endpoint_requires_authentication(self):
        response = self.client.get(reverse("bootstrap"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # Music, access and playlists
    def test_early_access_hidden_from_free_user(self):
        self.authenticate(self.listener)
        response = self.client.get(reverse("track-list"))
        ids = {item["id"] for item in response.data["results"]}
        self.assertIn(str(self.track.id), ids)
        self.assertNotIn(str(self.early_track.id), ids)

    def test_gold_user_can_see_early_access(self):
        self.authenticate(self.gold)
        response = self.client.get(reverse("track-list"))
        ids = {item["id"] for item in response.data["results"]}
        self.assertIn(str(self.early_track.id), ids)

    def test_pending_artist_cannot_upload_track(self):
        self.authenticate(self.pending_artist)
        response = self.client.post(reverse("track-list"), {
            "title": "اثر ردشده", "duration": 120, "releaseDate": str(date.today()),
            "genre": "پاپ", "earlyAccess": False, "coverFile": svg_file(), "audioFile": audio_file(),
        }, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approved_artist_can_upload_track(self):
        self.authenticate(self.artist)
        response = self.client.post(reverse("track-list"), {
            "title": "اثر جدید", "duration": 120, "releaseDate": str(date.today()),
            "genre": "پاپ", "earlyAccess": False, "albumTitleInput": "آلبوم جدید",
            "coverFile": svg_file("new.svg"), "audioFile": audio_file("new.wav"),
        }, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Track.objects.filter(title="اثر جدید", artist=self.artist).exists())

    def test_artist_cannot_edit_another_artist_track(self):
        other_artist = User.objects.create_user(
            email="otherartist@example.com", password="Demo1234", display_name="هنرمند دیگر",
            role=User.Role.ARTIST, artist_status=User.ArtistStatus.APPROVED,
        )
        self.authenticate(other_artist)
        response = self.client.patch(reverse("track-detail", args=[self.track.pk]), {"title": "سرقت"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_free_stream_limit_is_enforced(self):
        StreamEvent.objects.bulk_create([StreamEvent(track=self.track, user=self.listener) for _ in range(60)])
        self.authenticate(self.listener)
        response = self.client.post(reverse("track-stream", args=[self.track.pk]), {"secondsListened": 20}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_stream_event_is_created(self):
        self.authenticate(self.listener)
        response = self.client.post(reverse("track-stream", args=[self.track.pk]), {"secondsListened": 30}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StreamEvent.objects.filter(user=self.listener, track=self.track).count(), 1)

    def test_free_user_download_is_forbidden(self):
        self.authenticate(self.listener)
        response = self.client.get(reverse("track-download", args=[self.track.pk]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_playlist_limit_is_enforced(self):
        for number in range(6):
            Playlist.objects.create(user=self.listener, name=f"لیست {number}")
        self.authenticate(self.listener)
        response = self.client.post(reverse("playlist-list"), {"name": "هفتم", "description": ""}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_and_remove_playlist_track(self):
        playlist = Playlist.objects.create(user=self.listener, name="مورد علاقه")
        self.authenticate(self.listener)
        added = self.client.post(reverse("playlist-add-track", args=[playlist.pk]), {"trackId": str(self.track.pk)}, format="json")
        self.assertEqual(added.status_code, status.HTTP_201_CREATED)
        removed = self.client.delete(reverse("playlist-remove-track", args=[playlist.pk, self.track.pk]))
        self.assertEqual(removed.status_code, status.HTTP_204_NO_CONTENT)

    # Support and artist review
    def test_listener_can_create_ticket_with_first_message(self):
        self.authenticate(self.listener)
        response = self.client.post(reverse("ticket-list"), {"subject": "کمک", "message": "مشکل من حل نمی‌شود"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ticket = Ticket.objects.get(pk=response.data["id"])
        self.assertEqual(ticket.messages.count(), 1)
        self.assertTrue(Notification.objects.filter(user=self.support, kind="support").exists())

    def test_support_can_reply_and_ticket_becomes_answered(self):
        ticket = Ticket.objects.create(user=self.listener, subject="پرسش")
        TicketMessage.objects.create(ticket=ticket, author=self.listener, author_kind="user", body="سلام")
        self.authenticate(self.support)
        response = self.client.post(reverse("ticket-reply", args=[ticket.pk]), {"body": "پاسخ پشتیبانی"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, Ticket.Status.ANSWERED)
        self.assertTrue(Notification.objects.filter(user=self.listener, title="پاسخ جدید پشتیبانی").exists())

    def test_listener_cannot_change_ticket_status(self):
        ticket = Ticket.objects.create(user=self.listener, subject="پرسش")
        self.authenticate(self.listener)
        response = self.client.patch(reverse("ticket-status", args=[ticket.pk]), {"status": "closed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_support_can_approve_artist_application(self):
        self.authenticate(self.support)
        response = self.client.post(reverse("artist-application-review", args=[self.application.pk]), {"approved": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.pending_artist.refresh_from_db()
        self.assertEqual(self.pending_artist.artist_status, User.ArtistStatus.APPROVED)

    def test_artist_rejection_requires_reason(self):
        self.authenticate(self.support)
        response = self.client.post(reverse("artist-application-review", args=[self.application.pk]), {"approved": False, "reason": "کوتاه"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Billing, reports and bonus recommendation
    def test_admin_can_update_dynamic_prices(self):
        self.authenticate(self.admin)
        response = self.client.patch(reverse("subscription-plan-prices"), {"silver": 200000, "gold": 350000}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(SubscriptionPlan.objects.get(pk="gold").monthly_price, 350000)

    def test_non_admin_cannot_update_prices(self):
        self.authenticate(self.listener)
        response = self.client.patch(reverse("subscription-plan-prices"), {"silver": 200000, "gold": 350000}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_payment_discount_calculation(self):
        amount, discount = calculate_payment_amount(100000, 12)
        self.assertEqual(discount, 15)
        self.assertEqual(amount, 1020000)

    def test_mock_payment_activates_selected_duration(self):
        self.authenticate(self.listener)
        response = self.client.post(reverse("payment-create"), {"tier": "silver", "duration": 6}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.listener.refresh_from_db()
        self.assertEqual(self.listener.subscription_tier, User.SubscriptionTier.SILVER)
        self.assertEqual(response.data["transaction"]["status"], PaymentTransaction.Status.VERIFIED)
        self.assertIsNotNone(self.listener.subscription_expires_at)

    def test_report_generation_aggregates_streams_and_unique_listeners(self):
        StreamEvent.objects.create(track=self.track, user=self.listener)
        StreamEvent.objects.create(track=self.track, user=self.listener)
        StreamEvent.objects.create(track=self.track, user=self.gold)
        today = timezone.localdate()
        reports = generate_artist_reports(today.year, today.month)
        report = next(item for item in reports if item.artist_id == self.artist.id)
        self.assertEqual(report.streams, 3)
        self.assertEqual(report.unique_listeners, 2)
        self.assertEqual(report.reward, Decimal("116"))

    def test_admin_can_settle_finance_record(self):
        report = MonthlyArtistReport.objects.create(artist=self.artist, year=2026, month=1, streams=10, reward=1000)
        self.authenticate(self.admin)
        response = self.client.post(reverse("monthly-report-settle", args=[report.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertEqual(report.status, MonthlyArtistReport.Status.SETTLED)

    def test_recommendation_prefers_listened_genre(self):
        pop_track = Track.objects.create(
            title="پاپ دوم", artist=self.artist, cover=svg_file("pop2.svg"), audio_file=audio_file("pop2.wav"),
            duration_seconds=160, release_date=date.today(), genre="پاپ",
        )
        rock_track = Track.objects.create(
            title="راک", artist=self.artist, cover=svg_file("rock.svg"), audio_file=audio_file("rock.wav"),
            duration_seconds=160, release_date=date.today(), genre="راک",
        )
        for _ in range(4):
            StreamEvent.objects.create(track=self.track, user=self.listener)
        recommendations = recommend_tracks(self.listener, limit=10)
        ids = [item.id for item in recommendations]
        self.assertLess(ids.index(pop_track.id), ids.index(rock_track.id))

    def test_bootstrap_returns_role_aware_aggregated_payload(self):
        self.authenticate(self.listener)
        response = self.client.get(reverse("bootstrap"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for key in ("currentUser", "users", "tracks", "albums", "playlists", "notifications", "tickets", "finance", "prices", "recommendations", "billingSummary"):
            self.assertIn(key, response.data)
