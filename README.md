# Avazify — Full-stack Final Project

نسخه کامل پروژه استریم موسیقی آوازیفای شامل فرانت‌اند React، بک‌اند Django REST Framework، پایگاه‌داده PostgreSQL، احراز هویت JWT، آپلود فایل، مدیریت اشتراک، تیکت، گزارش مالی، پیشنهاددهنده موسیقی، PWA و Docker است.

## اجرای سریع با Docker

پیش‌نیاز: Docker Desktop و Docker Compose.

```bash
docker compose up --build
```

سپس:

- برنامه: `http://localhost:8080`
- Swagger API: `http://localhost:8080/api/docs/`
- سلامت سرویس: `http://localhost:8080/api/health/`
- Django Admin: `http://localhost:8080/admin/`

در اجرای نخست، Migrationها انجام و داده‌های نمایشی Seed می‌شوند.

## حساب‌های نمایشی

رمز همه حساب‌ها: `Demo1234`

| نقش | ایمیل |
|---|---|
| شنونده پایه | `sara@example.com` |
| شنونده طلایی | `arman@example.com` |
| هنرمند تأییدشده | `nila.artist@example.com` |
| هنرمند در انتظار | `ava.pending@example.com` |
| پشتیبان | `support@example.com` |
| مدیر | `admin@example.com` |

## معماری

```text
React + TypeScript + PWA
        │ REST / JWT / multipart
        ▼
Django REST Framework
        │ ORM
        ▼
PostgreSQL
```

### ماژول‌های بک‌اند

- `accounts`: کاربر سفارشی، نقش‌ها، JWT، بازیابی رمز، Follow، تنظیمات، تأیید هنرمند
- `music`: آهنگ، آلبوم، پلی‌لیست، آپلود، Stream Event، Download Event و محدودیت اشتراک
- `support`: اعلان، تیکت و پیام‌های گفت‌وگو
- `billing`: اشتراک پویا، تراکنش، درگاه Mock/Zarinpal Sandbox و حسابرسی هنرمندان
- `recommendations`: پیشنهاددهنده محتوایی غیرتصادفی براساس سابقه شنیدن، ژانر و هنرمندان دنبال‌شده
- `common`: Bootstrap تجمیع‌شده، Permissionها، Pagination، Validation و Health Check

## قابلیت‌های اصلی

- ثبت‌نام شنونده و هنرمند، ورود JWT، Refresh/Blacklist و بازیابی رمز
- چهار نقش `listener`، `artist`، `support` و `admin`
- سه سطح اشتراک پایه، نقره‌ای و طلایی با قیمت پویا
- محدودیت ۶۰ استریم و ۶ پلی‌لیست برای پایه؛ ۱۰۰ پلی‌لیست برای نقره‌ای
- آپلود واقعی MP3/WAV/FLAC و تصاویر JPG/PNG/WEBP/SVG
- Early Access و آمار اختصاصی کاربران طلایی
- CRUD آثار با کنترل مالکیت هنرمند
- پلی‌لیست مرتب‌شونده و جلوگیری از آهنگ تکراری
- سیستم کامل تیکت و اعلان نقش‌محور
- تأیید یا رد هنرمند همراه با علت و اعلان
- گزارش ماهانه پاداش هنرمند از داده تجمیع‌شده استریم
- قیمت‌گذاری اشتراک بدون تغییر کد
- پرداخت Mock قابل دمو و Zarinpal Sandbox قابل تنظیم
- پیشنهاددهنده منطقی موسیقی به‌عنوان فعالیت امتیازی
- PWA و Service Worker
- Docker برای Frontend، Backend و PostgreSQL
- OpenAPI/Swagger

## اجرای محلی بدون Docker

### Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo --reset
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Vite درخواست‌های `/api` و `/media` را در توسعه به `localhost:8000` Proxy می‌کند.

## تست و کنترل کیفیت

```bash
# Backend: 35 تست API و منطق
cd backend
python manage.py test

# Frontend
cd frontend
npm run check
```

با Docker:

```bash
make test-backend
make test-frontend
```

### اعتبارسنجی Swagger / OpenAPI

برای بررسی اینکه مستندات API با Serializerها و Viewها قابل تولید است:

```bash
docker compose run --rm backend sh -c "python manage.py spectacular --file /tmp/avazify-schema.yaml --validate"
```

در Swagger، endpointهایی که Request Body دارند فیلدهای واقعی Serializer را نمایش می‌دهند. Endpointهایی مثل Health، Download، Follow و Mark-as-read ذاتاً Body ندارند و نبودن Request Body برای آن‌ها صحیح است.

## دستورات مدیریتی

```bash
python manage.py seed_demo --reset
python manage.py expire_subscriptions
python manage.py generate_monthly_reports --year 2026 --month 7
```

## مستندات

- [نمودار ER و مدل‌ها](docs/ER_DIAGRAM.md)
- [قرارداد API](docs/API_CONTRACT.md)
- [تطبیق با چک‌لیست پروژه](docs/IMPLEMENTATION_CHECKLIST.md)
- [راهنمای ارائه بک‌اند](docs/PRESENTATION_BACKEND_FA.md)
- [امنیت، محدودیت‌ها و مسیر Production](docs/SECURITY_AND_LIMITATIONS.md)
- [Swagger / OpenAPI](docs/SWAGGER_OPENAPI.md)

## نکات Production

فایل `.env` موجود برای اجرای Demo است. در استقرار واقعی `DJANGO_SECRET_KEY`، دامنه‌ها، HTTPS، سرویس ایمیل، Storage رسانه و اطلاعات درگاه باید با مقادیر امن جایگزین شوند و `DJANGO_DEBUG=0` باشد.


## Payment demo

The default `PAYMENT_PROVIDER=mock` now demonstrates the full browser redirect flow: creating a pending transaction, opening a local mock payment page, callback verification, subscription activation, and a final result page. This is the recommended presentation mode because it requires no real money and no external gateway availability. See `docs/PAYMENT_FLOW.md`.
