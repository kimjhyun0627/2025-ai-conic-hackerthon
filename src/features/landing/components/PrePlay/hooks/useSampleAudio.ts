import { useEffect, useRef, useState, useCallback } from 'react';
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
	/** Fade-in 효과 사용 여부 (기본값: false) */
	fadeIn?: boolean;
	/** Fade-in 지속 시간 (초, 기본값: 2) */
	fadeInDuration?: number;
	/** Fade-out 효과 사용 여부 (기본값: false) */
	fadeOut?: boolean;
	/** Fade-out 지속 시간 (초, 기본값: 2) */
	fadeOutDuration?: number;
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
	const { autoPlay = false, volume = 0.5, loop = false, fadeIn = false, fadeInDuration = 2, fadeOut = false, fadeOutDuration = 2 } = options;
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const fadeIntervalRef = useRef<number | null>(null);
	const fadeOutStartedRef = useRef(false);
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
			// loop가 true이고 fade-out이 적용된 후 다시 재생될 때 볼륨 복원
			if (loop && fadeOut && fadeOutStartedRef.current) {
				// fade-out이 적용된 상태에서 다시 재생되면 볼륨을 원래대로 복원
				// (fade-in이 적용되므로 볼륨은 fade-in에서 처리됨)
				fadeOutStartedRef.current = false;
			}
		};

		const handlePause = () => {
			// Fade-in/Fade-out 애니메이션 정리
			if (fadeIntervalRef.current !== null) {
				window.cancelAnimationFrame(fadeIntervalRef.current);
				fadeIntervalRef.current = null;
			}
			fadeOutStartedRef.current = false;
			setIsPlaying(false);
		};

		const handleEnded = () => {
			setIsPlaying(false);
			// loop가 true일 때는 fade-out 상태를 리셋하여 다음 루프에서 다시 fade-out 가능하도록
			if (loop) {
				fadeOutStartedRef.current = false;
				// 볼륨도 원래대로 복원 (다음 루프에서 fade-in이 적용되므로)
				if (!fadeIn) {
					audio.volume = volume;
				}
			} else {
				fadeOutStartedRef.current = false;
			}
		};

		const handleError = () => {
			setIsLoading(false);
			setIsPlaying(false);
			setHasError(true);
			fadeOutStartedRef.current = false;
			console.error('[useSampleAudio] 오디오 로드 실패:', audioUrl);
		};

		// Fade-out 처리 (fadeOut이 true인 경우)
		const handleTimeUpdate = () => {
			if (!fadeOut || fadeOutStartedRef.current || !audio.duration || isNaN(audio.duration)) {
				return;
			}

			const remainingTime = audio.duration - audio.currentTime;
			if (remainingTime <= fadeOutDuration && remainingTime > 0) {
				fadeOutStartedRef.current = true;

				// Fade-out 애니메이션
				const startTime = Date.now();
				const startVolume = audio.volume;

				const fadeStep = () => {
					const elapsed = (Date.now() - startTime) / 1000; // 초 단위
					const progress = Math.min(elapsed / fadeOutDuration, 1);

					// 선형 fade-out
					audio.volume = startVolume * (1 - progress);

					if (progress < 1 && !audio.paused) {
						fadeIntervalRef.current = window.requestAnimationFrame(fadeStep);
					} else {
						audio.volume = 0;
						fadeIntervalRef.current = null;
					}
				};

				fadeIntervalRef.current = window.requestAnimationFrame(fadeStep);
			}
		};

		audio.addEventListener('loadstart', handleLoadStart);
		audio.addEventListener('canplay', handleCanPlay);
		audio.addEventListener('play', handlePlay);
		audio.addEventListener('pause', handlePause);
		audio.addEventListener('ended', handleEnded);
		audio.addEventListener('error', handleError);
		if (fadeOut) {
			audio.addEventListener('timeupdate', handleTimeUpdate);
		}

		// 오디오 설정
		// 기존 재생 중지 및 리셋
		audio.pause();
		audio.currentTime = 0;
		fadeOutStartedRef.current = false;
		// audioUrl이 변경될 때 isPlaying 상태를 명시적으로 false로 설정
		setIsPlaying(false);

		audio.src = audioUrl;
		audio.loop = loop;
		// fadeIn이 활성화된 경우 볼륨은 play() 함수에서 설정
		if (!fadeIn) {
			audio.volume = volume;
		}

		// 새 소스 로드
		audio.load();

		// 정리 함수
		return () => {
			audio.removeEventListener('loadstart', handleLoadStart);
			audio.removeEventListener('canplay', handleCanPlay);
			audio.removeEventListener('play', handlePlay);
			audio.removeEventListener('pause', handlePause);
			audio.removeEventListener('ended', handleEnded);
			audio.removeEventListener('error', handleError);
			if (fadeOut) {
				audio.removeEventListener('timeupdate', handleTimeUpdate);
			}
			fadeOutStartedRef.current = false;
		};
	}, [audioUrl, volume, loop, fadeIn, fadeOut, fadeOutDuration]);

	// 컴포넌트 언마운트 시 정리
	useEffect(() => {
		return () => {
			// Fade-in 애니메이션 정리
			if (fadeIntervalRef.current !== null) {
				window.cancelAnimationFrame(fadeIntervalRef.current);
				fadeIntervalRef.current = null;
			}

			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = '';
				audioRef.current.load();
			}
		};
	}, []);

	const play = useCallback(async () => {
		if (!audioRef.current || !audioUrl) {
			return;
		}

		try {
			const audio = audioRef.current;

			// Fade-in 효과가 활성화된 경우
			if (fadeIn) {
				// 볼륨을 0으로 시작
				audio.volume = 0;
				await audio.play();
				// play() 호출 후 재생 상태를 명시적으로 확인
				if (!audio.paused) {
					setIsPlaying(true);
				}

				// Fade-in 애니메이션
				const startTime = Date.now();
				const startVolume = 0;
				const targetVolume = volume;

				const fadeStep = () => {
					const elapsed = (Date.now() - startTime) / 1000; // 초 단위
					const progress = Math.min(elapsed / fadeInDuration, 1);

					// 선형 fade-in
					audio.volume = startVolume + (targetVolume - startVolume) * progress;

					if (progress < 1) {
						fadeIntervalRef.current = window.requestAnimationFrame(fadeStep);
					} else {
						audio.volume = targetVolume;
						fadeIntervalRef.current = null;
					}
				};

				fadeIntervalRef.current = window.requestAnimationFrame(fadeStep);
			} else {
				// 일반 재생
				audio.volume = volume;
				await audio.play();
				// play() 호출 후 재생 상태를 명시적으로 확인
				if (!audio.paused) {
					setIsPlaying(true);
				}
			}
		} catch (error) {
			// AbortError는 정상적인 경우 (pause로 인한 중단)이므로 무시
			if (error instanceof Error && error.name !== 'AbortError') {
				console.error('[useSampleAudio] 재생 실패:', error);
				setHasError(true);
			}
		}
	}, [audioUrl, fadeIn, fadeInDuration, volume]);

	// autoPlay가 true일 때 자동 재생 (fadeIn 옵션도 함께 적용)
	useEffect(() => {
		if (!autoPlay || !audioUrl || !audioRef.current) return;

		const audio = audioRef.current;

		// 오디오가 로드될 때까지 기다린 후 재생
		const handleCanPlayAndPlay = async () => {
			try {
				await play();
				// play() 호출 후 재생 상태를 명시적으로 확인
				// play 이벤트가 발생하지 않을 수 있으므로 직접 확인
				if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !audio.paused) {
					setIsPlaying(true);
				}
			} catch (error) {
				// AbortError는 정상적인 경우이므로 무시
				if (error instanceof Error && error.name !== 'AbortError') {
					console.error('[useSampleAudio] 자동 재생 실패:', error);
					setHasError(true);
				}
			}
		};

		// 이미 재생 가능한 상태면 바로 재생
		if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
			handleCanPlayAndPlay();
		} else {
			// 로드 완료를 기다림
			audio.addEventListener('canplay', handleCanPlayAndPlay, { once: true });
		}

		return () => {
			audio.removeEventListener('canplay', handleCanPlayAndPlay);
		};
	}, [autoPlay, audioUrl, play]);

	const pause = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
		}
	}, []);

	const stop = useCallback(() => {
		// Fade-in/Fade-out 애니메이션 정리
		if (fadeIntervalRef.current !== null) {
			window.cancelAnimationFrame(fadeIntervalRef.current);
			fadeIntervalRef.current = null;
		}
		fadeOutStartedRef.current = false;

		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		// 상태 업데이트는 pause 이벤트에서 처리되므로 여기서는 하지 않음
	}, []);

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
