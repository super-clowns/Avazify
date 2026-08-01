import { useMemo, useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { AlbumCard, TrackCard } from '../components/MediaCards';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { filterTracks, formatDuration, getPlaylistLimit, sortTracks } from '../domain/phase1.js';
import type { Playlist, Track } from '../types';

export function ExplorePage() {
  const { data, currentUser } = useAppState();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'listeners'>('latest');
  const genres = useMemo(() => Array.from(new Set(data.tracks.map((track) => track.genre))), [data.tracks]);
  const allowedTracks = currentUser?.subscription === 'gold' ? data.tracks : data.tracks.filter((track) => !track.earlyAccess);
  const tracks = useMemo(() => sortTracks(filterTracks(allowedTracks, query, genre), sortBy), [allowedTracks, genre, query, sortBy]);
  const albums = useMemo(() => data.albums.filter((album) => {
    const normalized = query.trim().toLocaleLowerCase('fa');
    return !normalized || album.title.toLocaleLowerCase('fa').includes(normalized) || album.artistName.toLocaleLowerCase('fa').includes(normalized);
  }), [data.albums, query]);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="آرشیو موسیقی" title="کشف آلبوم‌ها و تک‌آهنگ‌ها" description="هم‌زمان بر اساس نام اثر یا هنرمند جستجو کنید و نتایج را با فیلترهای مختلف مرتب کنید." />

      <section className="explore-search-panel">
        <label className="search-field"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام آهنگ، آلبوم یا هنرمند..." />{query ? <button type="button" onClick={() => setQuery('')} aria-label="پاک کردن جستجو"><Icon name="close" size={17} /></button> : null}</label>
        <label className="filter-field"><Icon name="filter" /><select value={genre} onChange={(event) => setGenre(event.target.value)}><option value="all">همه سبک‌ها</option>{genres.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        <label className="filter-field"><Icon name="chart" /><select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}><option value="latest">جدیدترین انتشار</option><option value="oldest">قدیمی‌ترین انتشار</option><option value="listeners">بیشترین شنونده</option></select></label>
      </section>

      {query && albums.length ? (
        <section className="section-block">
          <div className="section-title-row"><div><span className="eyebrow">نتیجه جستجو</span><h2>آلبوم‌ها</h2></div><span className="result-count">{albums.length.toLocaleString('fa-IR')} نتیجه</span></div>
          <div className="media-grid four">{albums.map((album) => <AlbumCard album={album} key={album.id} />)}</div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-title-row"><div><span className="eyebrow">آرشیو آهنگ‌ها</span><h2>{query ? `نتایج برای «${query}»` : 'همه آهنگ‌ها'}</h2></div><span className="result-count">{tracks.length.toLocaleString('fa-IR')} آهنگ</span></div>
        {tracks.length ? <div className="media-grid four">{tracks.map((track) => <TrackCard key={track.id} track={track} queue={tracks} />)}</div> : <EmptyState icon="search" title="نتیجه‌ای پیدا نشد" description="عبارت جستجو یا فیلتر سبک را تغییر دهید." />}
      </section>
    </div>
  );
}

export function AlbumPage() {
  const { albumId } = useParams();
  const { data, currentUser, downloadTrack } = useAppState();
  const { playTrack } = usePlayer();
  const album = data.albums.find((item) => item.id === albumId);
  if (!album) return <EmptyState icon="album" title="آلبوم پیدا نشد" description="این آلبوم وجود ندارد یا حذف شده است." />;
  const tracks = album.trackIds.map((id) => data.tracks.find((track) => track.id === id)).filter((track): track is NonNullable<typeof track> => Boolean(track));
  const visibleTracks = currentUser?.subscription === 'gold' ? tracks : tracks.filter((track) => !track.earlyAccess);
  const totalDuration = visibleTracks.reduce((sum, track) => sum + track.duration, 0);
  const listeners = visibleTracks.reduce((sum, track) => sum + track.listeners, 0);
  const streams = visibleTracks.reduce((sum, track) => sum + track.streams, 0);

  const downloadAlbum = async () => {
    if (currentUser?.subscription === 'free') return;
    for (const track of visibleTracks) {
      await downloadTrack(track.id, track.title);
    }
  };

  return (
    <div className="page-stack album-page">
      <section className="album-hero-card">
        <div className="album-cover-large"><img src={album.cover} alt={`کاور ${album.title}`} /></div>
        <div className="album-hero-copy">
          <span className="eyebrow">آلبوم</span>
          <h1>{album.title}</h1>
          <Link to={`/artist/${album.artistId}`}>{album.artistName} <Icon name="verified" size={16} /></Link>
          <p>{album.genre} · {new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(album.releaseDate))}</p>
          <div className="album-meta-pills"><span><Icon name="music" /> {visibleTracks.length.toLocaleString('fa-IR')} آهنگ</span><span><Icon name="clock" /> {formatDuration(totalDuration)}</span><span><Icon name="users" /> {listeners.toLocaleString('fa-IR')} شنونده</span></div>
          <div className="album-actions"><button type="button" className="button button-primary" disabled={!visibleTracks.length} onClick={() => visibleTracks[0] && playTrack(visibleTracks[0].id, visibleTracks.map((track) => track.id))}><Icon name="play" /> پخش آلبوم</button><button type="button" className="button button-glass" disabled={currentUser?.subscription === 'free'} onClick={downloadAlbum} title={currentUser?.subscription === 'free' ? 'دانلود برای اشتراک نقره‌ای و طلایی فعال است' : 'دانلود آهنگ‌های آلبوم'}><Icon name="download" /> دانلود</button></div>
        </div>
        {currentUser?.subscription === 'gold' ? <div className="album-gold-stat"><Icon name="crown" /><span><small>مجموع استریم</small><strong>{streams.toLocaleString('fa-IR')}</strong></span></div> : null}
      </section>

      <section className="section-block">
        <div className="section-title-row"><div><span className="eyebrow">فهرست قطعه‌ها</span><h2>آهنگ‌های آلبوم</h2></div></div>
        <div className="track-list-card">{visibleTracks.map((track, index) => <TrackCard key={track.id} track={track} queue={visibleTracks} compact rank={index + 1} />)}</div>
      </section>
    </div>
  );
}

function PlaylistFormModal({ open, title, initialName = '', initialDescription = '', onClose, onSubmit }: { open: boolean; title: string; initialName?: string; initialDescription?: string; onClose: () => void; onSubmit: (name: string, description: string) => void | Promise<void> }) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name, description);
    setName('');
    setDescription('');
  };

  return (
    <Modal open={open} title={title} onClose={onClose} size="small" footer={<><button type="button" className="button button-ghost" onClick={onClose}>انصراف</button><button type="submit" form="playlist-form" className="button button-primary">ذخیره</button></>}>
      <form id="playlist-form" className="form-stack" onSubmit={submit}>
        <label className="field"><span className="field-label">نام پلی‌لیست</span><span className="field-control"><Icon name="playlist" /><input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} autoFocus /></span></label>
        <label className="field"><span className="field-label">توضیح کوتاه</span><span className="field-control textarea-control"><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={140} /></span></label>
      </form>
    </Modal>
  );
}

function PlaylistCover({ playlist, tracks }: { playlist: Playlist; tracks: Track[] }) {
  const covers = playlist.trackIds.slice(0, 4).map((id) => tracks.find((track) => track.id === id)?.cover).filter(Boolean) as string[];
  return <div className="playlist-cover">{covers.length ? covers.map((cover, index) => <img src={cover} alt="" key={`${cover}-${index}`} />) : <Icon name="playlist" size={40} />}</div>;
}

export function PlaylistsPage() {
  const { data, currentUser, createPlaylist, renamePlaylist, deletePlaylist, removeTrackFromPlaylist } = useAppState();
  const { pushToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Playlist | null>(null);
  const [deleting, setDeleting] = useState<Playlist | null>(null);
  const ownPlaylists = data.playlists.filter((playlist) => playlist.userId === currentUser?.id);
  const selectedId = searchParams.get('open') ?? ownPlaylists[0]?.id ?? null;
  const selected = ownPlaylists.find((playlist) => playlist.id === selectedId) ?? null;
  const selectedTracks = selected?.trackIds.map((id) => data.tracks.find((track) => track.id === id)).filter((track): track is NonNullable<typeof track> => Boolean(track)) ?? [];
  const limit = currentUser ? getPlaylistLimit(currentUser.subscription) : 0;

  const create = async (name: string, description: string) => {
    const result = await createPlaylist(name, description);
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) setCreateOpen(false);
  };

  const rename = async (name: string) => {
    if (!editing) return;
    const result = await renamePlaylist(editing.id, name);
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) setEditing(null);
  };

  const remove = async () => {
    if (!deleting) return;
    const result = await deletePlaylist(deleting.id);
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      if (selectedId === deleting.id) setSearchParams({});
      setDeleting(null);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="کتابخانه شخصی"
        title="پلی‌لیست‌های من"
        description={`ایجاد، تغییر نام و مدیریت آهنگ‌ها؛ ${limit === null ? 'بدون محدودیت' : `حداکثر ${limit.toLocaleString('fa-IR')} پلی‌لیست`} برای اشتراک فعلی.`}
        actions={<button type="button" className="button button-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" /> پلی‌لیست جدید</button>}
      />

      {ownPlaylists.length ? (
        <div className="playlists-layout">
          <aside className="playlist-sidebar-list">
            <div className="playlist-list-heading"><span>پلی‌لیست‌ها</span><strong>{ownPlaylists.length.toLocaleString('fa-IR')}{limit ? ` / ${limit.toLocaleString('fa-IR')}` : ''}</strong></div>
            {ownPlaylists.map((playlist) => (
              <button type="button" className={selected?.id === playlist.id ? 'active' : ''} key={playlist.id} onClick={() => setSearchParams({ open: playlist.id })}>
                <PlaylistCover playlist={playlist} tracks={data.tracks} />
                <span><strong>{playlist.name}</strong><small>{playlist.trackIds.length.toLocaleString('fa-IR')} آهنگ</small></span>
                <Icon name="chevron" size={17} />
              </button>
            ))}
          </aside>

          {selected ? (
            <section className="playlist-detail-card">
              <header className="playlist-detail-header">
                <PlaylistCover playlist={selected} tracks={data.tracks} />
                <div><span className="eyebrow">پلی‌لیست شخصی</span><h2>{selected.name}</h2><p>{selected.description || 'بدون توضیح'}</p><span>{selected.trackIds.length.toLocaleString('fa-IR')} آهنگ · آخرین ویرایش {new Intl.DateTimeFormat('fa-IR').format(new Date(selected.updatedAt))}</span></div>
                <div className="playlist-header-actions"><button type="button" className="icon-button" onClick={() => setEditing(selected)} aria-label="تغییر نام"><Icon name="edit" /></button><button type="button" className="icon-button danger-hover" onClick={() => setDeleting(selected)} aria-label="حذف پلی‌لیست"><Icon name="trash" /></button></div>
              </header>
              <div className="playlist-detail-toolbar"><Link className="button button-secondary small" to="/explore"><Icon name="plus" /> افزودن آهنگ از آرشیو</Link><span>برای افزودن هر آهنگ، دکمه + روی کارت آن را بزنید.</span></div>
              {selectedTracks.length ? <div className="track-list-card borderless">{selectedTracks.map((track, index) => <TrackCard key={track.id} track={track} queue={selectedTracks} compact rank={index + 1} onRemove={() => { void removeTrackFromPlaylist(selected.id, track.id); }} />)}</div> : <EmptyState icon="music" title="این پلی‌لیست خالی است" description="از آرشیو موسیقی، آهنگ‌های موردعلاقه خود را به این مجموعه اضافه کنید." action={<Link className="button button-primary" to="/explore">رفتن به آرشیو</Link>} />}
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState icon="playlist" title="اولین پلی‌لیست خود را بسازید" description="مجموعه‌های شخصی برای مطالعه، ورزش، سفر یا هر حال‌وهوایی ایجاد کنید." action={<button type="button" className="button button-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" /> ساخت پلی‌لیست</button>} />
      )}

      <PlaylistFormModal open={createOpen} title="ساخت پلی‌لیست جدید" onClose={() => setCreateOpen(false)} onSubmit={create} />
      {editing ? <PlaylistFormModal open title="تغییر نام پلی‌لیست" initialName={editing.name} initialDescription={editing.description} onClose={() => setEditing(null)} onSubmit={rename} /> : null}
      <Modal open={deleting !== null} title="حذف پلی‌لیست" onClose={() => setDeleting(null)} size="small" footer={<><button type="button" className="button button-ghost" onClick={() => setDeleting(null)}>انصراف</button><button type="button" className="button button-danger" onClick={remove}>حذف پلی‌لیست</button></>}><div className="confirm-content"><span className="confirm-icon danger"><Icon name="trash" /></span><p>پلی‌لیست «{deleting?.name}» حذف می‌شود؛ آهنگ‌ها از آرشیو اصلی پاک نخواهند شد.</p></div></Modal>
    </div>
  );
}
