import { formatCompactNumber, formatToman, getReleaseTypeLabel } from '../utils/catalogPresentation';
import type { Track } from '../types';

interface TrackRowProps {
  track: Track;
  onDelete: (id: string) => void;
}

export default function TrackRow({ track, onDelete }: TrackRowProps) {
  return (
    <div className="track-row">
      <div className="track-row-info">
        <strong>{track.title}</strong>
        <span className="track-type-chip">{getReleaseTypeLabel(track.type)}</span>
        <span>
          {track.genre} · {track.releaseYear}
          {track.collaborators.length > 0
            ? ` · همکاران: ${track.collaborators.join('، ')}`
            : ''}
        </span>
      </div>

      <div className="track-row-stats">
        <div>
          <span>استریم</span>
          <strong>{formatCompactNumber(track.streams)}</strong>
        </div>
        <div>
          <span>درآمد</span>
          <strong>{formatToman(track.revenue)}</strong>
        </div>
        <button type="button" className="icon-button icon-button-danger" onClick={() => onDelete(track.id)}>
          حذف
        </button>
      </div>
    </div>
  );
}