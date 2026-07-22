import { Link } from 'react-router-dom';

import Button from '../../../components/Button';

import { APP_PATHS } from '../../../config/paths';

import {
  mockAlbums,
  mockFeaturedTracks,
} from '../../../services/mockData';

import PhasePlaceholder from '../components/PhasePlaceholder';

import { useAuth } from '../hooks/useAuth';

import {
  getRoleLabel,
  getSubscriptionLabel,
} from '../utils/userPresentation';

const recentPlaylists = [
  {
    id: 'p1',
    title: 'تمرکز شبانه',
    tracks: 18,
    symbol: '◐',
  },
  {
    id: 'p2',
    title: 'پاپ فارسی',
    tracks: 32,
    symbol: '♪',
  },
  {
    id: 'p3',
    title: 'آرامش',
    tracks: 14,
    symbol: '≈',
  },
];

// User home page with central state.
export default function HomePage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <section className="profile-not-found">
        <h1>
          حساب فعالی وجود ندارد
        </h1>

        <p>
          برای نمایش صفحه خانه، یک حساب
          آزمایشی انتخاب کنید.
        </p>
      </section>
    );
  }

  const isGoldUser =
    currentUser.subscription.tier ===
    'gold';

  const subscriptionClass =
    `subscription-pill-${currentUser.subscription.tier}`;

  return (
    <PhasePlaceholder
      eyebrow="User Module / Central State"
      title={`سلام، ${currentUser.displayName}`}
      description="صفحه خانه اکنون اطلاعات نقش، اشتراک و نمایه را از AuthContext مرکزی دریافت می‌کند و با تغییر حساب آزمایشی بلافاصله به‌روزرسانی می‌شود."
      items={[
        'مدل یکپارچه User برای هر چهار نقش سامانه',
        'وضعیت مرکزی کاربر فعال با React Context و useReducer',
        'نمایش شرطی امکانات بر اساس نقش و سطح اشتراک',
        'پنج حساب آزمایشی برای بررسی حالت‌های مختلف رابط کاربری',
      ]}
      actions={
        <Button
          variant="secondary"
          onClick={() =>
            window.scrollTo({
              top:
                document.body
                  .scrollHeight,
              behavior: 'smooth',
            })
          }
        >
          مشاهده جزئیات فاز
        </Button>
      }
    >
      <div className="user-state-strip">
        <div>
          <strong>
            وضعیت فعال از Context مرکزی
          </strong>

          <span>
            {getRoleLabel(
              currentUser.role,
            )}{' '}
            ·{' '}
            {getSubscriptionLabel(
              currentUser.subscription
                .tier,
            )}
          </span>
        </div>

        <code>
          {currentUser.id}
        </code>
      </div>

      <section className="home-hero-card">
        <div>
          <span
            className={`subscription-pill ${subscriptionClass}`}
          >
            {getSubscriptionLabel(
              currentUser.subscription
                .tier,
            )}
          </span>

          <h2>
            موسیقی مناسب لحظه‌ات را
            پیدا کن.
          </h2>

          <p>
            {currentUser.bio ||
              'به آرشیو برو، یک آهنگ انتخاب کن و از پخش‌کننده مشترک پروژه استفاده کن.'}
          </p>

          <div className="home-hero-actions">
            <Link
              className="ui-button ui-button-primary ui-button-medium"
              to={APP_PATHS.archive}
            >
              رفتن به آرشیو
            </Link>

            <Link
              className="ui-button ui-button-ghost ui-button-medium"
              to={
                APP_PATHS.playlists
              }
            >
              پلی‌لیست‌های من
            </Link>
          </div>
        </div>

        <div
          className="home-hero-art"
          aria-hidden="true"
        >
          <span>♫</span>
          <span>♪</span>
          <span>♬</span>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="page-eyebrow">
              Recently played
            </p>

            <h2>
              آخرین پلی‌لیست‌های
              شنیده‌شده
            </h2>
          </div>

          <Link
            to={APP_PATHS.playlists}
          >
            مشاهده همه
          </Link>
        </div>

        <div className="playlist-summary-grid">
          {recentPlaylists.map(
            (playlist) => (
              <article
                className="playlist-summary-card"
                key={playlist.id}
              >
                <div className="playlist-summary-cover">
                  {playlist.symbol}
                </div>

                <div>
                  <strong>
                    {playlist.title}
                  </strong>

                  <span>
                    {playlist.tracks}{' '}
                    آهنگ
                  </span>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="page-eyebrow">
              New releases
            </p>

            <h2>
              آخرین آلبوم‌های
              منتشرشده
            </h2>
          </div>

          <Link
            to={APP_PATHS.archive}
          >
            ورود به آرشیو
          </Link>
        </div>

        <div className="media-card-grid">
          {mockAlbums
            .slice(0, 4)
            .map(
              (
                album,
                index,
              ) => (
                <Link
                  className="media-card"
                  key={album.id}
                  to={APP_PATHS.album(
                    album.id,
                  )}
                >
                  <div
                    className={`media-card-cover media-cover-${
                      (index %
                        4) +
                      1
                    }`}
                  >
                    <span>♫</span>
                  </div>

                  <strong>
                    {album.title}
                  </strong>

                  <span>
                    {album.artist}
                  </span>
                </Link>
              ),
            )}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="page-eyebrow">
              Popular now
            </p>

            <h2>
              آهنگ‌های پرشنونده
            </h2>
          </div>
        </div>

        <div className="compact-track-list">
          {mockFeaturedTracks
            .slice(0, 4)
            .map(
              (
                track,
                index,
              ) => (
                <div
                  className="compact-track-row"
                  key={track.id}
                >
                  <span className="compact-track-index">
                    {index + 1}
                  </span>

                  <div className="compact-track-cover">
                    ♪
                  </div>

                  <div className="compact-track-copy">
                    <strong>
                      {track.title}
                    </strong>

                    <span>
                      {track.artist}
                    </span>
                  </div>

                  <span className="compact-track-stat">
                    {track.listeners.toLocaleString(
                      'fa-IR',
                    )}{' '}
                    شنونده
                  </span>
                </div>
              ),
            )}
        </div>
      </section>

      {isGoldUser ? (
        <section className="early-access-card">
          <span className="subscription-pill subscription-pill-gold">
            ویژه اشتراک طلایی
          </span>

          <div>
            <h2>
              دسترسی زودهنگام به آثار
              جدید
            </h2>

            <p>
              این بخش فقط زمانی نمایش
              داده می‌شود که حساب فعال
              دارای اشتراک طلایی باشد.
            </p>
          </div>

          <span
            className="early-access-icon"
            aria-hidden="true"
          >
            ★
          </span>
        </section>
      ) : null}
    </PhasePlaceholder>
  );
}