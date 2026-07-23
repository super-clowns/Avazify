import type { ArtistCatalogStats, Track } from '../types';

// Extra artist-only stats that don't belong on the shared User model.
export const mockArtistCatalogStats: ArtistCatalogStats[] = [
  {
    artistId: 'user-artist-approved',
    monthlyListeners: 128000,
    verifiedSince: '2026-04-18',
  },
];

export const mockTracks: Track[] = [
  {
    id: 'track-001',
    artistId: 'user-artist-approved',
    title: 'Summer Glow',
    type: 'single',
    coverUrl: null,
    genre: 'Indie Pop',
    releaseYear: '1405',
    collaborators: ['Producer X'],
    lyrics: '',
    listeners: 98000,
    streams: 240000,
    revenue: 14500000,
    createdAt: '2026-05-02',
  },
  {
    id: 'track-002',
    artistId: 'user-artist-approved',
    title: 'امضا',
    type: 'album',
    coverUrl: null,
    genre: 'پاپ',
    releaseYear: '1405',
    collaborators: ['علی راد'],
    lyrics: 'برای من امضا کن تا نامت روی دستم بماند...',
    listeners: 42000,
    streams: 118000,
    revenue: 8400000,
    createdAt: '2026-03-14',
  },
];
