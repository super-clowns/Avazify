# متن و ترتیب ارائه بک‌اند

## معرفی ۳۰ ثانیه‌ای

«بک‌اند آوازیفای با Django REST Framework و PostgreSQL پیاده شده است. سیستم یک User سفارشی با چهار نقش و سه سطح اشتراک دارد. تمام داده‌های فاز اول از Local Storage خارج و به API واقعی، پایگاه‌داده، JWT، آپلود فایل و Permissionهای سمت سرور متصل شده‌اند. معماری به Appهای accounts، music، support، billing و recommendations تفکیک شده است.»

## ترتیب نمایش کد

1. `avazify/settings.py`: Appها، JWT، PostgreSQL، Media و REST settings
2. `accounts/models.py`: User سفارشی، نقش، اشتراک، Preference و ArtistApplication
3. `music/models.py`: Track، Album، Playlist و StreamEvent
4. `music/services.py`: Early Access و محدودیت ۶۰ Stream
5. `support/models.py` و `support/views.py`: Ticket و پیام
6. `billing/models.py` و `billing/services.py`: قیمت، تراکنش و پاداش
7. `common/views.py`: Bootstrap تجمیع‌شده
8. `recommendations/services.py`: فعالیت امتیازی
9. `tests/test_api.py`: تست‌ها
10. `docker-compose.yml`: اجرای نهایی

## جریان ورود

```text
React Login Form
→ POST /api/auth/login/
→ authenticate(email, password)
→ Access + Refresh JWT
→ GET /api/bootstrap/
→ داده نقش‌محور
```

Refresh Token در Logout Blacklist می‌شود و Access Token عمر کوتاه دارد.

## جریان پخش

```text
Play Track
→ POST /tracks/{id}/stream/
→ بررسی Early Access
→ محاسبه تعداد Stream امروز
→ اعمال سقف اشتراک پایه
→ ثبت StreamEvent
→ برگرداندن آمار تجمیع‌شده
```

StreamEvent منبع مشترک محدودیت، گزارش، آمار و پیشنهاددهنده است.

## جریان انتشار اثر

```text
هنرمند تأییدشده
→ multipart upload
→ بررسی Permission
→ Validation فرمت و حجم
→ ساخت یا اتصال Album
→ ذخیره Track و فایل‌ها
```

فقط صاحب اثر یا مدیر امکان ویرایش/حذف دارد.

## جریان تیکت

```text
کاربر تیکت می‌سازد
→ اولین TicketMessage
→ Signal اعلان برای پشتیبان/مدیر
→ پاسخ پشتیبان
→ status=answered
→ Signal اعلان پاسخ برای کاربر
```

## جریان پرداخت

```text
انتخاب Tier و Duration
→ قیمت پویا + تخفیف
→ PaymentTransaction
→ Gateway request
→ verify callback
→ فعال‌سازی اشتراک تا تاریخ دقیق
→ Notification
```

در Demo از Gateway Mock استفاده شده تا ارائه بدون سرویس خارجی کامل باشد. Adapter درگاه Zarinpal Sandbox نیز وجود دارد.

## گزارش مالی

محاسبه روی Backend انجام می‌شود:

```text
StreamEventهای ماه
→ Group by Artist
→ Count Streams
→ Count Distinct Listeners
→ Reward Formula
→ MonthlyArtistReport
```

فرانت‌اند فقط مقدار آماده نمایش را دریافت می‌کند.

## پاسخ آماده به سؤال‌های استاد

**چرا Custom User؟** چون نقش، اشتراک و وضعیت هنرمند بخشی از هویت اصلی سامانه‌اند و تعریف از ابتدای پروژه از Migration دشوار بعدی جلوگیری می‌کند.

**چرا Event برای Stream؟** چون شمارنده ساده امکان حسابرسی، شنونده یکتا، محدودیت روزانه و Recommendation را از بین می‌برد.

**امنیت فقط در Frontend است؟** خیر؛ تمام Permissionها در Backend دوباره بررسی می‌شوند و Route Guard فرانت فقط UX است.

**چرا Bootstrap endpoint؟** برای جلوگیری از چندین درخواست اولیه و ارسال داده نقش‌محور و Aggregateشده؛ محاسبات گزارش روی Frontend انجام نمی‌شوند.

**فعالیت امتیازی چیست؟** پیشنهاددهنده محتوایی براساس سابقه واقعی، Genre و Follow که Random نیست و Unit Test دارد.

**چند تست دارید؟** ۳۳ تست Backend برای Authentication، Permission، Upload، Subscription، Stream، Playlist، Ticket، Billing، Reports و Recommendation؛ به‌علاوه ۲۱ تست منطق Frontend.
