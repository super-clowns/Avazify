# قرارداد REST API

Base URL: `/api`

تمام endpointها به‌جز ثبت‌نام، ورود، Refresh، بازیابی رمز، Health و Callback پرداخت به JWT نیاز دارند.

## Authentication

| Method | Endpoint | کاربرد |
|---|---|---|
| POST | `/auth/register/listener/` | ثبت‌نام شنونده |
| POST | `/auth/register/artist/` | ثبت‌نام هنرمند و نمونه‌کار Multipart |
| POST | `/auth/login/` | دریافت Access و Refresh Token |
| POST | `/auth/refresh/` | تمدید Access Token |
| POST | `/auth/verify/` | بررسی Token |
| POST | `/auth/logout/` | Blacklist کردن Refresh Token |
| POST | `/auth/password-reset/` | ارسال لینک بازیابی بدون افشای وجود حساب |
| POST | `/auth/password-reset/confirm/` | تعیین رمز جدید با UID و Token |

## Users

| Method | Endpoint | دسترسی |
|---|---|---|
| GET | `/users/` | کاربر واردشده؛ فهرست نمایه‌های عمومی |
| GET/PATCH/DELETE | `/users/me/` | صاحب حساب |
| PATCH | `/users/me/settings/` | صاحب حساب |
| POST | `/users/{id}/follow/` | کاربر واردشده |
| GET | `/users/artist-applications/` | متقاضی خودش؛ پشتیبان/مدیر همه |
| POST | `/users/artist-applications/{id}/review/` | پشتیبان یا مدیر |

## Music

| Method | Endpoint | کاربرد |
|---|---|---|
| GET | `/music/tracks/?search=&ordering=` | جستجو، فیلتر و مرتب‌سازی آثار قابل دسترس |
| POST | `/music/tracks/` | انتشار اثر توسط هنرمند تأییدشده |
| PATCH/DELETE | `/music/tracks/{id}/` | صاحب اثر یا مدیر |
| POST | `/music/tracks/{id}/stream/` | ثبت Stream Event با محدودیت اشتراک |
| GET | `/music/tracks/{id}/download/` | دانلود نقره‌ای/طلایی |
| CRUD | `/music/albums/` | مدیریت آلبوم |
| CRUD | `/music/playlists/` | پلی‌لیست‌های صاحب حساب |
| POST | `/music/playlists/{id}/tracks/` | افزودن آهنگ |
| DELETE | `/music/playlists/{id}/tracks/{trackId}/` | حذف آهنگ |
| PUT | `/music/playlists/{id}/reorder/` | تغییر ترتیب |

آپلود Track با `multipart/form-data` و فیلدهای `audioFile`، `audioLowQuality`، `coverFile`، `title`، `releaseDate`، `genre`، `lyrics`، `earlyAccess` و `albumTitleInput` انجام می‌شود.

## Support

| Method | Endpoint | کاربرد |
|---|---|---|
| GET/DELETE | `/support/notifications/` | اعلان‌های خود کاربر |
| POST | `/support/notifications/{id}/read/` | خواندن یک اعلان |
| POST | `/support/notifications/read-all/` | خواندن همه |
| GET/POST | `/support/tickets/` | تیکت‌های خود کاربر یا همه برای پشتیبان |
| POST | `/support/tickets/{id}/reply/` | پاسخ کاربر یا پشتیبان |
| PATCH | `/support/tickets/{id}/status/` | پشتیبان یا مدیر |

## Billing and reports

| Method | Endpoint | کاربرد |
|---|---|---|
| GET | `/billing/plans/` | قابلیت‌ها و قیمت‌های پویا |
| PATCH | `/billing/plans/prices/` | مدیر |
| POST | `/billing/payments/create/` | خرید ۱، ۳، ۶ یا ۱۲ ماهه |
| GET | `/billing/payments/verify/` | Callback درگاه |
| GET | `/billing/reports/` | گزارش خود هنرمند یا همه برای مدیر |
| POST | `/billing/reports/generate/` | تولید گزارش ماهانه توسط مدیر |
| POST | `/billing/reports/{id}/settle/` | تأیید تسویه توسط مدیر |
| GET | `/billing/admin-summary/` | توزیع اشتراک و درآمد تجمیع‌شده |

## Aggregation and bonus

| Method | Endpoint | کاربرد |
|---|---|---|
| GET | `/bootstrap/` | Payload نقش‌محور و تجمیع‌شده برای Hydrate فرانت‌اند |
| GET | `/recommendations/?limit=12` | پیشنهاد محتوایی و غیرتصادفی |
| GET | `/health/` | Health Check |
| GET | `/schema/` | OpenAPI JSON |
| GET | `/docs/` | Swagger UI |

## قالب خطا

Exception handler پاسخ خطا را به فرم قابل پیش‌بینی نگه می‌دارد. پاسخ‌های تجاری معمولاً شامل این دو فیلدند:

```json
{
  "success": false,
  "message": "متن خطا"
}
```
