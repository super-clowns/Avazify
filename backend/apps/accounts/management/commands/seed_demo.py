from __future__ import annotations

import shutil
from datetime import date, datetime
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import ArtistApplication, User
from apps.billing.models import MonthlyArtistReport, SubscriptionPlan
from apps.music.models import Album, Playlist, PlaylistTrack, StreamEvent, Track
from apps.support.models import Notification, Ticket, TicketMessage


class Command(BaseCommand):
    help = "Seed a complete Avazify demo database."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete existing application data first.")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            User.objects.all().delete()
            SubscriptionPlan.objects.all().delete()
            if settings.MEDIA_ROOT.exists():
                shutil.rmtree(settings.MEDIA_ROOT)

        plans = {
            "free": SubscriptionPlan.objects.update_or_create(
                tier="free",
                defaults={
                    "display_name": "پایه",
                    "monthly_price": 0,
                    "daily_stream_limit": 60,
                    "playlist_limit": 6,
                    "can_upload_avatar": False,
                    "can_download": False,
                    "early_access": False,
                    "analytics_access": False,
                },
            )[0],
            "silver": SubscriptionPlan.objects.update_or_create(
                tier="silver",
                defaults={
                    "display_name": "نقره‌ای",
                    "monthly_price": 189000,
                    "daily_stream_limit": None,
                    "playlist_limit": 100,
                    "can_upload_avatar": True,
                    "can_download": True,
                    "early_access": False,
                    "analytics_access": False,
                },
            )[0],
            "gold": SubscriptionPlan.objects.update_or_create(
                tier="gold",
                defaults={
                    "display_name": "طلایی",
                    "monthly_price": 329000,
                    "daily_stream_limit": None,
                    "playlist_limit": None,
                    "can_upload_avatar": True,
                    "can_download": True,
                    "early_access": True,
                    "analytics_access": True,
                },
            )[0],
        }

        user_specs = [
            ("sara@example.com", "سارا نیک‌پی", "sara_nikpey", "listener", "free", "not-applicable", "شنونده موسیقی مستقل، پاپ و الکترونیک.", "female", "2002-05-18", 3820, None),
            ("arman@example.com", "آرمان فرهمند", "arman_farhamand", "listener", "gold", "not-applicable", "دنبال‌کننده انتشارهای تازه و موسیقی سینمایی.", "male", "2000-09-07", 18490, "avatar-arman.svg"),
            ("nila.artist@example.com", "نیلا", "nila.music", "artist", "gold", "approved", "خواننده و آهنگساز الکترونیک؛ روایت شب، شهر و سکوت.", "female", "1998-04-22", 1680000, "avatar-nila.svg"),
            ("kian.artist@example.com", "کیان سپهر", "kian.sepehr", "artist", "silver", "approved", "سازنده موسیقی بی‌کلام و تلفیقی.", "male", "1996-11-14", 782000, "avatar-kian.svg"),
            ("roya.artist@example.com", "رویا آذر", "roya.azar", "artist", "free", "approved", "موسیقی آکوستیک با حال‌وهوای صمیمی.", "female", "2001-01-29", 274000, "avatar-roya.svg"),
            ("ava.pending@example.com", "آوا ماهان", "ava.mahan", "artist", "free", "pending", "در انتظار تأیید حساب هنرمند.", "prefer-not-to-say", None, 0, None),
            ("support@example.com", "پارسا راد", "support.parsa", "support", "gold", "not-applicable", "کارشناس پشتیبانی آوازیفای.", "prefer-not-to-say", None, 0, None),
            ("admin@example.com", "مدیر سامانه", "avazify.admin", "admin", "gold", "not-applicable", "مدیریت کل سامانه آوازیفای.", "prefer-not-to-say", None, 0, None),
            ("danial@example.com", "دانیال مهر", "danial.mehr", "artist", "free", "pending", "هنرمند متقاضی.", "prefer-not-to-say", None, 0, None),
        ]
        users = {}
        for email, display, username, role, tier, artist_status, bio, gender, birth, imported, avatar_name in user_specs:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "display_name": display,
                    "username": username,
                    "role": role,
                    "subscription_tier": tier,
                    "artist_status": artist_status,
                    "bio": bio,
                    "gender": gender,
                    "birth_date": date.fromisoformat(birth) if birth else None,
                    "imported_total_streams": imported,
                    "is_staff": role == "admin",
                    "is_superuser": role == "admin",
                },
            )
            if created:
                user.set_password("Demo1234")
            else:
                user.display_name = display
                user.username = username
                user.role = role
                user.subscription_tier = tier
                user.artist_status = artist_status
                user.bio = bio
                user.gender = gender
                user.birth_date = date.fromisoformat(birth) if birth else None
                user.imported_total_streams = imported
            if tier in {"silver", "gold"} and role not in {"support", "admin"}:
                user.subscription_expires_at = timezone.make_aware(datetime(2027, 3, 1))
            else:
                user.subscription_expires_at = None
            user.save()
            if avatar_name and not user.avatar:
                self._save_asset(user.avatar, "covers", avatar_name)
                user.save(update_fields=["avatar"])
            users[email] = user

        users["sara@example.com"].followed_users.set([users["nila.artist@example.com"], users["kian.artist@example.com"]])
        users["arman@example.com"].followed_users.set([users["nila.artist@example.com"], users["kian.artist@example.com"], users["roya.artist@example.com"]])
        users["nila.artist@example.com"].followed_users.set([users["roya.artist@example.com"]])

        applications = [
            ("ava.pending@example.com", "آوا ماهان", ["https://example.com/ava-demo"], "pending", ""),
            ("danial@example.com", "دانیال مهر", ["https://example.com/danial"], "pending", ""),
            ("nila.artist@example.com", "نیلا", ["https://example.com/nila"], "approved", ""),
            ("kian.artist@example.com", "کیان سپهر", ["https://example.com/kian"], "approved", ""),
            ("roya.artist@example.com", "رویا آذر", ["https://example.com/roya"], "approved", ""),
        ]
        for email, name, portfolio, status_value, reason in applications:
            ArtistApplication.objects.update_or_create(
                user=users[email],
                defaults={"artist_name": name, "portfolio_urls": portfolio, "status": status_value, "rejection_reason": reason},
            )

        albums = {
            "after": self._album(users["nila.artist@example.com"], "بعد از نیمه‌شب", "after-midnight.svg", "2026-07-18", "الکترونیک"),
            "road": self._album(users["kian.artist@example.com"], "جاده باز", "open-road.svg", "2026-06-29", "تلفیقی"),
        }
        track_specs = [
            ("neon", "شهر نئون", "nila.artist@example.com", albums["after"], "neon-city.svg", 194, "2026-07-18", 184300, 502900, "الکترونیک", "چراغ‌ها روشن‌اند\nشهر هنوز بیدار است\nمن میان خیابان\nدنبال یک صدا هستم", False, []),
            ("midnight", "بعد از نیمه‌شب", "nila.artist@example.com", albums["after"], "after-midnight.svg", 223, "2026-07-18", 171600, 461200, "الکترونیک", "بعد از نیمه‌شب\nوقتی شهر آرام است\nصدای تو نزدیک\nو فاصله کوتاه است", False, ["کیان سپهر"]),
            ("blue", "پنجره آبی", "nila.artist@example.com", albums["after"], "blue-window.svg", 207, "2026-07-18", 143100, 389800, "الکترونیک", "از پنجره آبی\nآسمان نزدیک‌تر است\nیک خط نور آرام\nروی دیوار می‌لغزد", False, []),
            ("north", "باد شمال", "kian.artist@example.com", albums["road"], "north-wind.svg", 248, "2026-06-29", 112500, 301700, "تلفیقی", "", False, []),
            ("road", "جاده باز", "kian.artist@example.com", albums["road"], "open-road.svg", 231, "2026-06-29", 98700, 267300, "تلفیقی", "", False, []),
            ("paper", "قایق کاغذی", "roya.artist@example.com", None, "paper-boat.svg", 176, "2026-07-08", 87400, 214900, "آکوستیک", "قایق کاغذی من\nروی آب روانه شد\nبرد همه حرف‌ها را\nتا کنار دریا شد", False, []),
            ("rain", "باران اول", "roya.artist@example.com", None, "first-rain.svg", 201, "2026-05-21", 65300, 179200, "آکوستیک", "باران اول رسید\nروی شیشه نام تو را نوشت\nکوچه پر از خاطره شد\nو زمان آرام گذشت", False, []),
            ("solaris", "سولاریس", "nila.artist@example.com", None, "solaris.svg", 215, "2026-08-02", 32600, 48100, "الکترونیک", "رو به خورشید\nدر مدار روشن\nدور از سایه‌ها\nبه سمت فردا", True, []),
            ("sea", "دریای خاموش", "kian.artist@example.com", None, "silent-sea.svg", 264, "2026-08-09", 21900, 33700, "بی‌کلام", "", True, []),
        ]
        tracks = {}
        for key, title, artist_email, album, cover, duration, release, listeners, streams, genre, lyrics, early, collaborators in track_specs:
            track, _ = Track.objects.get_or_create(
                artist=users[artist_email], title=title,
                defaults={
                    "album": album,
                    "duration_seconds": duration,
                    "release_date": date.fromisoformat(release),
                    "genre": genre,
                    "lyrics": lyrics,
                    "early_access": early,
                    "collaborators": collaborators,
                    "imported_listeners": listeners,
                    "imported_streams": streams,
                },
            )
            track.album = album
            track.duration_seconds = duration
            track.release_date = date.fromisoformat(release)
            track.genre = genre
            track.lyrics = lyrics
            track.early_access = early
            track.collaborators = collaborators
            track.imported_listeners = listeners
            track.imported_streams = streams
            if not track.cover:
                self._save_asset(track.cover, "covers", cover)
            if not track.audio_file:
                self._save_asset(track.audio_file, "audio", "avazify-demo.wav")
            track.save()
            tracks[key] = track

        playlist_specs = [
            (users["sara@example.com"], "شب‌های آرام", "موسیقی برای مطالعه و خلوت شبانه", ["midnight", "blue", "rain"]),
            (users["sara@example.com"], "در مسیر", "برای رانندگی و سفر", ["road", "north", "paper"]),
            (users["arman@example.com"], "کشف هفته", "انتخاب‌های تازه این هفته", ["solaris", "sea", "paper"]),
        ]
        for owner, name, description, track_keys in playlist_specs:
            playlist, _ = Playlist.objects.update_or_create(user=owner, name=name, defaults={"description": description})
            playlist.playlist_tracks.all().delete()
            for position, track_key in enumerate(track_keys):
                PlaylistTrack.objects.create(playlist=playlist, track=tracks[track_key], position=position)

        notifications = [
            ("sara@example.com", "انتشار تازه از نیلا", "تک‌آهنگ «سولاریس» برای کاربران طلایی زودتر منتشر شده است.", "music", f"/artist/{users['nila.artist@example.com'].id}", False),
            ("sara@example.com", "محدودیت استریم روزانه", "۲۴ مورد از ۶۰ استریم امروز خود را استفاده کرده‌اید.", "subscription", "/settings", False),
            ("nila.artist@example.com", "گزارش مالی تیرماه", "محاسبات مالی ماه جاری تکمیل شده و آماده بررسی است.", "finance", "/studio", False),
            ("ava.pending@example.com", "درخواست در حال بررسی است", "نمونه‌کارهای شما دریافت شد و نتیجه از همین بخش اعلام می‌شود.", "verification", "/profile", False),
            ("admin@example.com", "درخواست احراز هویت جدید", "درخواست هنرمندی آوا ماهان برای بررسی آماده است.", "verification", "/dashboard", False),
        ]
        for email, title, message, kind, link, read in notifications:
            Notification.objects.get_or_create(user=users[email], title=title, defaults={"message": message, "kind": kind, "link": link, "read": read})

        ticket_specs = [
            ("sara@example.com", "دانلود آفلاین در اشتراک پایه", "open", [("user", "آیا در اشتراک پایه امکان دانلود آهنگ برای حالت آفلاین وجود دارد؟")]),
            ("arman@example.com", "نمایش ندادن متن آهنگ", "answered", [("user", "برای بعضی آهنگ‌ها بخش متن خالی است."), ("support", "متن فقط برای آثاری نمایش داده می‌شود که هنرمند آن را ثبت کرده باشد.")]),
            ("sara@example.com", "ویرایش نام نمایشی", "closed", [("user", "نام نمایشی را از کجا تغییر بدهم؟"), ("support", "از صفحه نمایه روی دکمه ویرایش اطلاعات بزنید.")]),
        ]
        for email, subject, ticket_status, messages in ticket_specs:
            ticket, _ = Ticket.objects.get_or_create(user=users[email], subject=subject, defaults={"status": ticket_status})
            ticket.status = ticket_status
            ticket.save(update_fields=["status"])
            ticket.messages.all().delete()
            TicketMessage.objects.bulk_create([
                TicketMessage(
                    ticket=ticket,
                    author=users["support@example.com"] if author_kind == "support" else users[email],
                    author_kind=author_kind,
                    body=body,
                )
                for author_kind, body in messages
            ])

        report_specs = [
            ("nila.artist@example.com", 284300, 1353900, 24296150, "pending"),
            ("kian.artist@example.com", 126100, 569000, 10508750, "pending"),
            ("roya.artist@example.com", 43100, 394100, 5280350, "settled"),
        ]
        for email, unique, streams, reward, report_status in report_specs:
            MonthlyArtistReport.objects.update_or_create(
                artist=users[email], year=2026, month=7,
                defaults={"unique_listeners": unique, "streams": streams, "reward": reward, "status": report_status},
            )

        if not StreamEvent.objects.filter(user=users["sara@example.com"], listened_at__date=timezone.localdate()).exists():
            for index in range(24):
                StreamEvent.objects.create(user=users["sara@example.com"], track=tracks["neon" if index % 2 == 0 else "paper"])
        if not StreamEvent.objects.filter(user=users["arman@example.com"], listened_at__date=timezone.localdate()).exists():
            for index in range(18):
                StreamEvent.objects.create(user=users["arman@example.com"], track=tracks["solaris" if index % 2 == 0 else "sea"])

        self.stdout.write(self.style.SUCCESS("Avazify demo data is ready. Password for demo users: Demo1234"))

    def _asset_path(self, group, name):
        return Path(settings.BASE_DIR) / "seed_assets" / group / name

    def _save_asset(self, field, group, name):
        path = self._asset_path(group, name)
        with path.open("rb") as handle:
            field.save(name, File(handle), save=False)

    def _album(self, artist, title, cover_name, release_date, genre):
        album, _ = Album.objects.get_or_create(
            artist=artist, title=title,
            defaults={"release_date": date.fromisoformat(release_date), "genre": genre},
        )
        album.release_date = date.fromisoformat(release_date)
        album.genre = genre
        if not album.cover:
            self._save_asset(album.cover, "covers", cover_name)
        album.save()
        return album
