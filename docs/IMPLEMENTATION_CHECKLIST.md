# تطبیق پیاده‌سازی با نیازمندی و نمره‌ها

## فاز دوم اصلی

| نیازمندی | وضعیت | محل اصلی |
|---|---|---|
| طراحی مدل‌های لازم | انجام شده | `backend/apps/*/models.py` و Migrationها |
| CRUD متناسب REST | انجام شده | DRF ViewSetها و Serializerها |
| User سفارشی و نقش‌ها | انجام شده | `accounts/models.py` |
| JWT و بازیابی رمز | انجام شده | `accounts/views.py` و `auth_urls.py` |
| Permission نقش و مالکیت | انجام شده | `common/permissions.py` و ViewSetها |
| سه سطح اشتراک | انجام شده | `billing/SubscriptionPlan` و `User.effective_subscription_tier` |
| قیمت پویا | انجام شده | `billing/plans/prices` |
| دوره ۱، ۳، ۶ و ۱۲ ماهه | انجام شده | `billing/services.py` |
| انقضای اشتراک | انجام شده | property مؤثر و command انقضا |
| آپلود آهنگ و تصویر | انجام شده | Multipart + Validatorهای حجم/پسوند |
| MP3/WAV/FLAC | انجام شده | `common/validators.py` |
| ذخیره تنظیمات بین دستگاه‌ها | انجام شده | `UserPreference` API |
| محدودیت ۶۰ Stream | انجام شده | `music/services.py` |
| محدودیت ۶ و ۱۰۰ Playlist | انجام شده | `PlaylistViewSet.perform_create` |
| Early Access طلایی | انجام شده | `accessible_tracks_for` |
| دانلود نقره‌ای/طلایی | انجام شده | `TrackViewSet.download` |
| آمار Stream و شنونده یکتا | انجام شده | `StreamEvent` و Query aggregation |
| تیکت و پیام | انجام شده | `support` app |
| اعلان نقش‌محور | انجام شده | Signals و Notification API |
| تأیید هنرمند | انجام شده | ArtistApplication review |
| گزارش مالی Backend | انجام شده | `generate_artist_reports` |
| تسویه مدیر | انجام شده | Monthly report settle |
| اتصال درگاه | انجام شده | Mock کامل + Zarinpal Sandbox adapter |
| ادغام کامل React و Django | انجام شده | `frontend/src/api` و Context API-backed |
| حداقل ۱۵ تست Backend | انجام شده | ۳۳ تست در `backend/tests/test_api.py` |
| OpenAPI | انجام شده | drf-spectacular |

## امتیازی‌ها

| مورد | وضعیت |
|---|---|
| Docker هر دو پروژه | انجام شده؛ PostgreSQL + Backend + Frontend/Nginx |
| PWA فاز اول | انجام شده؛ Manifest، Icons و Service Worker |
| فعالیت انتخابی | سیستم پیشنهاددهنده محتوایی غیرتصادفی |

## الگوریتم پیشنهاددهنده

امتیاز هر Track با ترکیب این عوامل محاسبه می‌شود:

- فراوانی Genre در سابقه Stream کاربر
- علاقه به Artistهای قبلاً شنیده‌شده
- Artistهای Followشده
- محبوبیت اثر
- تازگی انتشار
- حذف آثاری که کاربر به آن‌ها دسترسی ندارد

برای کاربر بدون سابقه، آثار محبوب و تازه رتبه‌بندی می‌شوند؛ خروجی Random نیست.
