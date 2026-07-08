import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../../../context/AudioContext';
import { mockAlbums } from '../../../services/mockData';
import TrackCard from '../components/Archive/TrackCard';
import { formatTime } from '../../../utils/formatTime';

export default function AlbumDetailsPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { playTrack } = useAudio();

  const album = mockAlbums.find(a => a.id === albumId);

  if (!album) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', direction: 'rtl' }}>
        <h2 style={{ color: '#64748b' }}>آلبوم مورد نظر یافت نشد.</h2>
        <button onClick={() => navigate('/archive')} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '16px' }}>
          بازگشت به آرشیو
        </button>
      </div>
    );
  }

  const totalDuration = album.tracks.reduce((acc, t) => acc + t.duration, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', direction: 'rtl', paddingBottom: '100px' }}>
      <button onClick={() => navigate('/archive')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', padding: '0 0 16px 0', display: 'block' }}>
        ← بازگشت به آرشیو
      </button>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '200px', height: '200px', borderRadius: '12px', backgroundColor: '#1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', flexShrink: 0,
          }}
        >
          💿
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '28px' }}>{album.title}</h1>
          <div style={{ color: '#3b82f6', fontSize: '16px', marginBottom: '8px', cursor: 'pointer' }}>{album.artist}</div>
          <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '13px', flexWrap: 'wrap' }}>
            <span>سال: {album.year}</span>
            <span>سبک: {album.genre}</span>
            <span>{album.tracks.length} آهنگ</span>
            <span>مدت: {formatTime(totalDuration)}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', color: '#64748b', fontSize: '13px' }}>
            <span>{album.plays.toLocaleString()} پخش</span>
            <span>{album.listeners.toLocaleString()} شنونده</span>
          </div>
          <button
            onClick={() => album.tracks.length > 0 && playTrack(album.tracks[0], album.tracks)}
            style={{ marginTop: '16px', padding: '10px 24px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            ▶ پخش همه آهنگ‌ها
          </button>
        </div>
      </div>

      <h2 style={{ color: '#0f172a', fontSize: '16px', marginBottom: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
        لیست آهنگ‌ها
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {album.tracks.map((track, index) => (
          <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px', width: '24px', textAlign: 'center', flexShrink: 0 }}>{index + 1}</span>
            <div style={{ flex: 1 }}>
              <TrackCard track={track} onPlay={(t) => playTrack(t, album.tracks)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
