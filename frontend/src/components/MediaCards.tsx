import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../domain/phase1.js';
import type { Album, Track } from '../types';
import Icon from './Icon';
import PlaylistPicker from './PlaylistPicker';

interface TrackCardProps {
  track: Track;
  queue?: Track[];
  compact?: boolean;
  rank?: number;
  onRemove?: () => void;
}

export function TrackCard({ track, queue, compact = false, rank, onRemove }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [pickerOpen, setPickerOpen] = useState(false);
  const active = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (active) togglePlay();
    else playTrack(track.id, queue?.map((item) => item.id));
  };

  const openPicker = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setPickerOpen(true);
  };

  if (compact) {
    return (
      <>
        <article className={`track-row ${active ? 'track-row-active' : ''}`}>
          {rank !== undefined ? <span className="track-rank">{rank.toLocaleString('fa-IR')}</span> : null}
          <button type="button" className="track-cover-button" onClick={handlePlay} aria-label={`پخش ${track.title}`}>
            <img src={track.cover} alt="" />
            <span><Icon name={active && isPlaying ? 'pause' : 'play'} size={17} /></span>
          </button>
          <div className="track-main-copy">
            <strong>{track.title}</strong>
            <Link to={`/artist/${track.artistId}`}>{track.artistName}</Link>
          </div>
          <div className="track-album-link">
            {track.albumId ? <Link to={`/album/${track.albumId}`}>{track.albumTitle}</Link> : <span>تک‌آهنگ</span>}
          </div>
          <span className="track-listeners">{track.listeners.toLocaleString('fa-IR')} شنونده</span>
          <span className="track-duration">{formatDuration(track.duration)}</span>
          <div className="track-row-actions">
            <button type="button" className="icon-button subtle" onClick={openPicker} aria-label="افزودن به پلی‌لیست">
              <Icon name="plus" size={18} />
            </button>
            {onRemove ? (
              <button type="button" className="icon-button subtle danger-hover" onClick={onRemove} aria-label="حذف از پلی‌لیست">
                <Icon name="trash" size={17} />
              </button>
            ) : null}
          </div>
        </article>
        <PlaylistPicker open={pickerOpen} track={track} onClose={() => setPickerOpen(false)} />
      </>
    );
  }

  return (
    <>
      <article className={`media-card track-card ${active ? 'media-card-active' : ''}`}>
        <button type="button" className="media-cover" onClick={handlePlay} aria-label={`پخش ${track.title}`}>
          <img src={track.cover} alt={`کاور ${track.title}`} />
          <span className="media-play-button"><Icon name={active && isPlaying ? 'pause' : 'play'} size={21} /></span>
          {track.earlyAccess ? <span className="early-access-label"><Icon name="crown" size={13} /> دسترسی زودهنگام</span> : null}
        </button>
        <div className="media-card-copy">
          <strong>{track.title}</strong>
          <Link to={`/artist/${track.artistId}`}>{track.artistName}</Link>
          <div className="media-meta-row">
            <span>{track.genre}</span>
            <span>{formatDuration(track.duration)}</span>
          </div>
        </div>
        <button type="button" className="media-add-button" onClick={openPicker} aria-label="افزودن به پلی‌لیست">
          <Icon name="plus" size={18} />
        </button>
      </article>
      <PlaylistPicker open={pickerOpen} track={track} onClose={() => setPickerOpen(false)} />
    </>
  );
}

export function AlbumCard({ album }: { album: Album }) {
  return (
    <article className="media-card album-card">
      <Link className="media-cover" to={`/album/${album.id}`}>
        <img src={album.cover} alt={`کاور آلبوم ${album.title}`} />
        <span className="media-play-button"><Icon name="arrow" size={20} /></span>
      </Link>
      <div className="media-card-copy">
        <Link className="media-title-link" to={`/album/${album.id}`}>{album.title}</Link>
        <Link to={`/artist/${album.artistId}`}>{album.artistName}</Link>
        <div className="media-meta-row">
          <span>{album.genre}</span>
          <span>{album.trackIds.length.toLocaleString('fa-IR')} آهنگ</span>
        </div>
      </div>
    </article>
  );
}
