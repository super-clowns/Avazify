import { useState, useCallback } from 'react';
import type { Track } from '../types';
import { mockTracks } from './mockCatalog';

const STORAGE_KEY = 'avazify_artist_tracks';

function loadTracks(): Track[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTracks));
    return mockTracks;
  } catch {
    return mockTracks;
  }
}

function saveTracks(tracks: Track[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export function getTracksForArtist(artistId: string): Track[] {
  return loadTracks().filter((t) => t.artistId === artistId);
}

export function useTrackStore(artistId: string) {
  const [tracks, setTracks] = useState<Track[]>(() => getTracksForArtist(artistId));

  const addTrack = useCallback((track: Track) => {
    const updated = [track, ...loadTracks()];
    saveTracks(updated);
    setTracks(updated.filter((t) => t.artistId === artistId));
  }, [artistId]);

  const deleteTrack = useCallback((id: string) => {
    const updated = loadTracks().filter((t) => t.id !== id);
    saveTracks(updated);
    setTracks(updated.filter((t) => t.artistId === artistId));
  }, [artistId]);

  return { tracks, addTrack, deleteTrack };
}