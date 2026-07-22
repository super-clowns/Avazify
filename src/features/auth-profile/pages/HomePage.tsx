import { Link } from 'react-router-dom';

import Button from '../../../components/Button';
import { APP_PATHS } from '../../../config/paths';
import {
  mockAlbums,
  mockFeaturedTracks,
} from '../../../services/mockData';
import PhasePlaceholder from '../components/PhasePlaceholder';

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

// User home page foundation.
export default function HomePage() {
  return (
    <PhasePlaceholder
      eyebrow="User Module / Home"
      title="سلام، کاربر نمونه"
      description="ساختار صفحه خانه، ویترین موسیقی و دسترسی‌های اصلی برای اتصال به داده‌های کاربر آماده است."
      items={[
        'هدر کاربر با تصویر پیش‌فرض و نوع اشتراک',
        'ویترین پلی‌لیست‌های اخیر، آلبوم‌های جدید و آهنگ‌های پرشنونده',
        'بخش نمایشی دسترسی زودهنگام کاربران طلایی',
        'اتصال صفحه به ناوبری اصلی و مسیرهای موسیقی',
      ]}
      actions={
        <Button
          variant="secondary"
          onClick={() =>
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: 'smooth',
            })
          }
        >
          مشاهده جزئیات فاز
        </Button>
      }
    >
      <section className="home-hero-card">
        <div>
          <span className="subscription-pill subscription-pill-free">
            اشتراک پایه
          </span>

          <h2>
            موسیقی مناسب لحظه‌ات را پیدا
            کن.
          </h2>

          <p>
            به آرشیو برو، یک آهنگ انتخاب
            کن و از پخش‌کننده مشترک پروژه
            استفاده کن.
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
              to={APP_PATHS.playlists}
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

          <Link to={APP_PATHS.playlists}>
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
                    {playlist.tracks} آهنگ
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
              آخرین آلبوم‌های منتشرشده
            </h2>
          </div>

          <Link to={APP_PATHS.archive}>
            ورود به آرشیو
          </Link>
        </div>

        <div className="media-card-grid">
          {mockAlbums
            .slice(0, 4)
            .map((album, index) => (
              <Link
                className="media-card"
                key={album.id}
                to={APP_PATHS.album(
                  album.id,
                )}
              >
                <div
                  className={`media-card-cover media-cover-${
                    (index % 4) + 1
                  }`}
                >
                  <span>♫</span>
                </div>

                <strong>
                  {album.title}
                </strong>

                <span>{album.artist}</span>
              </Link>
            ))}
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
            .map((track, index) => (
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
            ))}
        </div>
      </section>

      <section className="early-access-card">
        <span className="subscription-pill subscription-pill-gold">
          ویژه اشتراک طلایی
        </span>

        <div>
          <h2>
            دسترسی زودهنگام به آثار جدید
          </h2>

          <p>
            جایگاه این بخش آماده است و
            نمایش شرطی آن در فاز وضعیت
            کاربر تکمیل می‌شود.
          </p>
        </div>

        <span
          className="early-access-icon"
          aria-hidden="true"
        >
          ★
        </span>
      </section>
    </PhasePlaceholder>
  );
}