import type { Track } from '../../types';
import { formatTime } from '../../../../utils/formatTime';

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
}

export default function TrackCard({ track, onPlay, onAddToPlaylist }: TrackCardProps) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
        backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
      onClick={() => onPlay(track)}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
    >
      <div
        style={{
          width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#1e293b',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
        }}
      >
        🎵
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {track.title}
        </div>
        <div style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {track.artist}{track.album ? ` • ${track.album}` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{formatTime(track.duration)}</span>
        <span style={{ color: '#94a3b8', fontSize: '11px' }}>{track.plays.toLocaleString()} پخش</span>
        {onAddToPlaylist && (
          <button
            onClick={e => { e.stopPropagation(); onAddToPlaylist(track); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', padding: '4px' }}
            title="افزودن به پلی‌لیست"
          >
            ➕
          </button>
        )}
      </div>
    </div>
  );
}
