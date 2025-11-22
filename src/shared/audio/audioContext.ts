import { getSharedAudioElement } from './audioElement';

/**
 * 전역 AudioContext 인스턴스
 * 컴포넌트 마운트/언마운트와 관계없이 유지
 */
let audioContextInstance: AudioContext | null = null;

/**
 * 전역 AnalyserNode 인스턴스
 */
let analyserInstance: AnalyserNode | null = null;

/**
 * 전역 MediaElementAudioSourceNode 인스턴스
 */
let audioSourceInstance: MediaElementAudioSourceNode | null = null;

/**
 * 전역 DataArray 인스턴스
 */
let dataArrayInstance: Uint8Array | null = null;

/**
 * 전역 AudioContext를 가져오거나 생성
 */
export const getSharedAudioContext = (): AudioContext | null => {
	// 이미 생성되어 있고 closed 상태가 아니면 재사용
	if (audioContextInstance && audioContextInstance.state !== 'closed') {
		return audioContextInstance;
	}

	// 새로 생성
	const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
	audioContextInstance = new AudioContextClass();
	return audioContextInstance;
};

/**
 * 전역 AnalyserNode를 가져오거나 생성
 */
export const getSharedAnalyser = (): AnalyserNode | null => {
	const audioContext = getSharedAudioContext();
	if (!audioContext) return null;

	// 이미 생성되어 있으면 재사용
	if (analyserInstance) {
		return analyserInstance;
	}

	// 새로 생성
	analyserInstance = audioContext.createAnalyser();
	analyserInstance.fftSize = 2048;
	analyserInstance.smoothingTimeConstant = 0.1; // 0.3 -> 0.1 (더 즉각 반응, 지연 최소화)
	dataArrayInstance = new Uint8Array(analyserInstance.frequencyBinCount);
	return analyserInstance;
};

/**
 * 전역 MediaElementAudioSourceNode를 가져오거나 생성
 */
export const getSharedAudioSource = (): MediaElementAudioSourceNode | null => {
	const audioContext = getSharedAudioContext();
	const analyser = getSharedAnalyser();
	if (!audioContext || !analyser) return null;

	// 이미 생성되어 있으면 재사용
	if (audioSourceInstance) {
		return audioSourceInstance;
	}

	const audio = getSharedAudioElement();
	if (!audio) return null;

	// source 생성 시도
	try {
		// AudioContext가 suspended 상태이면 resume
		if (audioContext.state === 'suspended') {
			audioContext.resume().catch((error) => {
				console.error('AudioContext resume failed:', error);
			});
		}

		audioSourceInstance = audioContext.createMediaElementSource(audio);
		audioSourceInstance.connect(analyser);
		audioSourceInstance.connect(audioContext.destination);
		return audioSourceInstance;
	} catch (error) {
		// 이미 연결된 경우 - audio element가 이미 다른 AudioContext의 source에 연결되어 있음
		if (error instanceof Error && error.name === 'InvalidStateError') {
			console.warn('[getSharedAudioSource] audio element가 이미 다른 source에 연결됨');
		} else {
			console.error('[getSharedAudioSource] Failed to create audio source:', error);
		}
		return null;
	}
};

/**
 * 전역 DataArray를 가져옴
 */
export const getSharedDataArray = (): Uint8Array | null => {
	// AnalyserNode를 생성하면 dataArray도 생성됨
	if (!dataArrayInstance) {
		getSharedAnalyser();
	}
	return dataArrayInstance;
};

/**
 * AudioContext를 resume
 */
export const resumeAudioContext = async (): Promise<void> => {
	const audioContext = getSharedAudioContext();
	if (!audioContext) return;

	if (audioContext.state === 'suspended') {
		try {
			await audioContext.resume();
		} catch (error) {
			console.error('AudioContext resume failed:', error);
		}
	}
};
