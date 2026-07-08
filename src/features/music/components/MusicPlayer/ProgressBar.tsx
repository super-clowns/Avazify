import { useCallback } from 'react';
import { formatTime } from '../../../../utils/formatTime';

interface ProgressBarProps {
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function ProgressBar({ progress, duration, onSeek }: ProgressBarProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  }, [duration, onSeek]);

  const percent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', direction: 'ltr' }}>
      <span style={{ fontSize: '12px', color: '#94a3b8', minWidth: '36px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(progress)}
      </span>
      <div
        onClick={handleClick}
        style={{
          flex: 1, height: '6px', backgroundColor: '#334155', borderRadius: '3px', cursor: 'pointer',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '3px',
            transition: 'width 0.1s linear',
          }}
        />
        <div
          style={{
            position: 'absolute', top: '-4px', width: '14px', height: '14px', borderRadius: '50%',
            backgroundColor: '#3b82f6', left: `calc(${percent}% - 7px)`, display: percent > 0 ? 'block' : 'none',
          }}
        />
      </div>
      <span style={{ fontSize: '12px', color: '#94a3b8', minWidth: '36px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(duration)}
      </span>
    </div>
  );
}
