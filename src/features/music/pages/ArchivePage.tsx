import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaylistStore } from '../hooks/usePlaylistStore';
import { useAudio } from '../../../context/AudioContext';
import { mockAlbums, mockTracks } from '../../../services/mockData';
import SearchBar from '../components/Archive/SearchBar';
import AlbumCard from '../components/Archive/AlbumCard';
import TrackCard from '../components/Archive/TrackCard';

export default function ArchivePage() {
  const navigate = useNavigate();
  const { playTrack } = useAudio();
  const { playlists, addTrackToPlaylist } = usePlaylistStore();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'listeners' | 'date'>('listeners');
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);

  const filteredAlbums = useMemo(() => {
    let list = [...mockAlbums];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q));
    }
    if (sortBy === 'listeners') list.sort((a, b) => b.plays - a.plays);
    else list.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    return list;
  }, [query, sortBy]);

  const filteredTracks = useMemo(() => {
    let list = [...mockTracks];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
    }
    if (sortBy === 'listeners') list.sort((a, b) => b.plays - a.plays);
    else list.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    return list;
  }, [query, sortBy]);

  const handlePlayTrack = (track: typeof mockTracks[0]) => {
    playTrack(track, filteredTracks);
  };

  const handleAddToPlaylist = (trackId: string) => {
    setShowPlaylistMenu(showPlaylistMenu === trackId ? null : trackId);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', direction: 'rtl', paddingBottom: '100px' }}>
      <h1 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '24px' }}>آرشیو آهنگ‌ها و آلبوم‌ها</h1>

      <div style={{ marginBottom: '24px' }}>
        <SearchBar query={query} sortBy={sortBy} onQueryChange={setQuery} onSortChange={setSortBy} />
      </div>

      <h2 style={{ color: '#0f172a', fontSize: '18px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
        آلبوم‌ها
      </h2>
      {filteredAlbums.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>نتیجه‌ای یافت نشد.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {filteredAlbums.map(album => (
            <AlbumCard key={album.id} album={album} onClick={() => navigate(`/album/${album.id}`)} />
          ))}
        </div>
      )}

      <h2 style={{ color: '#0f172a', fontSize: '18px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
        تک‌آهنگ‌ها
      </h2>
      {filteredTracks.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>نتیجه‌ای یافت نشد.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTracks.map(track => (
            <div key={track.id} style={{ position: 'relative' }}>
              <TrackCard track={track} onPlay={handlePlayTrack} onAddToPlaylist={() => handleAddToPlaylist(track.id)} />
              {showPlaylistMenu === track.id && (
                <div
                  style={{
                    position: 'absolute', left: '60px', top: '100%', backgroundColor: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '200px', padding: '8px 0', marginTop: '4px',
                  }}
                >
                  <div style={{ padding: '8px 14px', fontSize: '12px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>افزودن به پلی‌لیست</div>
                  {playlists.length === 0 ? (
                    <div style={{ padding: '12px 14px', fontSize: '12px', color: '#94a3b8' }}>پلی‌لیستی وجود ندارد</div>
                  ) : (
                    playlists.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { addTrackToPlaylist(p.id, track); setShowPlaylistMenu(null); }}
                        style={{ display: 'block', width: '100%', padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'right', fontSize: '13px', color: '#334155' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {p.name} ({p.tracks.length})
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
