import { useCallback } from 'react';

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export default function VolumeSlider({ volume, onVolumeChange }: VolumeSliderProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onVolumeChange(ratio);
  }, [onVolumeChange]);

  const icon = volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', direction: 'ltr' }}>
      <span style={{ fontSize: '16px', cursor: 'pointer' }} onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}>
        {icon}
      </span>
      <div
        onClick={handleClick}
        style={{
          width: '100px', height: '5px', backgroundColor: '#334155', borderRadius: '3px',
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${volume * 100}%`, height: '100%', backgroundColor: '#e2e8f0', borderRadius: '3px',
          }}
        />
      </div>
    </div>
  );
}
