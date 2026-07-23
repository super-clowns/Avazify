import type { ReleaseType, Track } from '../types';

const releaseTypeLabels: Record<ReleaseType, string> = {
  single: 'تک‌آهنگ',
  album: 'آلبوم',
};

export function getReleaseTypeLabel(type: ReleaseType) {
  return releaseTypeLabels[type];
}

export function formatCompactNumber(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }

  return value.toLocaleString('fa-IR');
}

export function formatToman(value: number) {
  return `${value.toLocaleString('fa-IR')} تومان`;
}

export function getArtistTotals(tracks: Track[]) {
  return tracks.reduce(
    (totals, track) => ({
      streams: totals.streams + track.streams,
      listeners: totals.listeners + track.listeners,
      revenue: totals.revenue + track.revenue,
    }),
    { streams: 0, listeners: 0, revenue: 0 },
  );
}
