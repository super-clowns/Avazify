export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album?: string;
  albumId?: string;
  cover: string;
  duration: number;
  genre: string;
  lyrics?: string;
  plays: number;
  listeners: number;
  audioUrl: string;
  year: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  cover: string;
  year: string;
  genre: string;
  tracks: Track[];
  plays: number;
  listeners: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type ShuffleMode = boolean;

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeat: RepeatMode;
  shuffle: ShuffleMode;
}
