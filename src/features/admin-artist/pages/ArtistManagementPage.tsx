import { useState } from 'react';

import { useAuth } from '../../auth-profile/hooks/useAuth';
import Button from '../../../components/Button';

import TrackFormModal from '../components/TrackFormModal';
import TrackRow from '../components/TrackRow';

import { useTrackStore } from '../data/trackStore';
import { formatCompactNumber, formatToman, getArtistTotals } from '../utils/catalogPresentation';
import type { Track } from '../types';

export default function ArtistManagementPage() {
  const { currentUser } = useAuth();

  const { tracks, addTrack: addTrackToStore, deleteTrack: deleteTrackFromStore } = useTrackStore(
    currentUser?.id ?? '',
  );

  const [isFormOpen, setIsFormOpen] = useState(false);

  const totals = getArtistTotals(tracks);

  const addTrack = (track: Track) => {
    addTrackToStore(track);
    setIsFormOpen(false);
  };

  const deleteTrack = (id: string) => {
    if (window.confirm('آیا از حذف این اثر اطمینان دارید؟')) {
      deleteTrackFromStore(id);
    }
  };

  if (!currentUser) return null;

  return (
    <section className="phase-page">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Artist Catalog Module</p>
          <h1>مدیریت آثار</h1>
        </div>

        <div className="page-actions">
          <Button onClick={() => setIsFormOpen(true)}>انتشار اثر جدید</Button>
        </div>
      </div>

      <div className="artist-stat-row">
        <article>
          <span>کل استریم‌ها</span>
          <strong>{formatCompactNumber(totals.streams)}</strong>
        </article>
        <article>
          <span>کل شنوندگان</span>
          <strong>{formatCompactNumber(totals.listeners)}</strong>
        </article>
        <article>
          <span>کل درآمد</span>
          <strong>{formatToman(totals.revenue)}</strong>
        </article>
      </div>

      <div className="track-row-list">
        {tracks.map((track) => (
          <TrackRow key={track.id} track={track} onDelete={deleteTrack} />
        ))}

        {tracks.length === 0 ? (
          <div className="empty-state">
            <h3>هنوز اثری منتشر نکرده‌اید</h3>
          </div>
        ) : null}
      </div>

      <TrackFormModal
        isOpen={isFormOpen}
        artistId={currentUser.id}
        onClose={() => setIsFormOpen(false)}
        onSubmit={addTrack}
      />
    </section>
  );
}