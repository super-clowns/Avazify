import { useState } from 'react';
import { useAudio } from '../../../../context/AudioContext';
import ProgressBar from './ProgressBar';
import PlayerControls from './PlayerControls';
import VolumeSlider from './VolumeSlider';
import LyricsPanel from './LyricsPanel';

export default function MusicPlayerBar() {
  const { state, togglePlay, next, prev, seek, setVolume, setRepeat, toggleShuffle } = useAudio();
  const [showLyrics, setShowLyrics] = useState(false);

  if (!state.currentTrack) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '80px',
          backgroundColor: '#0f172a', borderTop: '1px solid #1e293b',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: '20px',
          zIndex: 999, direction: 'rtl',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '280px', flexShrink: 0 }}>
          <div
            style={{
              width: '52px', height: '52px', borderRadius: '8px', backgroundColor: '#1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
            }}
          >
            🎵
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {state.currentTrack.title}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {state.currentTrack.artist}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', maxWidth: '600px', margin: '0 auto' }}>
          <PlayerControls
            isPlaying={state.isPlaying}
            repeat={state.repeat}
            shuffle={state.shuffle}
            onTogglePlay={togglePlay}
            onNext={next}
            onPrev={prev}
            onSetRepeat={setRepeat}
            onToggleShuffle={toggleShuffle}
          />
          <ProgressBar progress={state.progress} duration={state.duration} onSeek={seek} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '280px', justifyContent: 'flex-end', flexShrink: 0 }}>
          {state.currentTrack.lyrics && (
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              style={{
                background: 'none', border: 'none', color: showLyrics ? '#3b82f6' : '#94a3b8',
                cursor: 'pointer', fontSize: '18px', padding: '4px',
              }}
              title="متن آهنگ"
            >
              📝
            </button>
          )}
          <VolumeSlider volume={state.volume} onVolumeChange={setVolume} />
        </div>
      </div>

      <LyricsPanel lyrics={state.currentTrack.lyrics} isOpen={showLyrics} onClose={() => setShowLyrics(false)} />
    </>
  );
}
