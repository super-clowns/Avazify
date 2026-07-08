import { useState } from 'react';
import { usePlaylistStore } from '../hooks/usePlaylistStore';
import { useAudio } from '../../../context/AudioContext';
import PlaylistCard from '../components/Playlist/PlaylistCard';
import CreatePlaylistModal from '../components/Playlist/CreatePlaylistModal';
import TrackCard from '../components/Archive/TrackCard';
import type { Playlist } from '../types';

export default function PlaylistsPage() {
  const { playlists, createPlaylist, renamePlaylist, deletePlaylist } = usePlaylistStore();
  const { playTrack } = useAudio();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleStartRename = (p: Playlist) => {
    setRenamingId(p.id);
    setRenameValue(p.name);
  };

  const handleConfirmRename = (id: string) => {
    if (renameValue.trim()) {
      renamePlaylist(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', direction: 'rtl', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#0f172a', fontSize: '24px' }}>پلی‌لیست‌ها</h1>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >
          ایجاد پلی‌لیست جدید
        </button>
      </div>

      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
          <h3 style={{ color: '#64748b', margin: '0 0 8px 0' }}>هنوز پلی‌لیستی نداری!</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0' }}>اولین پلی‌لیست خود را بسازید و آهنگ‌های مورد علاقه‌تان را اضافه کنید.</p>
          <button onClick={() => setShowCreate(true)} style={{ padding: '10px 24px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ساخت اولین پلی‌لیست
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {playlists.map(p => (
              <PlaylistCard
                key={p.id}
                playlist={p}
                onClick={() => setSelectedPlaylist(selectedPlaylist?.id === p.id ? null : p)}
                onRename={() => handleStartRename(p)}
                onDelete={() => { if (confirm('آیا از حذف این پلی‌لیست اطمینان دارید؟')) deletePlaylist(p.id); }}
              />
            ))}
          </div>

          {selectedPlaylist && (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                {renamingId === selectedPlaylist.id ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text" value={renameValue} onChange={e => setRenameValue(e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleConfirmRename(selectedPlaylist.id)}
                    />
                    <button onClick={() => handleConfirmRename(selectedPlaylist.id)} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>تایید</button>
                    <button onClick={() => setRenamingId(null)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>لغو</button>
                  </div>
                ) : (
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{selectedPlaylist.name}</h2>
                )}
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>{selectedPlaylist.tracks.length} آهنگ</span>
              </div>

              {selectedPlaylist.tracks.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>این پلی‌لیست خالی است. از صفحه آرشیو آهنگ اضافه کنید.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedPlaylist.tracks.map(track => (
                    <TrackCard key={track.id} track={track} onPlay={playTrack} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <CreatePlaylistModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={createPlaylist} />
    </div>
  );
}
