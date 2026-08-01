import { useMemo } from 'react';

import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import type { Track } from '../types';
import EmptyState from './EmptyState';
import Icon from './Icon';
import Modal from './Modal';

interface PlaylistPickerProps {
  open: boolean;
  track: Track | null;
  onClose: () => void;
}

export default function PlaylistPicker({ open, track, onClose }: PlaylistPickerProps) {
  const { data, currentUser, addTrackToPlaylist } = useAppState();
  const { pushToast } = useToast();
  const playlists = useMemo(
    () => data.playlists.filter((playlist) => playlist.userId === currentUser?.id),
    [currentUser?.id, data.playlists],
  );

  const handleAdd = async (playlistId: string) => {
    if (!track) return;
    const result = await addTrackToPlaylist(playlistId, track.id);
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) onClose();
  };

  return (
    <Modal
      open={open}
      title="افزودن به پلی‌لیست"
      description={track ? `انتخاب پلی‌لیست برای «${track.title}»` : undefined}
      onClose={onClose}
      size="small"
    >
      {playlists.length === 0 ? (
        <EmptyState
          icon="playlist"
          title="هنوز پلی‌لیستی ندارید"
          description="ابتدا از صفحه پلی‌لیست‌ها یک مجموعه جدید بسازید."
        />
      ) : (
        <div className="playlist-picker-list">
          {playlists.map((playlist) => {
            const alreadyAdded = track ? playlist.trackIds.includes(track.id) : false;
            return (
              <button
                type="button"
                key={playlist.id}
                className="playlist-picker-item"
                disabled={alreadyAdded}
                onClick={() => handleAdd(playlist.id)}
              >
                <span className="playlist-picker-icon"><Icon name="playlist" /></span>
                <span>
                  <strong>{playlist.name}</strong>
                  <small>{playlist.trackIds.length.toLocaleString('fa-IR')} آهنگ</small>
                </span>
                {alreadyAdded ? <span className="already-added"><Icon name="check" size={15} /> افزوده شده</span> : <Icon name="plus" />}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
