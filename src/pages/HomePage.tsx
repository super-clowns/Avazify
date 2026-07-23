import { Link } from 'react-router-dom';

import { RoleBadge, SubscriptionBadge } from '../components/Badges';
import Icon from '../components/Icon';
import { AlbumCard, TrackCard } from '../components/MediaCards';
import PageHeader from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { getDailyStreamLimit, getPlaylistLimit } from '../domain/phase1.js';

export default function HomePage() {
  const { data, currentUser } = useAppState();
  if (!currentUser) return null;

  const ownPlaylists = data.playlists
    .filter((playlist) => playlist.userId === currentUser.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);
  const latestAlbums = [...data.albums].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)).slice(0, 4);
  const popularTracks = [...data.tracks].filter((track) => !track.earlyAccess).sort((a, b) => b.listeners - a.listeners).slice(0, 5);
  const earlyTracks = data.tracks.filter((track) => track.earlyAccess).slice(0, 3);
  const streamLimit = getDailyStreamLimit(currentUser.subscription);
  const playlistLimit = getPlaylistLimit(currentUser.subscription);
  const usage = streamLimit ? Math.min(100, Math.round((currentUser.dailyStreams / streamLimit) * 100)) : 0;

  const roleAction = currentUser.role === 'artist'
    ? { label: 'مدیریت آثار', path: currentUser.artistStatus === 'approved' ? '/studio' : '/profile', icon: 'studio' as const }
    : currentUser.role === 'support' || currentUser.role === 'admin'
      ? { label: 'ورود به داشبورد', path: '/dashboard', icon: 'dashboard' as const }
      : { label: 'پلی‌لیست‌های من', path: '/playlists', icon: 'playlist' as const };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="صفحه خانه"
        title={`سلام ${currentUser.displayName}، آماده‌ای؟`}
        description="آخرین موسیقی‌ها، وضعیت اشتراک و پیشنهادهای متناسب با حساب شما در یک نگاه."
        actions={
          <Link className="button button-secondary" to="/profile"><Icon name="user" /> مشاهده نمایه</Link>
        }
      />

      <section className="home-hero">
        <div className="home-hero-content">
          <div className="hero-badges"><RoleBadge role={currentUser.role} /><SubscriptionBadge tier={currentUser.subscription} /></div>
          <h2>موسیقی مناسب این لحظه را کشف کن.</h2>
          <p>{currentUser.bio || 'هنرمندان موردعلاقه‌ات را دنبال کن، پلی‌لیست بساز و با پخش‌کننده کامل آوازیفای گوش بده.'}</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/explore"><Icon name="explore" /> کشف موسیقی</Link>
            <Link className="button button-glass" to={roleAction.path}><Icon name={roleAction.icon} /> {roleAction.label}</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-disc"><Icon name="album" size={98} /></div>
          <span className="wave wave-one" />
          <span className="wave wave-two" />
          <span className="floating-note note-a"><Icon name="music" /></span>
          <span className="floating-note note-b"><Icon name="music" size={17} /></span>
        </div>
      </section>

      <section className="stats-grid four">
        <article className="stat-card">
          <span className="stat-icon purple"><Icon name="music" /></span>
          <div><small>استریم امروز</small><strong>{currentUser.dailyStreams.toLocaleString('fa-IR')}{streamLimit ? ` از ${streamLimit.toLocaleString('fa-IR')}` : ''}</strong></div>
          {streamLimit ? <span className="stat-caption">{usage.toLocaleString('fa-IR')}٪ مصرف‌شده</span> : <span className="stat-caption success-text">بدون محدودیت</span>}
        </article>
        <article className="stat-card">
          <span className="stat-icon blue"><Icon name="playlist" /></span>
          <div><small>پلی‌لیست‌های من</small><strong>{ownPlaylists.length.toLocaleString('fa-IR')}{playlistLimit ? ` از ${playlistLimit.toLocaleString('fa-IR')}` : ''}</strong></div>
          <Link to="/playlists">مدیریت پلی‌لیست‌ها</Link>
        </article>
        <article className="stat-card">
          <span className="stat-icon pink"><Icon name="users" /></span>
          <div><small>دنبال‌کننده</small><strong>{currentUser.followers.toLocaleString('fa-IR')}</strong></div>
          <Link to="/profile">مشاهده نمایه</Link>
        </article>
        <article className="stat-card">
          <span className="stat-icon amber"><Icon name="heart" /></span>
          <div><small>دنبال‌شونده</small><strong>{currentUser.following.toLocaleString('fa-IR')}</strong></div>
          <span className="stat-caption">هنرمندان و کاربران</span>
        </article>
      </section>

      {streamLimit ? (
        <section className="quota-card">
          <div className="quota-copy">
            <span className="quota-icon"><Icon name="info" /></span>
            <div><strong>محدودیت روزانه اشتراک پایه</strong><p>با ارتقا به نقره‌ای یا طلایی، محدودیت ۶۰ استریم روزانه حذف می‌شود.</p></div>
          </div>
          <div className="quota-progress-wrap">
            <div><span>مصرف امروز</span><strong>{usage.toLocaleString('fa-IR')}٪</strong></div>
            <div className="progress-track"><span style={{ width: `${usage}%` }} /></div>
          </div>
          <Link className="button button-secondary small" to="/settings">بررسی اشتراک‌ها</Link>
        </section>
      ) : null}

      {currentUser.subscription === 'gold' && earlyTracks.length ? (
        <section className="section-block early-section">
          <div className="section-title-row">
            <div><span className="eyebrow gold-text">ویژه کاربران طلایی</span><h2>دسترسی زودهنگام</h2><p>قبل از انتشار عمومی، تازه‌ترین آثار را گوش بده.</p></div>
            <span className="section-icon gold"><Icon name="crown" /></span>
          </div>
          <div className="media-grid three">{earlyTracks.map((track) => <TrackCard key={track.id} track={track} queue={earlyTracks} />)}</div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-title-row">
          <div><span className="eyebrow">ادامه مسیر</span><h2>آخرین پلی‌لیست‌های شنیده‌شده</h2></div>
          <Link to="/playlists">مشاهده همه <Icon name="chevron" size={16} /></Link>
        </div>
        {ownPlaylists.length ? (
          <div className="playlist-preview-grid">
            {ownPlaylists.map((playlist, index) => {
              const covers = playlist.trackIds.slice(0, 4).map((id) => data.tracks.find((track) => track.id === id)?.cover).filter(Boolean) as string[];
              return (
                <Link className="playlist-preview" to={`/playlists?open=${playlist.id}`} key={playlist.id}>
                  <div className={`playlist-cover collage-${index + 1}`}>
                    {covers.length ? covers.map((cover) => <img src={cover} alt="" key={cover} />) : <Icon name="playlist" size={34} />}
                  </div>
                  <div><strong>{playlist.name}</strong><span>{playlist.trackIds.length.toLocaleString('fa-IR')} آهنگ</span></div>
                  <span className="round-arrow"><Icon name="chevron" /></span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="inline-empty"><Icon name="playlist" /><span>هنوز پلی‌لیستی نساخته‌اید.</span><Link to="/playlists">ساخت اولین پلی‌لیست</Link></div>
        )}
      </section>

      <section className="section-block">
        <div className="section-title-row">
          <div><span className="eyebrow">تازه منتشرشده</span><h2>آلبوم‌های جدید</h2></div>
          <Link to="/explore">مشاهده آرشیو <Icon name="chevron" size={16} /></Link>
        </div>
        <div className="media-grid four">{latestAlbums.map((album) => <AlbumCard key={album.id} album={album} />)}</div>
      </section>

      <section className="section-block">
        <div className="section-title-row">
          <div><span className="eyebrow">محبوب این روزها</span><h2>آهنگ‌های پرشنونده</h2></div>
          <Link to="/explore">کشف بیشتر <Icon name="chevron" size={16} /></Link>
        </div>
        <div className="track-list-card">{popularTracks.map((track, index) => <TrackCard key={track.id} track={track} queue={popularTracks} compact rank={index + 1} />)}</div>
      </section>
    </div>
  );
}
