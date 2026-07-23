import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';

import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAppState } from '../context/AppStateContext';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { formatDuration } from '../domain/phase1.js';

export default function PlayerBar() {
  const { currentUser } = useAppState();
  const { pushToast } = useToast();
  const {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeat,
    shuffle,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    cycleRepeatMode,
    toggleShuffle,
    playTrack,
  } = usePlayer();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  if (!currentTrack) return null;

  const downloadCurrentTrack = () => {
    if (currentUser?.subscription === 'free') {
      pushToast('دانلود آهنگ برای اشتراک نقره‌ای و طلایی فعال است.', 'error');
      return;
    }
    const link = document.createElement('a');
    link.href = currentTrack.audioUrl;
    link.download = `${currentTrack.title}.wav`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    pushToast('دانلود آزمایشی آهنگ آغاز شد.', 'success');
  };

  const controls = (
    <div className="player-controls">
      <button type="button" className={`player-control ${shuffle ? 'active' : ''}`} onClick={toggleShuffle} aria-label="پخش تصادفی">
        <Icon name="shuffle" size={19} />
      </button>
      <button type="button" className="player-control" onClick={previous} aria-label="آهنگ قبلی">
        <Icon name="previous" size={20} />
      </button>
      <button type="button" className="player-main-control" onClick={togglePlay} aria-label={isPlaying ? 'توقف' : 'پخش'}>
        <Icon name={isPlaying ? 'pause' : 'play'} size={22} />
      </button>
      <button type="button" className="player-control" onClick={next} aria-label="آهنگ بعدی">
        <Icon name="next" size={20} />
      </button>
      <button type="button" className={`player-control ${repeat !== 'off' ? 'active' : ''}`} onClick={cycleRepeatMode} aria-label="حالت تکرار">
        <Icon name={repeat === 'one' ? 'repeatOne' : 'repeat'} size={19} />
      </button>
    </div>
  );

  const progress = (
    <div className="player-progress-row">
      <span>{formatDuration(currentTime)}</span>
      <input
        className="range-slider"
        type="range"
        min={0}
        max={Math.max(duration, 1)}
        step={0.1}
        value={Math.min(currentTime, duration || 1)}
        onChange={(event) => seek(Number(event.target.value))}
        style={{ '--progress': `${duration ? (currentTime / duration) * 100 : 0}%` } as CSSProperties}
        aria-label="موقعیت پخش"
      />
      <span>{formatDuration(duration)}</span>
    </div>
  );

  return (
    <>
      <section className="desktop-player" aria-label="پخش‌کننده موسیقی">
        <div className="player-track-info">
          <img src={currentTrack.cover} alt="" />
          <div>
            <strong>{currentTrack.title}</strong>
            <Link to={`/artist/${currentTrack.artistId}`}>{currentTrack.artistName}</Link>
            {currentUser?.subscription === 'gold' ? <span className="player-gold-stats">{currentTrack.listeners.toLocaleString('fa-IR')} شنونده · {currentTrack.streams.toLocaleString('fa-IR')} استریم</span> : null}
          </div>
        </div>
        <div className="player-center">
          {controls}
          {progress}
        </div>
        <div className="player-tools">
          <button type="button" className={`player-control ${lyricsOpen ? 'active' : ''}`} onClick={() => setLyricsOpen(true)} disabled={!currentTrack.lyrics} aria-label="متن آهنگ">
            <Icon name="lyrics" size={19} />
          </button>
          <button type="button" className="player-control" onClick={() => setQueueOpen(true)} aria-label="صف پخش">
            <Icon name="queue" size={19} />
          </button>
          <button type="button" className="player-control" onClick={downloadCurrentTrack} aria-label="دانلود آهنگ">
            <Icon name="download" size={18} />
          </button>
          <Icon name="volume" size={19} />
          <input
            className="volume-range"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            style={{ '--progress': `${volume * 100}%` } as CSSProperties}
            aria-label="میزان صدا"
          />
        </div>
      </section>

      <div
        className="mobile-mini-player"
        role="button"
        tabIndex={0}
        onClick={() => setMobileExpanded(true)}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter' || event.key === ' ') setMobileExpanded(true);
        }}
        style={{ '--progress': `${duration ? (currentTime / duration) * 100 : 0}%` } as CSSProperties}
      >
        <img src={currentTrack.cover} alt="" />
        <span>
          <strong>{currentTrack.title}</strong>
          <small>{currentTrack.artistName}</small>
        </span>
        <button
          type="button"
          className="player-main-control mini"
          onClick={(event) => {
            event.stopPropagation();
            togglePlay();
          }}
          aria-label={isPlaying ? 'توقف' : 'پخش'}
        >
          <Icon name={isPlaying ? 'pause' : 'play'} size={18} />
        </button>
      </div>

      <div className={`mobile-full-player ${mobileExpanded ? 'open' : ''}`}>
        <header>
          <button type="button" className="icon-button" onClick={() => setMobileExpanded(false)} aria-label="بستن پخش‌کننده">
            <Icon name="close" />
          </button>
          <strong>در حال پخش</strong>
          <button type="button" className="icon-button" onClick={() => setQueueOpen(true)} aria-label="صف پخش">
            <Icon name="queue" />
          </button>
        </header>
        <div className="mobile-player-cover"><img src={currentTrack.cover} alt={`کاور ${currentTrack.title}`} /></div>
        <div className="mobile-player-copy">
          <h2>{currentTrack.title}</h2>
          <Link to={`/artist/${currentTrack.artistId}`} onClick={() => setMobileExpanded(false)}>{currentTrack.artistName}</Link>
          {currentUser?.subscription === 'gold' ? <span className="player-gold-stats">{currentTrack.listeners.toLocaleString('fa-IR')} شنونده · {currentTrack.streams.toLocaleString('fa-IR')} استریم</span> : null}
        </div>
        {progress}
        {controls}
        <div className="mobile-player-volume">
          <Icon name="volume" />
          <input className="range-slider" type="range" min={0} max={1} step={0.01} value={volume} onChange={(event) => setVolume(Number(event.target.value))} style={{ '--progress': `${volume * 100}%` } as CSSProperties} />
        </div>
        <button type="button" className="button button-secondary full" disabled={!currentTrack.lyrics} onClick={() => setLyricsOpen(true)}>
          <Icon name="lyrics" /> نمایش متن آهنگ
        </button>
      </div>

      <Modal open={queueOpen} title="صف پخش" description={`${queue.length.toLocaleString('fa-IR')} آهنگ در صف`} onClose={() => setQueueOpen(false)}>
        <div className="queue-list">
          {queue.map((track, index) => (
            <button
              type="button"
              key={`${track.id}-${index}`}
              className={`queue-item ${index === currentIndex ? 'active' : ''}`}
              onClick={() => playTrack(track.id, queue.map((item) => item.id))}
            >
              <span>{(index + 1).toLocaleString('fa-IR')}</span>
              <img src={track.cover} alt="" />
              <div><strong>{track.title}</strong><small>{track.artistName}</small></div>
              <span>{formatDuration(track.duration)}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={lyricsOpen} title={`متن آهنگ «${currentTrack.title}»`} onClose={() => setLyricsOpen(false)} size="small">
        {currentTrack.lyrics ? <p className="lyrics-text">{currentTrack.lyrics}</p> : <p className="muted-text">متنی برای این آهنگ ثبت نشده است.</p>}
      </Modal>
    </>
  );
}
