import { createContext, useContext, useReducer, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type { Track, RepeatMode, PlayerState } from '../features/music/types';

type AudioAction =
  | { type: 'SET_TRACK'; track: Track; queue: Track[]; index: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_PROGRESS'; progress: number }
  | { type: 'SET_DURATION'; duration: number }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'SET_REPEAT'; repeat: RepeatMode }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SET_QUEUE'; queue: Track[]; index: number };

const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,
  repeat: 'off',
  shuffle: false,
};

function audioReducer(state: PlayerState, action: AudioAction): PlayerState {
  switch (action.type) {
    case 'SET_TRACK':
      return { ...state, currentTrack: action.track, queue: action.queue, queueIndex: action.index, isPlaying: true, progress: 0 };
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'SET_PROGRESS':
      return { ...state, progress: action.progress };
    case 'SET_DURATION':
      return { ...state, duration: action.duration };
    case 'SET_VOLUME':
      return { ...state, volume: action.volume };
    case 'SET_REPEAT':
      return { ...state, repeat: action.repeat };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'NEXT':
      if (state.queue.length === 0) return state;
      if (state.repeat === 'one') return { ...state, progress: 0, isPlaying: true };
      if (state.repeat === 'off' && state.queueIndex >= state.queue.length - 1) return { ...state, isPlaying: false };
      const nextIdx = state.repeat === 'all' && state.queueIndex >= state.queue.length - 1 ? 0 : state.queueIndex + 1;
      return { ...state, currentTrack: state.queue[nextIdx], queueIndex: nextIdx, isPlaying: true, progress: 0 };
    case 'PREV':
      if (state.queue.length === 0) return state;
      const prevIdx = state.queueIndex <= 0 ? (state.repeat === 'all' ? state.queue.length - 1 : 0) : state.queueIndex - 1;
      return { ...state, currentTrack: state.queue[prevIdx], queueIndex: prevIdx, isPlaying: true, progress: 0 };
    case 'SET_QUEUE':
      return { ...state, queue: action.queue, queueIndex: action.index, currentTrack: action.queue[action.index] || state.currentTrack };
    default:
      return state;
  }
}

interface AudioContextValue {
  state: PlayerState;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  setRepeat: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;
    }
    const audio = audioRef.current;

    const onTimeUpdate = () => dispatch({ type: 'SET_PROGRESS', progress: audio.currentTime });
    const onDurationChange = () => dispatch({ type: 'SET_DURATION', duration: audio.duration });
    const onEnded = () => dispatch({ type: 'NEXT' });

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [state.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    audio.src = state.currentTrack.audioUrl;
    audio.load();
    if (state.isPlaying) audio.play().catch(() => {});
  }, [state.currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  const play = useCallback(() => dispatch({ type: 'PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const togglePlay = useCallback(() => dispatch({ type: state.isPlaying ? 'PAUSE' : 'PLAY' }), [state.isPlaying]);
  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const prev = useCallback(() => dispatch({ type: 'PREV' }), []);

  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    const q = queue || [track];
    const idx = q.findIndex(t => t.id === track.id);
    dispatch({ type: 'SET_TRACK', track, queue: q, index: idx >= 0 ? idx : 0 });
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      dispatch({ type: 'SET_PROGRESS', progress: time });
    }
  }, []);

  const setVolume = useCallback((vol: number) => dispatch({ type: 'SET_VOLUME', volume: vol }), []);
  const setRepeat = useCallback((mode: RepeatMode) => dispatch({ type: 'SET_REPEAT', repeat: mode }), []);
  const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), []);

  return (
    <AudioCtx.Provider value={{ state, play, pause, togglePlay, playTrack, next, prev, seek, setVolume, setRepeat, toggleShuffle }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
