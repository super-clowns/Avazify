export function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

export function createUsername(email, existingUsernames = []) {
  const base = normalizeEmail(email)
    .split('@')[0]
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'avazify_user';

  if (!existingUsernames.includes(base)) return base;

  let index = 2;
  while (existingUsernames.includes(`${base}_${index}`)) index += 1;
  return `${base}_${index}`;
}

export function getPlaylistLimit(tier) {
  if (tier === 'free') return 6;
  if (tier === 'silver') return 100;
  return null;
}

export function getDailyStreamLimit(tier) {
  return tier === 'free' ? 60 : null;
}

export function canCreatePlaylist(tier, count) {
  const limit = getPlaylistLimit(tier);
  return limit === null || count < limit;
}

export function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function filterTracks(tracks, query, genre = 'all') {
  const normalized = query.trim().toLocaleLowerCase('fa');
  return tracks.filter((track) => {
    const matchesText = !normalized || [track.title, track.artistName, track.albumTitle || '']
      .some((value) => value.toLocaleLowerCase('fa').includes(normalized));
    const matchesGenre = genre === 'all' || track.genre === genre;
    return matchesText && matchesGenre;
  });
}

export function sortTracks(tracks, sortBy) {
  const copy = [...tracks];
  if (sortBy === 'listeners') return copy.sort((a, b) => b.listeners - a.listeners);
  if (sortBy === 'oldest') return copy.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  return copy.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
}

export function markAllRead(notifications) {
  return notifications.map((item) => ({ ...item, read: true }));
}

export function removeNotification(notifications, id) {
  return notifications.filter((item) => item.id !== id);
}

export function nextQueueIndex(currentIndex, queueLength, repeat, direction = 1) {
  if (queueLength <= 0) return -1;
  if (repeat === 'one') return Math.max(0, currentIndex);
  const candidate = currentIndex + direction;
  if (candidate >= 0 && candidate < queueLength) return candidate;
  if (repeat === 'all') return direction > 0 ? 0 : queueLength - 1;
  return -1;
}

export function cycleRepeat(mode) {
  if (mode === 'off') return 'all';
  if (mode === 'all') return 'one';
  return 'off';
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '۰:۰۰';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
}

export function calculateReward(uniqueListeners, streams) {
  return Math.round(uniqueListeners * 45 + streams * 8.5);
}
