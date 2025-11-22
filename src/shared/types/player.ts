// Audio Parameters for AI Generation
export interface AudioParams {
	energy: number; // 0-100
	bass: number; // 0-100
	tempo: number; // 60-200 BPM
}

// Track Status
export type TrackStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';

// Audio Track
export interface Track {
	id: string;
	title: string;
	genre: string;
	genreKo: string;
	audioUrl?: string;
	duration?: number; // in seconds
	status: TrackStatus;
	params: AudioParams;
	createdAt: Date;
}

// Audio Queue
export interface AudioQueue {
	tracks: Track[]; // 모든 재생된 트랙들
	currentIndex: number; // 현재 재생 중인 트랙의 인덱스 (-1이면 tracks가 비어있음)
	next: Track | null; // 다음에 재생할 트랙 (아직 tracks에 추가되지 않은 경우)
}

// Visualizer Type
export type VisualizerType = 'pulse' | 'club' | 'minimal';

// Player State
export interface PlayerState {
	isPlaying: boolean;
	volume: number; // 0-100
	currentTime: number; // in seconds
	duration: number; // in seconds
	visualizerType: VisualizerType;
}

// Music Generation Request
export interface MusicGenerationRequest {
	genre: string;
	params: AudioParams;
}

// Music Generation Response
export interface MusicGenerationResponse {
	trackId: string;
	audioUrl: string;
	duration: number;
}
