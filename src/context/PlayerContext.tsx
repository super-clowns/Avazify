import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { cycleRepeat, getDailyStreamLimit, nextQueueIndex } from '../domain/phase1.js';
import type { RepeatMode, Track } from '../types';
import { useAppState } from './AppStateContext';
import { useToast } from './ToastContext';

interface PlayerContextValue {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: RepeatMode;
  shuffle: boolean;
  playTrack: (trackId: string, queueIds?: string[]) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (value: number) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { data, currentUser, recordStream } = useAppState();
  const { pushToast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.75);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [shuffle, setShuffle] = useState(false);

  const queue = useMemo(
    () => queueIds.map((id) => data.tracks.find((track) => track.id === id)).filter((track): track is Track => Boolean(track)),
    [data.tracks, queueIds],
  );

  const currentTrack = queue[currentIndex] ?? null;

  const canStartStream = useCallback(() => {
    if (!currentUser) return false;
    const limit = getDailyStreamLimit(currentUser.subscription);
    if (limit !== null && currentUser.dailyStreams >= limit) {
      pushToast('سقف ۶۰ استریم روزانه اشتراک پایه پر شده است. برای ادامه، اشتراک را ارتقا دهید.', 'error');
      return false;
    }
    return true;
  }, [currentUser, pushToast]);

  const playTrack = useCallback((trackId: string, providedQueue?: string[]) => {
    const target = data.tracks.find((track) => track.id === trackId);
    if (!target) return;
    const canAccessTarget = !target.earlyAccess || currentUser?.subscription === 'gold' || target.artistId === currentUser?.id;
    if (!canAccessTarget) {
      pushToast('این اثر تا زمان انتشار عمومی فقط برای کاربران طلایی در دسترس است.', 'error');
      return;
    }
    if (!canStartStream()) return;
    const allowedTrackIds = new Set(data.tracks.filter((track) => !track.earlyAccess || currentUser?.subscription === 'gold' || track.artistId === currentUser?.id).map((track) => track.id));
    const source = (providedQueue?.length ? providedQueue : data.tracks.map((track) => track.id)).filter((id) => allowedTrackIds.has(id));
    const normalizedQueue = source.includes(trackId) ? source : [trackId, ...source];
    const index = normalizedQueue.indexOf(trackId);
    setQueueIds(normalizedQueue);
    setCurrentIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
    recordStream(trackId);
  }, [canStartStream, currentUser, data.tracks, pushToast, recordStream]);

  const move = useCallback((direction: 1 | -1) => {
    if (queue.length === 0) return;
    let index: number;
    if (shuffle && queue.length > 1) {
      do {
        index = Math.floor(Math.random() * queue.length);
      } while (index === currentIndex);
    } else {
      index = nextQueueIndex(currentIndex, queue.length, repeat, direction);
    }
    if (index < 0) {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }
    if (!canStartStream()) return;
    setCurrentIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
    const track = queue[index];
    if (track) recordStream(track.id);
  }, [canStartStream, currentIndex, queue, recordStream, repeat, shuffle]);

  const next = useCallback(() => move(1), [move]);
  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    move(-1);
  }, [move]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((value) => !value);
  }, [currentTrack]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || time));
    setCurrentTime(audio.currentTime);
  }, []);

  const setVolume = useCallback((value: number) => {
    const safe = Math.max(0, Math.min(1, value));
    setVolumeState(safe);
    if (audioRef.current) audioRef.current.volume = safe;
  }, []);

  const cycleRepeatMode = useCallback(() => setRepeat((mode) => cycleRepeat(mode)), []);
  const toggleShuffle = useCallback(() => setShuffle((value) => !value), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (loadedTrackIdRef.current !== currentTrack.id) {
      loadedTrackIdRef.current = currentTrack.id;
      audio.src = currentTrack.audioUrl;
      audio.currentTime = 0;
      audio.load();
    }
    audio.volume = volume;
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, volume]);

  const handleEnded = useCallback(() => {
    const audio = audioRef.current;
    if (repeat === 'one' && currentTrack && audio) {
      if (!canStartStream()) {
        setIsPlaying(false);
        return;
      }
      audio.currentTime = 0;
      setCurrentTime(0);
      recordStream(currentTrack.id);
      void audio.play().catch(() => setIsPlaying(false));
      return;
    }
    next();
  }, [canStartStream, currentTrack, next, recordStream, repeat]);

  const value = useMemo<PlayerContextValue>(() => ({
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration: duration || currentTrack?.duration || 0,
    volume,
    repeat,
    shuffle,
    playTrack,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    cycleRepeatMode,
    toggleShuffle,
  }), [
    currentIndex,
    currentTime,
    currentTrack,
    cycleRepeatMode,
    duration,
    isPlaying,
    next,
    playTrack,
    previous,
    queue,
    repeat,
    seek,
    setVolume,
    shuffle,
    togglePlay,
    toggleShuffle,
    volume,
  ]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || currentTrack?.duration || 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
  return context;
}
