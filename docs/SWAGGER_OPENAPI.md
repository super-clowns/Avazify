# Swagger / OpenAPI در Avazify

Swagger در آدرس `/api/docs/` از schema تولیدشده توسط `drf-spectacular` استفاده می‌کند.

## چه چیزی اصلاح شده است؟

- APIViewهای احراز هویت اکنون Request/Response Serializer صریح دارند.
- Login، Register، Logout و Password Reset در Swagger فیلدهای واقعی Body را نشان می‌دهند.
- Custom Actionهای ViewSetها مثل Follow، Ticket Reply، Ticket Status، Stream، Playlist Actions، Artist Review، Billing Price Update و Report Generation مستندسازی صریح دارند.
- Query Parameterهای Payment Verify و Recommendation مستند شده‌اند.
- Responseهای Health، Bootstrap، Billing Summary و Recommendation مدل مشخص دارند.
- Response دانلود آهنگ به‌عنوان Binary File مشخص شده است.
- SerializerMethodFieldهای اصلی نوع OpenAPI صریح دارند تا به `string` مبهم fallback نشوند.

## نکته مهم

همه endpointها نباید Request Body داشته باشند. برای نمونه موارد زیر عمداً Body ندارند:

- `GET /api/health/`
- `GET /api/music/tracks/{id}/download/`
- `POST /api/users/{id}/follow/` چون شناسه کاربر در URL است.
- `POST /api/support/notifications/{id}/read/`
- `POST /api/billing/reports/{id}/settle/`

در این موارد Swagger باید Response، Path/Query Parameter و Authorization را نشان دهد، ولی Request Body لازم نیست.

## کنترل schema

```bash
docker compose run --rm backend sh -c "python manage.py spectacular --file /tmp/avazify-schema.yaml --validate"
```

بعد از بالا آمدن پروژه:

- Swagger: `http://localhost:8080/api/docs/`
- Raw schema: `http://localhost:8080/api/schema/`
