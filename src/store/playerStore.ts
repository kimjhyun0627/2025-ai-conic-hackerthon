import { create } from 'zustand';
import type { Track, AudioQueue, AudioParams, VisualizerType, MusicGenre } from '@/shared/types';
import { DEFAULT_AUDIO_PARAMS } from '@/shared/constants';

interface PlayerState {
	// Player State
	isPlaying: boolean;
	volume: number;
	currentTime: number;
	duration: number;
	isMuted: boolean;
	previousVolume: number; // 음소거 전 볼륨 값 저장

	// Queue
	queue: AudioQueue;
	// Computed
	getCurrentTrack: () => Track | null;

	// Audio Parameters
	audioParams: AudioParams;

	// Visualizer
	visualizerType: VisualizerType;

	// Selected Genre
	selectedGenre: MusicGenre | null;

	// Parameter Panel Orientation
	parameterPanelOrientation: 'horizontal' | 'vertical';

	// Actions
	setIsPlaying: (isPlaying: boolean) => void;
	setVolume: (volume: number) => void;
	setCurrentTime: (time: number) => void;
	setDuration: (duration: number) => void;
	toggleMute: () => void;

	// Queue Actions
	setCurrentTrack: (track: Track | null) => void;
	setNextTrack: (track: Track | null) => void;
	moveToNextTrack: () => void;
	moveToPrevTrack: () => void;
	resetQueue: () => void;

	// Audio Params Actions
	setAudioParams: (params: Partial<AudioParams>) => void;
	resetAudioParams: () => void;

	// Visualizer Actions
	setVisualizerType: (type: VisualizerType) => void;

	// Genre Selection
	setSelectedGenre: (genre: MusicGenre | null) => void;

	// Parameter Panel Orientation
	setParameterPanelOrientation: (orientation: 'horizontal' | 'vertical') => void;

	// Reset
	reset: () => void;
}

const initialState = {
	isPlaying: false,
	volume: 70,
	currentTime: 0,
	duration: 0,
	isMuted: false,
	previousVolume: 70,
	queue: {
		tracks: [],
		currentIndex: -1,
		next: null,
	},
	audioParams: DEFAULT_AUDIO_PARAMS,
	visualizerType: 'pulse' as VisualizerType,
	selectedGenre: null,
	parameterPanelOrientation: 'horizontal' as 'horizontal' | 'vertical',
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
	...initialState,

	// Computed
	getCurrentTrack: () => {
		const { queue } = get();
		if (queue.currentIndex >= 0 && queue.currentIndex < queue.tracks.length) {
			return queue.tracks[queue.currentIndex];
		}
		return null;
	},

	// Player Actions
	setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

	setVolume: (volume: number) => {
		const clampedVolume = Math.max(0, Math.min(100, volume));
		const { previousVolume } = get();
		// 볼륨이 0이 아닐 때만 이전 볼륨 값 업데이트
		const newPreviousVolume = clampedVolume > 0 ? clampedVolume : previousVolume;
		const newIsMuted = clampedVolume === 0;
		set({
			volume: clampedVolume,
			isMuted: newIsMuted,
			previousVolume: newPreviousVolume,
		});
	},

	setCurrentTime: (time: number) => set({ currentTime: time }),

	setDuration: (duration: number) => set({ duration }),

	toggleMute: () => {
		const { isMuted, volume, previousVolume } = get();
		if (isMuted) {
			// 음소거 해제: 이전 볼륨 값으로 복원
			const restoreVolume = previousVolume > 0 ? previousVolume : 70;
			set({ isMuted: false, volume: restoreVolume });
		} else {
			// 음소거: 현재 볼륨 값을 저장하고 0으로 설정
			set({ isMuted: true, previousVolume: volume > 0 ? volume : previousVolume, volume: 0 });
		}
	},

	// Queue Actions
	setCurrentTrack: (track: Track | null) =>
		set((state) => {
			if (!track) {
				return {
					queue: { ...state.queue, currentIndex: -1 },
					currentTime: 0,
					isPlaying: false, // track이 null인 경우만 false
				};
			}

			// tracks에 없으면 추가
			const trackIndex = state.queue.tracks.findIndex((t) => t.id === track.id);
			if (trackIndex === -1) {
				return {
					queue: {
						...state.queue,
						tracks: [...state.queue.tracks, track],
						currentIndex: state.queue.tracks.length,
					},
					currentTime: 0,
					isPlaying: true, // 트랙이 변경되면 항상 재생
				};
			}

			return {
				queue: { ...state.queue, currentIndex: trackIndex },
				currentTime: 0,
				isPlaying: true, // 트랙이 변경되면 항상 재생
			};
		}),

	setNextTrack: (track: Track | null) =>
		set((state) => ({
			queue: { ...state.queue, next: track },
		})),

	moveToNextTrack: () => {
		const { queue } = get();
		const { tracks, currentIndex, next } = queue;

		// next 트랙이 있으면 tracks에 추가하고 이동
		if (next) {
			const nextIndex = tracks.length; // next는 tracks 끝에 추가
			set((state) => ({
				queue: {
					...state.queue,
					tracks: [...state.queue.tracks, next],
					currentIndex: nextIndex,
					next: null,
				},
				currentTime: 0,
				isPlaying: true, // 항상 재생 상태로 진입
			}));
			return;
		}

		// next가 없고 다음 인덱스가 있으면 이동
		if (currentIndex >= 0 && currentIndex < tracks.length - 1) {
			set((state) => ({
				queue: {
					...state.queue,
					currentIndex: state.queue.currentIndex + 1,
				},
				currentTime: 0,
				isPlaying: true, // 항상 재생 상태로 진입
			}));
		}
	},

	moveToPrevTrack: () => {
		const { queue } = get();
		const { currentIndex } = queue;

		// 이전 인덱스가 있으면 이동
		if (currentIndex > 0) {
			set((state) => ({
				queue: {
					...state.queue,
					currentIndex: state.queue.currentIndex - 1,
				},
				currentTime: 0,
				isPlaying: true, // 항상 재생 상태로 진입
			}));
		}
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

	// Parameter Panel Orientation
	setParameterPanelOrientation: (orientation: 'horizontal' | 'vertical') => set({ parameterPanelOrientation: orientation }),

	// Reset
	resetQueue: () =>
		set({
			queue: {
				tracks: [],
				currentIndex: -1,
				next: null,
			},
		}),

	reset: () => set(initialState),
}));
