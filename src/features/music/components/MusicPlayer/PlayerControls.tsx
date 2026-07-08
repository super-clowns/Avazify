import type { RepeatMode } from '../../types';

interface PlayerControlsProps {
  isPlaying: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSetRepeat: (mode: RepeatMode) => void;
  onToggleShuffle: () => void;
}

export default function PlayerControls({
  isPlaying, repeat, shuffle, onTogglePlay, onNext, onPrev, onSetRepeat, onToggleShuffle,
}: PlayerControlsProps) {
  const btnStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', color: '#e2e8f0',
    fontSize: '20px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%', transition: 'all 0.2s',
  };
  const activeBtnStyle: React.CSSProperties = { ...btnStyle, color: '#3b82f6' };
  const playBtnStyle: React.CSSProperties = {
    background: '#3b82f6', border: 'none', cursor: 'pointer', color: '#fff',
    fontSize: '24px', width: '44px', height: '44px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
  };

  const repeatIcons: Record<RepeatMode, string> = { off: '🔁', all: '🔁', one: '🔂' };
  const repeatTitles: Record<RepeatMode, string> = { off: 'بدون تکرار', all: 'تکرار همه', one: 'تکرار یک آهنگ' };

  const handleRepeatClick = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const idx = modes.indexOf(repeat);
    onSetRepeat(modes[(idx + 1) % modes.length]);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', direction: 'ltr' }}>
      <button onClick={onToggleShuffle} style={shuffle ? activeBtnStyle : btnStyle} title={shuffle ? 'پخش تصادفی روشن' : 'پخش تصادفی خاموش'}>
        🔀
      </button>
      <button onClick={onPrev} style={btnStyle} title="قبلی">⏮</button>
      <button onClick={onTogglePlay} style={playBtnStyle} title={isPlaying ? 'توقف' : 'پخش'}>
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button onClick={onNext} style={btnStyle} title="بعدی">⏭</button>
      <button onClick={handleRepeatClick} style={repeat !== 'off' ? activeBtnStyle : btnStyle} title={repeatTitles[repeat]}>
        {repeatIcons[repeat]}
      </button>
    </div>
  );
}
