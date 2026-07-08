import type { Playlist } from '../../types';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function PlaylistCard({ playlist, onClick, onRename, onDelete }: PlaylistCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s',
        display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div
        style={{
          width: '100%', aspectRatio: '1', backgroundColor: '#1e293b', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px',
        }}
      >
        🎶
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {playlist.name}
        </div>
        <div style={{ color: '#64748b', fontSize: '12px' }}>
          {playlist.tracks.length} آهنگ
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onRename} style={{ flex: 1, padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '11px', color: '#475569' }}>
          تغییر نام
        </button>
        <button onClick={onDelete} style={{ flex: 1, padding: '6px', border: '1px solid #fca5a5', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '11px', color: '#dc2626' }}>
          حذف
        </button>
      </div>
    </div>
  );
}
