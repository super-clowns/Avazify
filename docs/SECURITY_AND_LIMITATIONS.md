# امنیت، محدودیت‌ها و مسیر Production

## کنترل‌های موجود

- JWT Access/Refresh و Blacklist Refresh در Logout
- Password hashing و validatorهای Django
- عدم افشای وجود حساب در Password Reset
- Permission نقش و مالکیت سمت Backend
- Validation حجم و پسوند فایل
- عدم Cache پاسخ‌های API و Media در Service Worker
- محدودیت تجاری اشتراک در Backend
- CORS و CSRF trusted origins قابل تنظیم
- Cookieهای Secure و Headerهای امنیتی در حالت Production
- تراکنش اتمیک برای ثبت‌نام، پرداخت، گزارش و تغییر ترتیب پلی‌لیست

## پیش از استقرار عمومی

- `DJANGO_DEBUG=0` و Secret واقعی
- HTTPS و دامنه واقعی
- Object Storage برای Media
- سرویس ایمیل واقعی
- Rate limiting برای Login، Stream و Password Reset
- Antivirus/Media processing برای Uploadها
- Queue مانند Celery برای گزارش ماهانه و ایمیل
- Observability، Backup و Rotation کلیدها
- اتصال Provider پرداخت واقعی و بررسی Callback دامنه

## محدودیت محیط Demo

- Gateway پیش‌فرض Mock است تا جریان خرید در ارائه بدون وابستگی خارجی اجرا شود.
- فایل Low Quality اختیاری است و تولید Transcode خودکار نیازمند Worker/FFmpeg است.
- پیشنهاددهنده Content-based است و برای داده حجیم می‌تواند به Pipeline آفلاین یا مدل ML ارتقا یابد.
