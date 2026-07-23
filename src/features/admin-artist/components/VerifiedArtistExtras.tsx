
import { mockArtistCatalogStats } from '../data/mockCatalog';
import { getTracksForArtist } from '../data/trackStore';
import {
  formatCompactNumber,
  getArtistTotals,
  getReleaseTypeLabel,
} from '../utils/catalogPresentation';

import type { User } from '../../auth-profile/types';

interface VerifiedArtistExtrasProps {
  user: User;
  isGoldViewer: boolean;
}

// Extra artist-only info rendered inside the regular ProfilePage
// when the profile owner is an approved artist.
export default function VerifiedArtistExtras({
  user,
  isGoldViewer,
}: VerifiedArtistExtrasProps) {
  if (user.artistVerificationStatus !== 'approved') {
    return null;
  }

  const catalogStats = mockArtistCatalogStats.find(
    (stat) => stat.artistId === user.id,
  );

  
  const tracks = getTracksForArtist(user.id);

  const totals = getArtistTotals(tracks);

  return (
    <section className="content-card artist-extras-card">
      <div className="content-card-heading">
        <h2>
          آثار و آمار هنرمند
        </h2>
      </div>

      {isGoldViewer ? (
        <div className="artist-stat-row">
          <article>
            <span>شنوندگان ماهانه</span>
            <strong>
              {catalogStats
                ? formatCompactNumber(catalogStats.monthlyListeners)
                : '—'}
            </strong>
          </article>

          <article>
            <span>کل استریم‌ها</span>
            <strong>{formatCompactNumber(totals.streams)}</strong>
          </article>
        </div>
      ) : (
        <p className="artist-stats-locked">
          مشاهده آمار تفصیلی شنوندگان و استریم‌ها مخصوص کاربران اشتراک طلایی است.
        </p>
      )}

      <ul className="artist-track-list">
        {tracks.map((track) => (
          <li key={track.id}>
            <span>{track.title}</span>
            <span className="track-type-chip">
              {getReleaseTypeLabel(track.type)}
            </span>
            <span>{formatCompactNumber(track.listeners)} شنونده</span>
          </li>
        ))}

        {tracks.length === 0 ? (
          <li className="artist-track-empty">هنوز اثری منتشر نشده است.</li>
        ) : null}
      </ul>
    </section>
  );
}