import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import Avatar from '../components/Avatar';
import { ArtistStatusBadge, RoleBadge, SubscriptionBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { AlbumCard, TrackCard } from '../components/MediaCards';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import type { Gender, User } from '../types';

function formatDate(value: string | null) {
  if (!value) return 'ثبت نشده';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}

function ProfileEditModal({ open, user, onClose }: { open: boolean; user: User; onClose: () => void }) {
  const { updateCurrentUser } = useAppState();
  const { pushToast } = useToast();
  const [form, setForm] = useState({
    displayName: user.displayName,
    email: user.email,
    bio: user.bio,
    birthDate: user.birthDate ?? '',
    gender: user.gender,
    avatar: user.avatar,
  });

  useEffect(() => {
    setForm({ displayName: user.displayName, email: user.email, bio: user.bio, birthDate: user.birthDate ?? '', gender: user.gender, avatar: user.avatar });
  }, [user]);

  const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (user.subscription === 'free') {
      pushToast('تغییر عکس نمایه برای اشتراک پایه فعال نیست.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      pushToast('حجم تصویر باید کمتر از ۲ مگابایت باشد.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((previous) => ({ ...previous, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.displayName.trim() || !form.email.trim()) {
      pushToast('نام نمایشی و ایمیل ضروری است.', 'error');
      return;
    }
    const result = await updateCurrentUser({
      displayName: form.displayName,
      email: form.email,
      bio: form.bio,
      birthDate: form.birthDate || null,
      gender: form.gender,
      avatar: form.avatar,
    });
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) onClose();
  };

  return (
    <Modal
      open={open}
      title="ویرایش اطلاعات نمایه"
      description="اطلاعاتی که سایر کاربران در صفحه نمایه می‌بینند."
      onClose={onClose}
      size="large"
      footer={
        <><button type="button" className="button button-ghost" onClick={onClose}>انصراف</button><button type="submit" form="profile-edit-form" className="button button-primary">ذخیره تغییرات</button></>
      }
    >
      <form id="profile-edit-form" className="profile-edit-form" onSubmit={handleSubmit}>
        <div className="avatar-editor">
          <Avatar name={form.displayName} src={form.avatar} size="large" />
          <div>
            <strong>عکس نمایه</strong>
            <p>{user.subscription === 'free' ? 'این قابلیت در اشتراک پایه غیرفعال است.' : 'فرمت JPG، PNG یا WEBP تا ۲ مگابایت.'}</p>
            <label className={`button button-secondary small ${user.subscription === 'free' ? 'disabled' : ''}`}>
              <Icon name="upload" size={17} /> انتخاب تصویر
              <input type="file" accept="image/*" disabled={user.subscription === 'free'} onChange={handleAvatar} />
            </label>
          </div>
        </div>
        <div className="form-grid two-columns">
          <label className="field"><span className="field-label">نام نمایشی</span><span className="field-control"><Icon name="user" /><input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></span></label>
          <label className="field"><span className="field-label">ایمیل</span><span className="field-control"><Icon name="mail" /><input dir="ltr" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></span></label>
          <label className="field"><span className="field-label">تاریخ تولد</span><span className="field-control"><Icon name="calendar" /><input type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} /></span></label>
          <label className="field"><span className="field-label">جنسیت</span><span className="field-control"><Icon name="users" /><select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}><option value="prefer-not-to-say">ترجیح می‌دهم نگویم</option><option value="female">زن</option><option value="male">مرد</option><option value="other">سایر</option></select></span></label>
          <label className="field form-span-two"><span className="field-label">درباره من</span><span className="field-control textarea-control"><textarea rows={4} maxLength={240} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="توضیح کوتاهی درباره خودتان بنویسید." /></span><small className="field-message">{form.bio.length.toLocaleString('fa-IR')} از ۲۴۰ کاراکتر</small></label>
        </div>
      </form>
    </Modal>
  );
}

export function ProfilePage() {
  const { userId } = useParams();
  const { data, currentUser, toggleFollow } = useAppState();
  const { pushToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState<'followers' | 'following' | null>(null);

  const profile = userId ? data.users.find((user) => user.id === userId || user.username === userId) : currentUser;
  if (!profile) return <EmptyState icon="user" title="نمایه پیدا نشد" description="کاربر موردنظر وجود ندارد یا حذف شده است." />;
  if (profile.role === 'artist' && userId) {
    return <ArtistProfileContent artist={profile} />;
  }

  const isOwn = profile.id === currentUser?.id;
  const isFollowing = currentUser?.followedUserIds.includes(profile.id) ?? false;
  const genderLabel = profile.gender === 'female' ? 'زن' : profile.gender === 'male' ? 'مرد' : profile.gender === 'other' ? 'سایر' : 'ذکر نشده';
  const connectionUsers = connectionsOpen === 'following'
    ? data.users.filter((user) => profile.followedUserIds.includes(user.id))
    : data.users.filter((user) => user.followedUserIds.includes(profile.id));

  const handleFollow = async () => {
    const result = await toggleFollow(profile.id);
    pushToast(result.success ? (isFollowing ? 'دنبال‌کردن کاربر لغو شد.' : 'کاربر را دنبال کردید.') : result.message, result.success ? 'success' : 'error');
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={isOwn ? 'نمایه من' : 'نمایه کاربر'}
        title={isOwn ? 'مدیریت نمایه کاربری' : profile.displayName}
        description={isOwn ? 'اطلاعات حساب، آمار و ارتباطات خود را مشاهده و ویرایش کنید.' : `نمایه عمومی @${profile.username}`}
        actions={isOwn ? <button type="button" className="button button-primary" onClick={() => setEditOpen(true)}><Icon name="edit" /> ویرایش اطلاعات</button> : <button type="button" className={`button ${isFollowing ? 'button-secondary' : 'button-primary'}`} onClick={handleFollow}><Icon name={isFollowing ? 'check' : 'plus'} /> {isFollowing ? 'دنبال شده' : 'دنبال کردن'}</button>}
      />

      <section className="profile-hero-card">
        <div className="profile-cover-pattern"><span /><span /><span /></div>
        <div className="profile-hero-main">
          <Avatar name={profile.displayName} src={profile.avatar} size="hero" />
          <div className="profile-identity">
            <div className="profile-name-line"><h2>{profile.displayName}</h2>{profile.role === 'artist' ? <ArtistStatusBadge status={profile.artistStatus} /> : null}</div>
            <span className="username" dir="ltr">@{profile.username}</span>
            <div className="profile-badges"><RoleBadge role={profile.role} /><SubscriptionBadge tier={profile.subscription} /></div>
          </div>
          {!isOwn ? <button type="button" className={`button ${isFollowing ? 'button-secondary' : 'button-primary'} desktop-follow`} onClick={handleFollow}><Icon name={isFollowing ? 'check' : 'plus'} />{isFollowing ? 'دنبال شده' : 'دنبال کردن'}</button> : null}
        </div>
        <div className="profile-stats-row">
          <button type="button" onClick={() => setConnectionsOpen('followers')}><strong>{profile.followers.toLocaleString('fa-IR')}</strong><span>دنبال‌کننده</span></button>
          <button type="button" onClick={() => setConnectionsOpen('following')}><strong>{profile.following.toLocaleString('fa-IR')}</strong><span>دنبال‌شونده</span></button>
          <div><strong>{profile.dailyStreams.toLocaleString('fa-IR')}</strong><span>استریم امروز</span></div>
          <div><strong>{profile.totalStreams.toLocaleString('fa-IR')}</strong><span>مجموع استریم</span></div>
        </div>
      </section>

      <div className="profile-content-grid">
        <section className="content-card">
          <div className="card-heading"><div><span className="eyebrow">اطلاعات عمومی</span><h2>درباره {isOwn ? 'من' : profile.displayName}</h2></div>{isOwn ? <button type="button" className="text-button" onClick={() => setEditOpen(true)}><Icon name="edit" /> ویرایش</button> : null}</div>
          <p className="profile-bio">{profile.bio || 'توضیحی برای این نمایه ثبت نشده است.'}</p>
          <dl className="details-list">
            <div><dt><Icon name="mail" /> ایمیل</dt><dd dir="ltr">{profile.email}</dd></div>
            <div><dt><Icon name="calendar" /> تاریخ تولد</dt><dd>{formatDate(profile.birthDate)}</dd></div>
            <div><dt><Icon name="users" /> جنسیت</dt><dd>{genderLabel}</dd></div>
            <div><dt><Icon name="clock" /> تاریخ عضویت</dt><dd>{formatDate(profile.joinedAt)}</dd></div>
          </dl>
        </section>

        <section className="content-card subscription-profile-card">
          <div className="card-heading"><div><span className="eyebrow">اشتراک</span><h2>وضعیت حساب</h2></div><SubscriptionBadge tier={profile.subscription} /></div>
          <div className="subscription-orbit"><span><Icon name={profile.subscription === 'gold' ? 'crown' : 'music'} size={32} /></span></div>
          <strong>{profile.subscription === 'gold' ? 'اشتراک طلایی' : profile.subscription === 'silver' ? 'اشتراک نقره‌ای' : 'اشتراک پایه'}</strong>
          <p>{profile.subscription === 'free' ? '۶۰ استریم روزانه، حداکثر ۶ پلی‌لیست و بدون دانلود آفلاین.' : profile.subscription === 'silver' ? 'استریم نامحدود، ۱۰۰ پلی‌لیست و دانلود آفلاین.' : 'تمام قابلیت‌ها همراه با دسترسی زودهنگام و آمار اختصاصی.'}</p>
          {isOwn ? <Link className="button button-secondary full" to="/settings">مدیریت اشتراک</Link> : null}
        </section>
      </div>

      {isOwn ? <ProfileEditModal open={editOpen} user={profile} onClose={() => setEditOpen(false)} /> : null}
      <Modal open={connectionsOpen !== null} title={connectionsOpen === 'followers' ? 'دنبال‌کنندگان' : 'دنبال‌شوندگان'} onClose={() => setConnectionsOpen(null)} size="small">
        {connectionUsers.length ? <div className="connection-list">{connectionUsers.map((user) => <Link key={user.id} to={user.role === 'artist' ? `/artist/${user.id}` : `/profile/${user.id}`} onClick={() => setConnectionsOpen(null)}><Avatar name={user.displayName} src={user.avatar} size="small" /><span><strong>{user.displayName}</strong><small dir="ltr">@{user.username}</small></span><Icon name="chevron" /></Link>)}</div> : <EmptyState icon="users" title="موردی وجود ندارد" description="هنوز ارتباطی در این بخش ثبت نشده است." />}
      </Modal>
    </div>
  );
}

function ArtistProfileContent({ artist }: { artist: User }) {
  const { data, currentUser, toggleFollow } = useAppState();
  const { pushToast } = useToast();
  const isOwn = currentUser?.id === artist.id;
  const canAccessEarlyReleases = currentUser?.subscription === 'gold' || isOwn;
  const tracks = data.tracks.filter((track) => track.artistId === artist.id);
  const visibleTracks = canAccessEarlyReleases ? tracks : tracks.filter((track) => !track.earlyAccess);
  const visibleTrackIds = new Set(visibleTracks.map((track) => track.id));
  const albums = data.albums.filter((album) => album.artistId === artist.id && album.trackIds.some((id) => visibleTrackIds.has(id)));
  const singles = visibleTracks.filter((track) => !track.albumId);
  const isFollowing = currentUser?.followedUserIds.includes(artist.id) ?? false;
  const canSeeAnalytics = currentUser?.subscription === 'gold' || isOwn;
  const listeners = tracks.reduce((sum, track) => sum + track.listeners, 0);
  const streams = tracks.reduce((sum, track) => sum + track.streams, 0);

  const handleFollow = async () => {
    const result = await toggleFollow(artist.id);
    pushToast(result.success ? (isFollowing ? 'دنبال‌کردن هنرمند لغو شد.' : 'هنرمند را دنبال کردید.') : result.message, result.success ? 'success' : 'error');
  };

  return (
    <div className="page-stack artist-page">
      <section className="artist-hero">
        <img className="artist-hero-backdrop" src={tracks[0]?.cover ?? '/covers/after-midnight.svg'} alt="" />
        <div className="artist-hero-overlay" />
        <div className="artist-hero-content">
          <Avatar name={artist.displayName} src={artist.avatar} size="hero" />
          <div>
            <div className="artist-verified-line"><ArtistStatusBadge status={artist.artistStatus} /></div>
            <h1>{artist.displayName}</h1>
            <span dir="ltr">@{artist.username}</span>
            <p>{artist.bio}</p>
            <div className="artist-hero-meta"><span>{artist.followers.toLocaleString('fa-IR')} دنبال‌کننده</span><span>{tracks.length.toLocaleString('fa-IR')} اثر</span></div>
          </div>
          {!isOwn ? <button type="button" className={`button ${isFollowing ? 'button-glass' : 'button-primary'}`} onClick={handleFollow}><Icon name={isFollowing ? 'check' : 'plus'} />{isFollowing ? 'دنبال شده' : 'دنبال کردن'}</button> : <Link className="button button-glass" to="/studio"><Icon name="studio" /> مدیریت آثار</Link>}
        </div>
      </section>

      {canSeeAnalytics ? (
        <section className="artist-analytics-banner">
          <div><span className="stat-icon purple"><Icon name="users" /></span><span><small>مجموع شنوندگان آثار</small><strong>{listeners.toLocaleString('fa-IR')}</strong></span></div>
          <div><span className="stat-icon blue"><Icon name="music" /></span><span><small>مجموع استریم آثار</small><strong>{streams.toLocaleString('fa-IR')}</strong></span></div>
          <div><span className="stat-icon amber"><Icon name="chart" /></span><span><small>میانگین استریم هر اثر</small><strong>{Math.round(streams / Math.max(tracks.length, 1)).toLocaleString('fa-IR')}</strong></span></div>
          <span className="gold-access-note"><Icon name="crown" /> آمار ویژه کاربران طلایی</span>
        </section>
      ) : (
        <section className="gold-upsell"><span><Icon name="crown" /></span><div><strong>آمار شنوندگان ویژه اشتراک طلایی است</strong><p>با ارتقای حساب، تعداد شنونده و استریم آثار هنرمندان را مشاهده کنید.</p></div><Link className="button button-secondary small" to="/settings">مشاهده اشتراک‌ها</Link></section>
      )}

      <section className="section-block">
        <div className="section-title-row"><div><span className="eyebrow">دیسکوگرافی</span><h2>آلبوم‌ها</h2></div></div>
        {albums.length ? <div className="media-grid four">{albums.map((album) => <AlbumCard key={album.id} album={album} />)}</div> : <EmptyState icon="album" title="آلبومی منتشر نشده است" description="آثار آلبومی این هنرمند در این بخش نمایش داده می‌شوند." />}
      </section>

      <section className="section-block">
        <div className="section-title-row"><div><span className="eyebrow">انتشارهای مستقل</span><h2>تک‌آهنگ‌ها</h2></div></div>
        {singles.length ? <div className="media-grid four">{singles.map((track) => <TrackCard key={track.id} track={track} queue={singles} />)}</div> : <EmptyState icon="music" title="تک‌آهنگی منتشر نشده است" description="انتشارهای مستقل هنرمند در این بخش قرار می‌گیرند." />}
      </section>
    </div>
  );
}

export function ArtistPage() {
  const { artistId } = useParams();
  const { data } = useAppState();
  const artist = useMemo(() => data.users.find((user) => user.id === artistId && user.role === 'artist'), [artistId, data.users]);
  if (!artist) return <EmptyState icon="music" title="هنرمند پیدا نشد" description="این صفحه وجود ندارد یا حساب هنرمند حذف شده است." />;
  return <ArtistProfileContent artist={artist} />;
}
