# ER Diagram و طراحی پایگاه‌داده

```mermaid
erDiagram
    USER ||--|| USER_PREFERENCE : has
    USER }o--o{ USER : follows
    USER ||--o| ARTIST_APPLICATION : submits
    ARTIST_APPLICATION ||--o{ ARTIST_PORTFOLIO_ITEM : contains

    USER ||--o{ ALBUM : creates
    USER ||--o{ TRACK : publishes
    ALBUM o|--o{ TRACK : contains

    USER ||--o{ PLAYLIST : owns
    PLAYLIST ||--o{ PLAYLIST_TRACK : contains
    TRACK ||--o{ PLAYLIST_TRACK : appears_in

    USER ||--o{ STREAM_EVENT : listens
    TRACK ||--o{ STREAM_EVENT : receives
    USER ||--o{ DOWNLOAD_EVENT : downloads
    TRACK ||--o{ DOWNLOAD_EVENT : downloaded

    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ TICKET : creates
    TICKET ||--o{ TICKET_MESSAGE : contains
    USER ||--o{ TICKET_MESSAGE : authors

    SUBSCRIPTION_PLAN ||--o{ PAYMENT_TRANSACTION : purchased_as
    USER ||--o{ PAYMENT_TRANSACTION : pays
    USER ||--o{ MONTHLY_ARTIST_REPORT : earns

    USER {
        uuid id PK
        string email UK
        string username UK
        string display_name
        enum role
        enum subscription_tier
        datetime subscription_expires_at
        enum artist_status
    }
    USER_PREFERENCE {
        int id PK
        uuid user_id FK UK
        bool notification_flags
        bool sound_enabled
        enum language
        bool compact_mode
    }
    ARTIST_APPLICATION {
        uuid id PK
        uuid user_id FK UK
        enum status
        json portfolio_urls
        text rejection_reason
    }
    ALBUM {
        uuid id PK
        uuid artist_id FK
        string title
        file cover
        date release_date
        string genre
    }
    TRACK {
        uuid id PK
        uuid artist_id FK
        uuid album_id FK
        string title
        file audio_file
        file audio_low_quality
        file cover
        bool early_access
        json collaborators
    }
    PLAYLIST {
        uuid id PK
        uuid user_id FK
        string name
        string description
    }
    PLAYLIST_TRACK {
        bigint id PK
        uuid playlist_id FK
        uuid track_id FK
        int position
    }
    STREAM_EVENT {
        uuid id PK
        uuid user_id FK
        uuid track_id FK
        datetime listened_at
        int seconds_listened
    }
    TICKET {
        uuid id PK
        uuid user_id FK
        enum status
        string subject
    }
    TICKET_MESSAGE {
        uuid id PK
        uuid ticket_id FK
        uuid author_id FK
        enum author_kind
        text body
    }
    SUBSCRIPTION_PLAN {
        string tier PK
        bigint monthly_price
        int daily_stream_limit
        int playlist_limit
        bool feature_flags
    }
    PAYMENT_TRANSACTION {
        uuid id PK
        uuid user_id FK
        string plan_id FK
        int duration_months
        bigint amount
        enum status
    }
    MONTHLY_ARTIST_REPORT {
        uuid id PK
        uuid artist_id FK
        int year
        int month
        bigint streams
        bigint unique_listeners
        decimal reward
        enum status
    }
```

## تصمیم‌های طراحی

- `User` سفارشی از ابتدای پروژه تعریف شده تا نقش، اشتراک و وضعیت هنرمند بخشی از مدل هویت باشند.
- رابطه Follow به‌صورت Many-to-Many نامتقارن روی خود User است.
- ترتیب پلی‌لیست در مدل واسط `PlaylistTrack` ذخیره می‌شود.
- هر پخش در `StreamEvent` ثبت می‌شود تا محدودیت روزانه، شمارش شنونده یکتا، گزارش و پیشنهاددهنده از یک منبع قابل حسابرسی استفاده کنند.
- قیمت و قابلیت‌های اشتراک در `SubscriptionPlan` ذخیره می‌شوند و Hard-code رابط کاربری نیستند.
- گزارش مالی ماهانه Snapshot است تا پس از تسویه تغییر نکند.
