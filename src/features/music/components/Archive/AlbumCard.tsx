import type { Album } from '../../types';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

export default function AlbumCard({ album, onClick }: AlbumCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '12px', cursor: 'pointer', transition: 'box-shadow 0.2s',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div
        style={{
          width: '100%', aspectRatio: '1', backgroundColor: '#1e293b', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px',
        }}
      >
        💿
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {album.title}
        </div>
        <div style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {album.artist} • {album.year}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '11px' }}>
        <span>{album.tracks.length} آهنگ</span>
        <span>{album.plays.toLocaleString()} پخش</span>
      </div>
    </div>
  );
}
