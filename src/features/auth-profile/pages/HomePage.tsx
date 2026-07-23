import { Link } from 'react-router-dom';

import Button from '../../../components/Button';

import {
  APP_PATHS,
} from '../../../config/paths';

import HomeUserSuggestions from '../components/HomeUserSuggestions';
import PhasePlaceholder from '../components/PhasePlaceholder';

import { useHomeFeed } from '../hooks/useHomeFeed';

import {
  formatHomeDate,
  formatPlayCount,
  getReleaseTypeLabel,
} from '../utils/homePresentation';

import {
  getRoleLabel,
  getSubscriptionLabel,
} from '../utils/userPresentation';

// Personalized authenticated home page.
export default function HomePage() {
  const {
    currentUser,
    followedUsers,
    suggestedUsers,
    visibleTracks,
    visibleReleases,
    followerCount,
    followingCount,
    dailyStreamLimit,
    playlistLimit,
    streamUsagePercent,
    hasEarlyAccess,
  } = useHomeFeed();

  if (!currentUser) {
    return (
      <section className="profile-not-found">
        <h1>
          حساب فعالی وجود ندارد
        </h1>

        <p>
          برای مشاهده صفحه خانه،
          ابتدا وارد حساب شوید.
        </p>
      </section>
    );
  }

  const subscriptionClass =
    `subscription-pill-${currentUser.subscription.tier}`;

  const roleAction =
    currentUser.role === 'artist'
      ? {
          title:
            'مدیریت آثار هنری',
          description:
            currentUser.artistVerificationStatus ===
            'approved'
              ? 'انتشارها و آثار هنری خود را مدیریت کنید.'
              : 'درخواست هنرمندی شما هنوز در انتظار تأیید است.',
          path:
            currentUser.artistVerificationStatus ===
            'approved'
              ? APP_PATHS.artistManagement
              : APP_PATHS.profile,
          icon: '♫',
        }
      : currentUser.role ===
          'support'
        ? {
            title:
              'داشبورد پشتیبانی',
            description:
              'تیکت‌ها و درخواست‌های کاربران را بررسی کنید.',
            path:
              APP_PATHS.dashboard,
            icon: '▦',
          }
        : currentUser.role ===
            'admin'
          ? {
              title:
                'داشبورد مدیریت',
              description:
                'وضعیت سامانه و گزارش‌های مدیریتی را بررسی کنید.',
              path:
                APP_PATHS.dashboard,
              icon: '⚙',
            }
          : {
              title:
                'پلی‌لیست‌های من',
              description:
                'مجموعه‌های موسیقی شخصی خود را مشاهده کنید.',
              path:
                APP_PATHS.playlists,
              icon: '▤',
            };

  return (
    <PhasePlaceholder
      eyebrow="User Module / Personalized Home"
      title={`سلام، ${currentUser.displayName}`}
      description="صفحه خانه براساس نقش، اشتراک، کاربران دنبال‌شده و آمار حساب فعال شخصی‌سازی شده است."
      items={[
        'پیشنهاد آثار براساس کاربران و هنرمندان دنبال‌شده',
        'نمایش مصرف روزانه و محدودیت‌های اشتراک',
        'نمایش فعالیت‌ها و ارتباطات حساب فعال',
        'اقدام سریع متناسب با نقش کاربر',
      ]}
      actions={
        <Link
          className="ui-button ui-button-secondary ui-button-medium"
          to={APP_PATHS.profile}
        >
          مشاهده پروفایل
        </Link>
      }
    >
      <section className="personalized-home-hero">
        <div className="personalized-home-hero-copy">
          <div className="home-hero-badges">
            <span
              className={`subscription-pill ${subscriptionClass}`}
            >
              {getSubscriptionLabel(
                currentUser.subscription.tier,
              )}
            </span>

            <span className="home-role-badge">
              {getRoleLabel(
                currentUser.role,
              )}
            </span>

            {hasEarlyAccess ? (
              <span className="home-early-badge">
                دسترسی زودهنگام
              </span>
            ) : null}
          </div>

          <h2>
            موسیقی مناسب لحظه‌ات را
            پیدا کن.
          </h2>

          <p>
            {currentUser.bio ||
              'آثار جدید را پیدا کنید، کاربران موردعلاقه خود را دنبال کنید و پلی‌لیست‌های شخصی بسازید.'}
          </p>

          <div className="personalized-home-actions">
            <Link
              className="ui-button ui-button-primary ui-button-medium"
              to={APP_PATHS.archive}
            >
              ورود به آرشیو
            </Link>

            <Link
              className="ui-button ui-button-ghost ui-button-medium"
              to={roleAction.path}
            >
              {roleAction.title}
            </Link>
          </div>
        </div>

        <div
          className="personalized-home-art"
          aria-hidden="true"
        >
          <span>♫</span>
          <span>♪</span>
          <span>♬</span>
          <span>★</span>
        </div>
      </section>

      <section className="home-stat-grid">
        <article className="home-stat-card">
          <span>
            دنبال‌کننده
          </span>

          <strong>
            {followerCount.toLocaleString(
              'fa-IR',
            )}
          </strong>

          <Link to={APP_PATHS.profile}>
            مشاهده ارتباطات
          </Link>
        </article>

        <article className="home-stat-card">
          <span>
            دنبال‌شونده
          </span>

          <strong>
            {followingCount.toLocaleString(
              'fa-IR',
            )}
          </strong>

          <Link to={APP_PATHS.profile}>
            مدیریت دنبال‌شوندگان
          </Link>
        </article>

        <article className="home-stat-card">
          <span>
            پلی‌لیست‌ها
          </span>

          <strong>
            {currentUser.stats.playlistCount.toLocaleString(
              'fa-IR',
            )}

            {playlistLimit === null
              ? ' / ∞'
              : ` / ${playlistLimit.toLocaleString(
                  'fa-IR',
                )}`}
          </strong>

          <Link to={APP_PATHS.playlists}>
            مشاهده پلی‌لیست‌ها
          </Link>
        </article>

        <article className="home-stat-card">
          <span>
            استریم امروز
          </span>

          <strong>
            {currentUser.stats.dailyStreams.toLocaleString(
              'fa-IR',
            )}

            {dailyStreamLimit === null
              ? ' / ∞'
              : ` / ${dailyStreamLimit.toLocaleString(
                  'fa-IR',
                )}`}
          </strong>

          <Link to={APP_PATHS.settings}>
            تنظیمات حساب
          </Link>
        </article>
      </section>

      {dailyStreamLimit !== null ? (
        <section className="home-quota-card">
          <div className="home-quota-heading">
            <div>
              <strong>
                مصرف روزانه اشتراک پایه
              </strong>

              <p>
                امروز{' '}
                {currentUser.stats.dailyStreams.toLocaleString(
                  'fa-IR',
                )}{' '}
                استریم از{' '}
                {dailyStreamLimit.toLocaleString(
                  'fa-IR',
                )}{' '}
                استریم مجاز استفاده
                شده است.
              </p>
            </div>

            <span>
              {streamUsagePercent.toLocaleString(
                'fa-IR',
              )}
              ٪
            </span>
          </div>

          <div
            className="home-quota-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              streamUsagePercent
            }
          >
            <span
              style={{
                width: `${streamUsagePercent}%`,
              }}
            />
          </div>

          <div className="home-quota-footer">
            <span>
              با ارتقای اشتراک، محدودیت
              استریم روزانه حذف می‌شود.
            </span>

            <Link to={APP_PATHS.settings}>
              بررسی اشتراک‌ها
            </Link>
          </div>
        </section>
      ) : (
        <section className="home-unlimited-card">
          <span aria-hidden="true">
            ∞
          </span>

          <div>
            <strong>
              استریم روزانه نامحدود
            </strong>

            <p>
              حساب فعال محدودیت روزانه
              برای پخش موسیقی ندارد.
            </p>
          </div>
        </section>
      )}

      <section className="home-workspace-card">
        <div className="home-workspace-icon">
          {roleAction.icon}
        </div>

        <div>
          <p className="page-eyebrow">
            Role workspace
          </p>

          <h2>
            {roleAction.title}
          </h2>

          <p>
            {roleAction.description}
          </p>
        </div>

        <Link
          className="ui-button ui-button-secondary ui-button-medium"
          to={roleAction.path}
        >
          ورود به بخش
        </Link>
      </section>

      <section className="home-dashboard-section">
        <div className="home-section-heading">
          <div>
            <p className="page-eyebrow">
              Personalized releases
            </p>

            <h2>
              انتشارهای پیشنهادی
            </h2>

            <p>
              آثار هنرمندان دنبال‌شده در
              اولویت نمایش قرار دارند.
            </p>
          </div>

          <Link to={APP_PATHS.archive}>
            مشاهده آرشیو
          </Link>
        </div>

        <div className="home-release-grid">
          {visibleReleases
            .slice(0, 6)
            .map((release) => {
              const artistUser =
                release.artistUserId
                  ? followedUsers.find(
                      (user) =>
                        user.id ===
                        release.artistUserId,
                    )
                  : undefined;

              return (
                <article
                  className="home-release-card"
                  key={release.id}
                >
                  <div className="home-release-cover">
                    <span>
                      {release.coverSymbol}
                    </span>

                    {release.isEarlyAccess ? (
                      <small>
                        Early
                      </small>
                    ) : null}
                  </div>

                  <div className="home-release-copy">
                    <div className="home-release-meta">
                      <span>
                        {getReleaseTypeLabel(
                          release.type,
                        )}
                      </span>

                      <span>
                        {formatHomeDate(
                          release.publishedAt,
                        )}
                      </span>
                    </div>

                    <strong>
                      {release.title}
                    </strong>

                    {artistUser ? (
                      <Link
                        to={APP_PATHS.profileByUsername(
                          artistUser.username,
                        )}
                      >
                        {release.artistName}
                      </Link>
                    ) : (
                      <span>
                        {release.artistName}
                      </span>
                    )}

                    <p>
                      {release.genre}
                      {' · '}
                      {release.trackCount.toLocaleString(
                        'fa-IR',
                      )}{' '}
                      بخش
                    </p>
                  </div>
                </article>
              );
            })}
        </div>
      </section>

      <section className="home-dashboard-section">
        <div className="home-section-heading">
          <div>
            <p className="page-eyebrow">
              Popular for you
            </p>

            <h2>
              آهنگ‌های پیشنهادی
            </h2>

            <p>
              ترتیب این فهرست براساس
              دنبال‌شوندگان و میزان پخش
              تنظیم شده است.
            </p>
          </div>
        </div>

        <div className="home-track-list">
          {visibleTracks
            .slice(0, 6)
            .map((track, index) => (
              <article
                className="home-track-row"
                key={track.id}
              >
                <span className="home-track-index">
                  {(index + 1).toLocaleString(
                    'fa-IR',
                  )}
                </span>

                <div className="home-track-cover">
                  {track.coverSymbol}
                </div>

                <div className="home-track-main">
                  <strong>
                    {track.title}
                  </strong>

                  <span>
                    {track.artistName}
                    {' · '}
                    {track.genre}
                  </span>
                </div>

                {track.isEarlyAccess ? (
                  <span className="home-track-early">
                    زودهنگام
                  </span>
                ) : null}

                <span className="home-track-plays">
                  {formatPlayCount(
                    track.playCount,
                  )}{' '}
                  پخش
                </span>

                <time dir="ltr">
                  {track.duration}
                </time>

                <Button
                  variant="ghost"
                  size="small"
                  aria-label={`پخش ${track.title}`}
                >
                  ▶
                </Button>
              </article>
            ))}
        </div>
      </section>

      <section className="home-dashboard-section">
        <div className="home-section-heading">
          <div>
            <p className="page-eyebrow">
              Following activity
            </p>

            <h2>
              فعالیت دنبال‌شوندگان
            </h2>

            <p>
              نمایی سریع از حساب‌هایی
              که دنبال می‌کنید.
            </p>
          </div>

          <Link to={APP_PATHS.profile}>
            مدیریت ارتباطات
          </Link>
        </div>

        {followedUsers.length > 0 ? (
          <div className="home-following-list">
            {followedUsers
              .slice(0, 5)
              .map((user) => (
                <article
                  className="home-following-row"
                  key={user.id}
                >
                  <Link
                    className="home-following-profile"
                    to={APP_PATHS.profileByUsername(
                      user.username,
                    )}
                  >
                    <div className="avatar home-following-avatar">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`عکس پروفایل ${user.displayName}`}
                        />
                      ) : (
                        user.displayName
                          .trim()
                          .charAt(0) ||
                        'A'
                      )}
                    </div>

                    <div>
                      <strong>
                        {user.displayName}
                      </strong>

                      <span dir="ltr">
                        @{user.username}
                      </span>
                    </div>
                  </Link>

                  <p>
                    {user.role === 'artist'
                      ? 'انتشارها و اخبار این هنرمند در پیشنهادهای شما اولویت دارند.'
                      : 'فعالیت‌ها و پلی‌لیست‌های این کاربر در صفحه خانه نمایش داده می‌شوند.'}
                  </p>

                  <Link
                    className="home-row-link"
                    to={APP_PATHS.profileByUsername(
                      user.username,
                    )}
                  >
                    مشاهده پروفایل
                  </Link>
                </article>
              ))}
          </div>
        ) : (
          <div className="home-empty-state">
            <span aria-hidden="true">
              ♙
            </span>

            <strong>
              هنوز کسی را دنبال نکرده‌اید
            </strong>

            <p>
              از بخش کاربران پیشنهادی،
              حساب‌های موردعلاقه خود را
              دنبال کنید.
            </p>
          </div>
        )}
      </section>

      <HomeUserSuggestions
        users={suggestedUsers}
      />

      {hasEarlyAccess ? (
        <section className="home-gold-access-card">
          <div>
            <span className="subscription-pill subscription-pill-gold">
              ویژه اشتراک طلایی
            </span>

            <h2>
              دسترسی زودهنگام فعال است
            </h2>

            <p>
              انتشارهای دارای برچسب
              زودهنگام قبل از عرضه عمومی
              برای حساب شما نمایش داده
              می‌شوند.
            </p>
          </div>

          <span
            className="home-gold-access-icon"
            aria-hidden="true"
          >
            ★
          </span>
        </section>
      ) : null}
    </PhasePlaceholder>
  );
}