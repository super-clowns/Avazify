export type HomeReleaseType =
  | 'album'
  | 'single'
  | 'podcast';

export interface HomeRelease {
  id: string;
  title: string;
  artistName: string;
  artistUserId: string | null;
  type: HomeReleaseType;
  genre: string;
  publishedAt: string;
  trackCount: number;
  coverSymbol: string;
  isEarlyAccess: boolean;
}

export interface HomeTrack {
  id: string;
  title: string;
  artistName: string;
  artistUserId: string | null;
  genre: string;
  duration: string;
  playCount: number;
  coverSymbol: string;
  isEarlyAccess: boolean;
}

export interface HomeQuickLink {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
}

export const homeReleases: HomeRelease[] = [
  {
    id: 'release-neon-skyline',
    title: 'Neon Skyline',
    artistName: 'Luna Echo',
    artistUserId: 'user-artist-approved',
    type: 'album',
    genre: 'Indie Pop',
    publishedAt: '2026-07-18',
    trackCount: 10,
    coverSymbol: '◐',
    isEarlyAccess: false,
  },
  {
    id: 'release-midnight-waves',
    title: 'Midnight Waves',
    artistName: 'Luna Echo',
    artistUserId: 'user-artist-approved',
    type: 'single',
    genre: 'Alternative',
    publishedAt: '2026-07-22',
    trackCount: 1,
    coverSymbol: '≈',
    isEarlyAccess: true,
  },
  {
    id: 'release-silent-city',
    title: 'Silent City',
    artistName: 'Blue Horizon',
    artistUserId: null,
    type: 'album',
    genre: 'Electronic',
    publishedAt: '2026-07-12',
    trackCount: 8,
    coverSymbol: '◇',
    isEarlyAccess: false,
  },
  {
    id: 'release-persian-night',
    title: 'Persian Night',
    artistName: 'Nova Band',
    artistUserId: null,
    type: 'single',
    genre: 'Persian Pop',
    publishedAt: '2026-07-10',
    trackCount: 1,
    coverSymbol: '♪',
    isEarlyAccess: false,
  },
  {
    id: 'release-deep-focus',
    title: 'Deep Focus',
    artistName: 'Aria Sound',
    artistUserId: null,
    type: 'podcast',
    genre: 'Focus',
    publishedAt: '2026-07-08',
    trackCount: 6,
    coverSymbol: '◎',
    isEarlyAccess: false,
  },
  {
    id: 'release-golden-hour',
    title: 'Golden Hour',
    artistName: 'Luna Echo',
    artistUserId: 'user-artist-approved',
    type: 'single',
    genre: 'Dream Pop',
    publishedAt: '2026-07-23',
    trackCount: 1,
    coverSymbol: '★',
    isEarlyAccess: true,
  },
];

export const homeTracks: HomeTrack[] = [
  {
    id: 'track-city-lights',
    title: 'City Lights',
    artistName: 'Luna Echo',
    artistUserId: 'user-artist-approved',
    genre: 'Indie Pop',
    duration: '03:42',
    playCount: 847200,
    coverSymbol: '♫',
    isEarlyAccess: false,
  },
  {
    id: 'track-after-rain',
    title: 'After the Rain',
    artistName: 'Blue Horizon',
    artistUserId: null,
    genre: 'Alternative',
    duration: '04:08',
    playCount: 651400,
    coverSymbol: '☂',
    isEarlyAccess: false,
  },
  {
    id: 'track-paper-moon',
    title: 'Paper Moon',
    artistName: 'Luna Echo',
    artistUserId: 'user-artist-approved',
    genre: 'Dream Pop',
    duration: '03:25',
    playCount: 530900,
    coverSymbol: '◒',
    isEarlyAccess: false,
  },
  {
    id: 'track-northern-line',
    title: 'Northern Line',
    artistName: 'Aria Sound',
    artistUserId: null,
    genre: 'Electronic',
    duration: '05:10',
    playCount: 428600,
    coverSymbol: '△',
    isEarlyAccess: false,
  },
  {
    id: 'track-golden-hour',
    title: 'Golden Hour',
    artistName: 'Luna Echo',
    artistUserId: 'user-artist-approved',
    genre: 'Dream Pop',
    duration: '03:51',
    playCount: 128000,
    coverSymbol: '★',
    isEarlyAccess: true,
  },
  {
    id: 'track-midnight-drive',
    title: 'Midnight Drive',
    artistName: 'Nova Band',
    artistUserId: null,
    genre: 'Persian Pop',
    duration: '03:36',
    playCount: 316500,
    coverSymbol: '☾',
    isEarlyAccess: false,
  },
];