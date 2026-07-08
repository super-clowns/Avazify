import { useState, useCallback } from 'react';
import type { Playlist, Track } from '../types';

const STORAGE_KEY = 'avazify_playlists';

function loadPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
}

export function usePlaylistStore() {
  const [playlists, setPlaylists] = useState<Playlist[]>(loadPlaylists);

  const refresh = useCallback(() => {
    setPlaylists(loadPlaylists());
  }, []);

  const createPlaylist = useCallback((name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...loadPlaylists(), newPlaylist];
    savePlaylists(updated);
    setPlaylists(updated);
    return newPlaylist;
  }, []);

  const renamePlaylist = useCallback((id: string, name: string) => {
    const updated = loadPlaylists().map(p => p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p);
    savePlaylists(updated);
    setPlaylists(updated);
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    const updated = loadPlaylists().filter(p => p.id !== id);
    savePlaylists(updated);
    setPlaylists(updated);
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    const updated = loadPlaylists().map(p => {
      if (p.id !== playlistId) return p;
      if (p.tracks.some(t => t.id === track.id)) return p;
      return { ...p, tracks: [...p.tracks, track], updatedAt: new Date().toISOString() };
    });
    savePlaylists(updated);
    setPlaylists(updated);
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    const updated = loadPlaylists().map(p => {
      if (p.id !== playlistId) return p;
      return { ...p, tracks: p.tracks.filter(t => t.id !== trackId), updatedAt: new Date().toISOString() };
    });
    savePlaylists(updated);
    setPlaylists(updated);
  }, []);

  return { playlists, createPlaylist, renamePlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist, refresh };
}
