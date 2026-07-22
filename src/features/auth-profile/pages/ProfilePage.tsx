import { useParams } from 'react-router-dom';

import Button from '../../../components/Button';

import PhasePlaceholder from '../components/PhasePlaceholder';

import { useAuth } from '../hooks/useAuth';

import {
  getAvatarInitial,
  getDailyStreamLimit,
  getGenderLabel,
  getPlaylistLimit,
  getRoleLabel,
  getSubscriptionLabel,
} from '../utils/userPresentation';

function formatDate(
  value: string | null,
) {
  if (!value) {
    return 'ثبت نشده';
  }

  return new Intl.DateTimeFormat(
    'fa-IR',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  ).format(new Date(value));
}

// User profile page with mock data.
export default function ProfilePage() {
  const { username } = useParams<{
    username: string;
  }>();

  const {
    currentUser,
    getUserByUsername,
  } = useAuth();

  const profileUser = username
    ? getUserByUsername(username)
    : currentUser ?? undefined;

  if (!profileUser) {
    return (
      <section className="profile-not-found">
        <h1>کاربر پیدا نشد</h1>

        <p>
          نام کاربری واردشده در داده‌های
          آزمایشی فاز دوم وجود ندارد.
        </p>
      </section>
    );
  }

  const isOwnProfile =
    currentUser?.id ===
    profileUser.id;

  const playlistLimit =
    getPlaylistLimit(
      profileUser.subscription.tier,
    );

  const dailyStreamLimit =
    getDailyStreamLimit(
      profileUser.subscription.tier,
    );

  const subscriptionClass =
    `subscription-pill-${profileUser.subscription.tier}`;

  return (
    <PhasePlaceholder
      eyebrow="User Module / Profile State"
      title={
        isOwnProfile
          ? 'نمایه کاربری من'
          : `نمایه ${profileUser.displayName}`
      }
      description="تمام اطلاعات این صفحه از مدل User و داده‌های آزمایشی مرکزی خوانده می‌شوند؛ بنابراین مقدارهای ثابت فاز قبلی حذف شده‌اند."
      items={[
        'نمایش پروفایل کاربر فعال و کاربران دیگر با یک مدل مشترک',
        'نمایش نقش، سطح اشتراک، آمار و تنظیمات واقعی داده آزمایشی',
        'پشتیبانی از مسیر profile/:username با جستجو در Context',
        'آماده‌سازی داده‌ها برای ویرایش پروفایل و Follow در فازهای بعد',
      ]}
      actions={
        <Button
          variant={
            isOwnProfile
              ? 'secondary'
              : 'primary'
          }
        >
          {isOwnProfile
            ? 'ویرایش نمایه'
            : 'دنبال کردن'}
        </Button>
      }
    >
      <div className="user-state-strip">
        <div>
          <strong>
            {getRoleLabel(
              profileUser.role,
            )}
          </strong>

          <span dir="ltr">
            @{profileUser.username}
          </span>
        </div>

        <code>
          {profileUser.id}
        </code>
      </div>

      <section className="profile-card">
        <div className="profile-banner">
          <div className="profile-banner-shape profile-banner-shape-one" />

          <div className="profile-banner-shape profile-banner-shape-two" />
        </div>

        <div className="profile-main-row">
          <div className="avatar avatar-large">
            {getAvatarInitial(
              profileUser,
            )}
          </div>

          <div className="profile-identity">
            <div className="profile-name-row">
              <h2>
                {profileUser.displayName}
              </h2>

              <span
                className={`subscription-pill ${subscriptionClass}`}
              >
                {getSubscriptionLabel(
                  profileUser
                    .subscription
                    .tier,
                )}
              </span>
            </div>

            <p dir="ltr">
              @{profileUser.username}
            </p>

            <span>
              عضو از{' '}
              {formatDate(
                profileUser.joinedAt,
              )}
            </span>
          </div>
        </div>

        <div className="profile-stat-grid">
          <article>
            <span>
              دنبال‌کننده
            </span>

            <strong>
              {profileUser.stats.followers.toLocaleString(
                'fa-IR',
              )}
            </strong>
          </article>

          <article>
            <span>
              دنبال‌شونده
            </span>

            <strong>
              {profileUser.stats.following.toLocaleString(
                'fa-IR',
              )}
            </strong>
          </article>

          <article>
            <span>
              استریم امروز
            </span>

            <strong>
              {profileUser.stats.dailyStreams.toLocaleString(
                'fa-IR',
              )}

              {dailyStreamLimit ===
              null
                ? ' · نامحدود'
                : ` از ${dailyStreamLimit.toLocaleString(
                    'fa-IR',
                  )}`}
            </strong>
          </article>

          <article>
            <span>
              پلی‌لیست‌ها
            </span>

            <strong>
              {profileUser.stats.playlistCount.toLocaleString(
                'fa-IR',
              )}

              {playlistLimit === null
                ? ' · نامحدود'
                : ` از ${playlistLimit.toLocaleString(
                    'fa-IR',
                  )}`}
            </strong>
          </article>
        </div>
      </section>

      <div className="profile-detail-grid">
        <section className="content-card">
          <div className="content-card-heading">
            <h2>
              اطلاعات شخصی
            </h2>

            {isOwnProfile ? (
              <button
                type="button"
                className="inline-text-button"
              >
                ویرایش
              </button>
            ) : null}
          </div>

          <dl className="profile-detail-list">
            <div>
              <dt>
                نام نمایشی
              </dt>

              <dd>
                {profileUser.displayName}
              </dd>
            </div>

            <div>
              <dt>ایمیل</dt>

              <dd dir="ltr">
                {profileUser.email}
              </dd>
            </div>

            <div>
              <dt>
                تاریخ تولد
              </dt>

              <dd>
                {formatDate(
                  profileUser.birthDate,
                )}
              </dd>
            </div>

            <div>
              <dt>جنسیت</dt>

              <dd>
                {getGenderLabel(
                  profileUser.gender,
                )}
              </dd>
            </div>

            <div>
              <dt>
                نقش سامانه
              </dt>

              <dd>
                {getRoleLabel(
                  profileUser.role,
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="content-card">
          <div className="content-card-heading">
            <h2>
              وضعیت اشتراک
            </h2>
          </div>

          <div className="subscription-summary">
            <div className="subscription-summary-icon">
              ◇
            </div>

            <div>
              <strong>
                {getSubscriptionLabel(
                  profileUser
                    .subscription
                    .tier,
                )}
              </strong>

              <p>
                {dailyStreamLimit ===
                null
                  ? 'استریم روزانه نامحدود'
                  : `${dailyStreamLimit.toLocaleString(
                      'fa-IR',
                    )} استریم روزانه`}

                {' · '}

                {playlistLimit ===
                null
                  ? 'پلی‌لیست نامحدود'
                  : `حداکثر ${playlistLimit.toLocaleString(
                      'fa-IR',
                    )} پلی‌لیست`}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            fullWidth
          >
            مشاهده گزینه‌های ارتقا
          </Button>
        </section>
      </div>
    </PhasePlaceholder>
  );
}