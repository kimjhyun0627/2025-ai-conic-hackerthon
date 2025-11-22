import { useEffect, useRef, useState } from 'react';
import { getSharedAudioElement, getSharedAnalyser, getSharedAudioSource, getSharedDataArray, resumeAudioContext } from '@/shared/audio';
import { usePlayerStore } from '@/store/playerStore';

interface AudioAnalysisResult {
	intensity: number; // 0-1 범위의 RMS 기반 오디오 강도
	beatLevel: number; // 0-1 범위의 저음대역 비트 강도
	lowBandEnergy: number; // 저음대역 (60-200Hz) 에너지
	midBandEnergy: number; // 중음대역 (200-2000Hz) 에너지
	highBandEnergy: number; // 고음대역 (2kHz-8kHz) 에너지
	peak: number; // Time domain peak (0-1)
	rms: number; // Time domain RMS (0-1)
	smoothLowEnergy: number; // 스무딩된 저음대역 에너지
	timestamp: number; // 분석 시각 (ms)
}

/**
 * Web Audio API를 사용하여 오디오를 분석하고 비트를 감지하는 훅
 *
 * 최적화 전략:
 * - 단일 루프로 피크와 RMS 동시 계산 (성능 향상)
 * - 불필요한 재확인 제거 (클로저에 저장된 값 사용)
 * - 스무딩 최소화로 즉각 반응
 * - 단순화된 비트 감지 로직
 */
export const useAudioAnalyzer = (enabled: boolean = true): AudioAnalysisResult => {
	const [analysis, setAnalysis] = useState<AudioAnalysisResult>({
		intensity: 0,
		beatLevel: 0,
		lowBandEnergy: 0,
		midBandEnergy: 0,
		highBandEnergy: 0,
		peak: 0,
		rms: 0,
		smoothLowEnergy: 0,
		timestamp: 0,
	});

	const animationFrameRef = useRef<number | null>(null);
	const lastTrackIdRef = useRef<string | null>(null);
	const lastLowEnergyRef = useRef<number>(0); // 저음역대 에너지 스무딩용

	const isPlaying = usePlayerStore((state) => state.isPlaying);
	const currentTrack = usePlayerStore((state) => state.getCurrentTrack());

	useEffect(() => {
		if (!enabled || !isPlaying) {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			if (!isPlaying) {
				setAnalysis({
					intensity: 0,
					beatLevel: 0,
					lowBandEnergy: 0,
					midBandEnergy: 0,
					highBandEnergy: 0,
					peak: 0,
					rms: 0,
					smoothLowEnergy: 0,
					timestamp: 0,
				});
			}
			return;
		}

		const audio = getSharedAudioElement();
		if (!audio || !audio.src) {
			console.log('[useAudioAnalyzer] 오디오 준비 안됨:', {
				hasAudio: !!audio,
				hasSrc: !!audio?.src,
			});
			return;
		}

		// 재생 시작을 빠르게 감지하는 함수 (이벤트 + 짧은 폴링)
		const waitForPlayback = (): Promise<void> => {
			return new Promise((resolve) => {
				// 이미 재생 중이면 즉시 resolve
				if (!audio.paused && audio.currentTime > 0 && audio.readyState >= 2) {
					resolve();
					return;
				}

				let resolved = false;
				const startTime = Date.now();
				const maxWait = 10000; // 최대 10초 대기

				const cleanup = () => {
					audio.removeEventListener('playing', onPlaying);
					audio.removeEventListener('canplay', onCanPlay);
					if (pollInterval) clearInterval(pollInterval);
					if (timeout) clearTimeout(timeout);
				};

				// 빠른 폴링으로 재생 상태 확인 (50ms마다)
				const pollInterval = setInterval(() => {
					if (!resolved && !audio.paused && audio.currentTime > 0 && audio.readyState >= 2) {
						resolved = true;
						cleanup();
						console.log('[useAudioAnalyzer] 폴링으로 재생 감지');
						resolve();
					}
				}, 50);

				// playing 이벤트 핸들러 (즉시 감지)
				const onPlaying = () => {
					if (!resolved) {
						resolved = true;
						cleanup();
						console.log('[useAudioAnalyzer] playing 이벤트로 재생 감지');
						resolve();
					}
				};

				// canplay 이벤트 핸들러 (오디오 준비 완료 시)
				const onCanPlay = () => {
					// canplay 후 짧은 폴링으로 재생 시작 확인
					setTimeout(() => {
						if (!resolved && !audio.paused && audio.currentTime > 0) {
							resolved = true;
							cleanup();
							console.log('[useAudioAnalyzer] canplay 후 재생 확인');
							resolve();
						}
					}, 50);
				};

				// 이벤트 리스너 등록
				audio.addEventListener('playing', onPlaying, { once: true });
				audio.addEventListener('canplay', onCanPlay, { once: true });

				// 타임아웃: 최대 1초 대기
				const timeout = setTimeout(() => {
					if (!resolved) {
						resolved = true;
						cleanup();
						const waited = Date.now() - startTime;
						console.log(`[useAudioAnalyzer] 재생 대기 타임아웃 (${waited}ms), 분석 시작 시도`);
						resolve();
					}
				}, maxWait);
			});
		};

		// 재생 시작 대기 후 분석 시작
		waitForPlayback().then(() => {
			// 재생이 시작된 후 재검증
			if (!isPlaying || !audio || !audio.src || audio.paused) {
				return;
			}

			// 전역 인스턴스 한 번만 가져오기 (클로저에 저장)
			// source가 없으면 audio가 analyser에 연결되지 않아 데이터가 들어오지 않음
			const source = getSharedAudioSource();
			const analyser = getSharedAnalyser();
			const dataArray = getSharedDataArray();

			if (!source || !analyser || !dataArray) {
				console.log('[useAudioAnalyzer] 오디오 소스/분석기 준비 안됨:', {
					hasSource: !!source,
					hasAnalyser: !!analyser,
					hasDataArray: !!dataArray,
				});
				return;
			}

			// Frequency domain data를 위한 배열 (FFT 결과)
			const frequencyDataArray = new Uint8Array(analyser.frequencyBinCount);

			// 트랙 변경 시 비트 감지 변수 초기화 및 분석 재시작
			const currentTrackId = currentTrack?.id || null;
			const isTrackChanged = currentTrackId !== lastTrackIdRef.current;

			if (isTrackChanged) {
				// 기존 분석 정리
				if (animationFrameRef.current) {
					cancelAnimationFrame(animationFrameRef.current);
					animationFrameRef.current = null;
				}

				// 트랙 변경 시 변수 초기화
				lastTrackIdRef.current = currentTrackId;
				lastLowEnergyRef.current = 0;

				// 분석 초기화
				setAnalysis({
					intensity: 0,
					beatLevel: 0,
					lowBandEnergy: 0,
					midBandEnergy: 0,
					highBandEnergy: 0,
					peak: 0,
					rms: 0,
					smoothLowEnergy: 0,
					timestamp: 0,
				});
				console.log('[useAudioAnalyzer] 트랙 변경 감지, 분석 초기화:', currentTrackId);
			}

			// AudioContext resume (비동기 처리, 에러 무시)
			resumeAudioContext().catch(() => {});

			// 중복 시작 방지 (트랙 변경 시에는 이미 정리했으므로 시작)
			if (animationFrameRef.current && !isTrackChanged) {
				return;
			}

			// 분석 변수 초기화
			let lastIntensity = 0;
			const arrayLength = dataArray.length;
			const invArrayLength = 1 / arrayLength;
			const frequencyBinCount = analyser.frequencyBinCount;

			// 주파수 대역 정의 (Hz 기준)
			// sampleRate는 일반적으로 44100Hz, fftSize는 2048
			// 각 bin = sampleRate / fftSize = 약 21.5Hz
			// 저음/중음/고음대역 (Hz)
			const halfSampleRate = analyser.context.sampleRate / 2;
			const lowFreqStart = Math.floor((60 / halfSampleRate) * frequencyBinCount);
			const lowFreqEnd = Math.floor((200 / halfSampleRate) * frequencyBinCount);
			const midFreqStart = Math.floor((200 / halfSampleRate) * frequencyBinCount);
			const midFreqEnd = Math.floor((2000 / halfSampleRate) * frequencyBinCount);
			const highFreqStart = Math.floor((2000 / halfSampleRate) * frequencyBinCount);
			const highFreqEnd = Math.floor((8000 / halfSampleRate) * frequencyBinCount);

			// 분석 함수 (Date.now() 기반으로 싱크 유지)
			const analyze = () => {
				// 최소한의 검증만 수행
				if (!isPlaying || !audio || audio.paused || !audio.src) {
					animationFrameRef.current = null;
					setAnalysis({
						intensity: 0,
						beatLevel: 0,
						lowBandEnergy: 0,
						midBandEnergy: 0,
						highBandEnergy: 0,
						peak: 0,
						rms: 0,
						smoothLowEnergy: 0,
						timestamp: 0,
					});
					return;
				}

				// Time domain data 가져오기 (파형 데이터)
				analyser.getByteTimeDomainData(dataArray as Uint8Array<ArrayBuffer>);

				// Frequency domain data 가져오기 (FFT 결과 - 주파수 스펙트럼)
				analyser.getByteFrequencyData(frequencyDataArray);

				// ========== Time Domain 분석 (RMS, 피크) ==========
				let sumSquares = 0;
				let max = 0;
				let min = 255;

				for (let i = 0; i < arrayLength; i++) {
					const value = dataArray[i];
					if (value > max) max = value;
					if (value < min) min = value;

					const normalized = (value - 128) * 0.0078125; // 128로 나누기 (1/128)
					sumSquares += normalized * normalized;
				}

				// RMS 기반 intensity (0-1 범위)
				const rms = Math.sqrt(sumSquares * invArrayLength);
				const rawIntensity = Math.min(rms * 4.0, 1.0); // 민감도 조정
				const peak = (max - min) * 0.00392156862745098; // 255로 나누기

				// ========== Frequency Domain 분석 (주파수 대역별 에너지) ==========
				// 저음대역 에너지 (60-200Hz: 킥 드럼, 베이스) - beat 감지용
				let lowEnergy = 0;
				let lowEnergyPeak = 0;
				for (let i = lowFreqStart; i < lowFreqEnd; i++) {
					const value = frequencyDataArray[i];
					lowEnergy += value;
					if (value > lowEnergyPeak) {
						lowEnergyPeak = value;
					}
				}
				lowEnergy = lowEnergy / (lowFreqEnd - lowFreqStart) / 255; // 0-1 정규화
				lowEnergyPeak = lowEnergyPeak / 255; // 0-1 정규화

				// 중/고음대역 에너지
				let midEnergy = 0;
				let highEnergy = 0;
				for (let i = midFreqStart; i < midFreqEnd; i++) {
					midEnergy += frequencyDataArray[i];
				}
				for (let i = highFreqStart; i < Math.min(highFreqEnd, frequencyBinCount); i++) {
					highEnergy += frequencyDataArray[i];
				}
				midEnergy = midFreqEnd > midFreqStart ? midEnergy / (midFreqEnd - midFreqStart) / 255 : 0;
				highEnergy = highFreqEnd > highFreqStart ? highEnergy / (highFreqEnd - highFreqStart) / 255 : 0;

				// 저음대역 에너지 기반 intensity 계산 (평균 + 피크)
				const rawLowEnergy = lowEnergy * 0.75 + lowEnergyPeak * 0.25;

				// 스무딩 적용
				const smoothedLowEnergy = rawLowEnergy * 0.95 + lastLowEnergyRef.current * 0.05;
				lastLowEnergyRef.current = smoothedLowEnergy;

				// beatLevel: 저음대역 에너지를 0-1 범위로 정규화
				const beatThreshold = 0.1; // 저음대역 에너지 임계값
				const beatLevel = Math.min(Math.max((smoothedLowEnergy - beatThreshold) / Math.max(1 - beatThreshold, 0.0001), 0), 1);

				// 최소 스무딩 (즉각 반응) - 스무딩 비율 증가로 지연 최소화
				const smoothedIntensity = rawIntensity * 0.95 + lastIntensity * 0.05;
				lastIntensity = smoothedIntensity;

				setAnalysis({
					intensity: smoothedIntensity,
					beatLevel,
					lowBandEnergy: lowEnergy,
					midBandEnergy: midEnergy,
					highBandEnergy: highEnergy,
					peak,
					rms,
					smoothLowEnergy: smoothedLowEnergy,
					timestamp: audio.currentTime * 1000,
				});

				animationFrameRef.current = requestAnimationFrame(analyze);
			};

			// 즉시 분석 시작
			animationFrameRef.current = requestAnimationFrame(analyze);
			console.log('[useAudioAnalyzer] 분석 시작:', {
				trackId: currentTrackId,
				isTrackChanged,
				audioPaused: audio.paused,
				hasSource: !!source,
			});
		});

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [enabled, isPlaying, currentTrack?.id]);

	return analysis;
};
