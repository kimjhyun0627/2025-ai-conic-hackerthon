import { create } from 'zustand';
import type {
  Track,
  AudioQueue,
  AudioParams,
  VisualizerType,
  MusicGenre,
} from '../types';
import { DEFAULT_AUDIO_PARAMS } from '../constants/themes';

interface PlayerState {
  // Player State
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isMuted: boolean;

  // Queue
  queue: AudioQueue;

  // Audio Parameters
  audioParams: AudioParams;

  // Visualizer
  visualizerType: VisualizerType;

  // Selected Genre
  selectedGenre: MusicGenre | null;

  // Actions
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleMute: () => void;

  // Queue Actions
  setCurrentTrack: (track: Track | null) => void;
  setNextTrack: (track: Track | null) => void;
  addToHistory: (track: Track) => void;
  moveToNextTrack: () => void;

  // Audio Params Actions
  setAudioParams: (params: Partial<AudioParams>) => void;
  resetAudioParams: () => void;

  // Visualizer Actions
  setVisualizerType: (type: VisualizerType) => void;

  // Genre Selection
  setSelectedGenre: (genre: MusicGenre | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  volume: 70,
  currentTime: 0,
  duration: 0,
  isMuted: false,
  queue: {
    current: null,
    next: null,
    history: [],
  },
  audioParams: DEFAULT_AUDIO_PARAMS,
  visualizerType: 'pulse' as VisualizerType,
  selectedGenre: null,
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...initialState,

  // Player Actions
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  setVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
  },

  setCurrentTime: (time: number) => set({ currentTime: time }),

  setDuration: (duration: number) => set({ duration }),

  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      set({ isMuted: false, volume: volume || 70 });
    } else {
      set({ isMuted: true });
    }
  },

  // Queue Actions
  setCurrentTrack: (track: Track | null) =>
    set((state) => ({
      queue: { ...state.queue, current: track },
      currentTime: 0,
      isPlaying: false,
    })),

  setNextTrack: (track: Track | null) =>
    set((state) => ({
      queue: { ...state.queue, next: track },
    })),

  addToHistory: (track: Track) =>
    set((state) => ({
      queue: {
        ...state.queue,
        history: [...state.queue.history, track].slice(-10), // 최근 10개만 유지
      },
    })),

  moveToNextTrack: () => {
    const { queue, addToHistory } = get();
    if (queue.current) {
      addToHistory(queue.current);
    }
    set((state) => ({
      queue: {
        ...state.queue,
        current: state.queue.next,
        next: null,
      },
      currentTime: 0,
      isPlaying: !!state.queue.next,
    }));
  },

  // Audio Params Actions
  setAudioParams: (params: Partial<AudioParams>) =>
    set((state) => ({
      audioParams: { ...state.audioParams, ...params },
    })),

  resetAudioParams: () => set({ audioParams: DEFAULT_AUDIO_PARAMS }),

  // Visualizer Actions
  setVisualizerType: (type: VisualizerType) => set({ visualizerType: type }),

  // Genre Selection
  setSelectedGenre: (genre: MusicGenre | null) => set({ selectedGenre: genre }),

  // Reset
  reset: () => set(initialState),
}));
