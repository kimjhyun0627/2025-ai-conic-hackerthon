import { useEffect, useRef, useState } from 'react';
import { getSampleAudioUrl as getSampleAudioUrlUtil, getSampleAudioUrlByCategory, getSampleAudioUrlByGenre } from '../constants/sampleAudio';
import type { ThemeCategory, MusicGenre } from '@/shared/types';

// getSampleAudioUrl을 외부에서도 사용할 수 있도록 export
export { getSampleAudioUrlUtil as getSampleAudioUrl };

interface UseSampleAudioOptions {
	/** 자동 재생 여부 (기본값: false) */
	autoPlay?: boolean;
	/** 볼륨 (0-1, 기본값: 0.5) */
	volume?: number;
	/** 반복 재생 여부 (기본값: false) */
	loop?: boolean;
}

interface UseSampleAudioReturn {
	/** 현재 재생 중인지 여부 */
	isPlaying: boolean;
	/** 오디오 로딩 중인지 여부 */
	isLoading: boolean;
	/** 오디오 에러 발생 여부 */
	hasError: boolean;
	/** 재생 시작 */
	play: () => Promise<void>;
	/** 일시정지 */
	pause: () => void;
	/** 정지 (재생 위치를 처음으로) */
	stop: () => void;
	/** 오디오 엘리먼트 참조 */
	audioRef: React.RefObject<HTMLAudioElement | null>;
}

/**
 * 샘플 오디오 재생을 위한 커스텀 훅
 *
 * @param audioUrl - 오디오 URL (null이면 재생 안 함)
 * @param options - 옵션
 */
export const useSampleAudio = (audioUrl: string | null, options: UseSampleAudioOptions = {}): UseSampleAudioReturn => {
	const { autoPlay = false, volume = 0.5, loop = false } = options;
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);

	// 오디오 엘리먼트 생성 및 설정
	useEffect(() => {
		if (!audioUrl) {
			// URL이 없으면 기존 오디오 정리
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = '';
				audioRef.current.load();
			}
			setIsPlaying(false);
			setIsLoading(false);
			setHasError(false);
			return;
		}

		// 오디오 엘리먼트가 없으면 생성
		if (!audioRef.current) {
			audioRef.current = new Audio();
			audioRef.current.preload = 'auto';
			audioRef.current.crossOrigin = 'anonymous';
		}

		const audio = audioRef.current;

		// 이벤트 리스너 설정
		const handleLoadStart = () => {
			setIsLoading(true);
			setHasError(false);
		};

		const handleCanPlay = () => {
			setIsLoading(false);
		};

		const handlePlay = () => {
			setIsPlaying(true);
		};

		const handlePause = () => {
			setIsPlaying(false);
		};

		const handleEnded = () => {
			setIsPlaying(false);
		};

		const handleError = () => {
			setIsLoading(false);
			setIsPlaying(false);
			setHasError(true);
			console.error('[useSampleAudio] 오디오 로드 실패:', audioUrl);
		};

		audio.addEventListener('loadstart', handleLoadStart);
		audio.addEventListener('canplay', handleCanPlay);
		audio.addEventListener('play', handlePlay);
		audio.addEventListener('pause', handlePause);
		audio.addEventListener('ended', handleEnded);
		audio.addEventListener('error', handleError);

		// 오디오 설정
		audio.src = audioUrl;
		audio.volume = volume;
		audio.loop = loop;

		// 자동 재생
		if (autoPlay) {
			audio.play().catch((error) => {
				console.error('[useSampleAudio] 자동 재생 실패:', error);
				setHasError(true);
			});
		}

		// 정리 함수
		return () => {
			audio.removeEventListener('loadstart', handleLoadStart);
			audio.removeEventListener('canplay', handleCanPlay);
			audio.removeEventListener('play', handlePlay);
			audio.removeEventListener('pause', handlePause);
			audio.removeEventListener('ended', handleEnded);
			audio.removeEventListener('error', handleError);
		};
	}, [audioUrl, autoPlay, volume, loop]);

	// 컴포넌트 언마운트 시 정리
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = '';
				audioRef.current.load();
			}
		};
	}, []);

	const play = async () => {
		if (!audioRef.current || !audioUrl) {
			return;
		}

		try {
			await audioRef.current.play();
		} catch (error) {
			console.error('[useSampleAudio] 재생 실패:', error);
			setHasError(true);
		}
	};

	const pause = () => {
		if (audioRef.current) {
			audioRef.current.pause();
		}
	};

	const stop = () => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		setIsPlaying(false);
	};

	return {
		isPlaying,
		isLoading,
		hasError,
		play,
		pause,
		stop,
		audioRef,
	};
};

/**
 * 테마 카테고리로 샘플 오디오 재생 훅
 */
export const useCategorySampleAudio = (category: ThemeCategory | null, options: UseSampleAudioOptions = {}) => {
	const audioUrl = category ? getSampleAudioUrlByCategory(category) : null;
	return useSampleAudio(audioUrl, options);
};

/**
 * 장르로 샘플 오디오 재생 훅
 */
export const useGenreSampleAudio = (genre: MusicGenre | null, options: UseSampleAudioOptions = {}) => {
	const audioUrl = genre ? getSampleAudioUrlByGenre(genre) : null;
	return useSampleAudio(audioUrl, options);
};
