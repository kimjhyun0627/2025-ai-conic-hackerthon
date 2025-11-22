import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getSharedAudioElement } from '@/shared/audio';
import { fetchTrackForGenre } from '@/shared/api';
import { Toast } from '@/shared/components/ui';

export const PlayerAudioEngine = () => {
	const queue = usePlayerStore((state) => state.queue);
	const getCurrentTrack = usePlayerStore((state) => state.getCurrentTrack);
	const currentTrack = getCurrentTrack();
	const isPlaying = usePlayerStore((state) => state.isPlaying);
	const volume = usePlayerStore((state) => state.volume);
	const currentTime = usePlayerStore((state) => state.currentTime);
	const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
	const setDuration = usePlayerStore((state) => state.setDuration);
	const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
	const selectedGenre = usePlayerStore((state) => state.selectedGenre);
	const nextTrack = usePlayerStore((state) => state.queue.next);
	const setNextTrack = usePlayerStore((state) => state.setNextTrack);
	const moveToNextTrack = usePlayerStore((state) => state.moveToNextTrack);

	const audioRef = useRef<HTMLAudioElement | null>(getSharedAudioElement());
	const lastTimeFromAudioRef = useRef(0);
	const rafIdRef = useRef<number | null>(null);
	const prefetchAbortRef = useRef<AbortController | null>(null);
	const prefetchedTrackIdRef = useRef<string | null>(null);
	const [showNextPrefetchToast, setShowNextPrefetchToast] = useState(false);
	const [showNextReadyToast, setShowNextReadyToast] = useState(false);
	const previousIsPlayingRef = useRef(isPlaying);

	// Initialize audio element
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const handleLoadedMetadata = () => {
			if (isFinite(audio.duration)) {
				setDuration(audio.duration);
			}
		};

		const handleTimeUpdate = () => {
			lastTimeFromAudioRef.current = audio.currentTime;
			setCurrentTime(audio.currentTime);
		};

		const handleEnded = () => {
			moveToNextTrack();
		};

		const handleError = () => {
			setIsPlaying(false);
		};

		audio.addEventListener('loadedmetadata', handleLoadedMetadata);
		audio.addEventListener('timeupdate', handleTimeUpdate);
		audio.addEventListener('ended', handleEnded);
		audio.addEventListener('error', handleError);

		return () => {
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
			audio.removeEventListener('timeupdate', handleTimeUpdate);
			audio.removeEventListener('ended', handleEnded);
			audio.removeEventListener('error', handleError);
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
		};
	}, [setCurrentTime, setDuration, setIsPlaying, moveToNextTrack]);

	// Handle track changes
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		if (currentTrack?.audioUrl) {
			const audioTrackId = audio.dataset.trackId || null;
			const isNewTrack = currentTrack.id !== audioTrackId;

			if (isNewTrack) {
				audio.src = currentTrack.audioUrl;
				audio.dataset.trackId = currentTrack.id;
				audio.currentTime = 0;
				lastTimeFromAudioRef.current = 0;

				// 트랙이 변경되면 항상 자동 재생
				previousIsPlayingRef.current = true;

				// 로드 완료 후 재생 (로드 속도 때문에 일시정지되는 것을 방지)
				const handleCanPlay = () => {
					audio.play().catch(() => {
						setIsPlaying(false);
					});
				};

				if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
					// 이미 로드된 경우 즉시 재생
					handleCanPlay();
				} else {
					// 로드 완료 대기
					audio.addEventListener('canplay', handleCanPlay, { once: true });
				}
			} else if (isPlaying && audio.paused) {
				// 같은 트랙이지만 isPlaying이 true이고 audio가 일시정지 상태인 경우 재생
				// 로드 완료 후 재생 (로드 속도 때문에 일시정지되는 것을 방지)
				const handleCanPlayForResume = () => {
					audio.play().catch(() => {
						setIsPlaying(false);
					});
				};

				if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
					// 이미 로드된 경우 즉시 재생
					handleCanPlayForResume();
				} else {
					// 로드 완료 대기
					audio.addEventListener('canplay', handleCanPlayForResume, { once: true });
				}
			}
		} else {
			audio.pause();
			audio.removeAttribute('src');
			audio.load();
			audio.dataset.trackId = '';
			setIsPlaying(false);
			// 로드 완료 후 재생 상태 확인하여 자동 재개 (canplay 이벤트 사용)
			const handleCanPlayForEmpty = () => {
				const currentIsPlaying = usePlayerStore.getState().isPlaying;
				if (currentIsPlaying && currentTrack?.audioUrl) {
					audio.play().catch(() => {
						setIsPlaying(false);
					});
				}
			};

			if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
				// 이미 로드된 경우 즉시 확인
				handleCanPlayForEmpty();
			} else {
				// 로드 완료 대기
				audio.addEventListener('canplay', handleCanPlayForEmpty, { once: true });
			}
		}
	}, [currentTrack, isPlaying, setIsPlaying]);

	// Play/Pause control (isPlaying 상태 변경 시에만 처리)
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !currentTrack?.audioUrl) return;

		// 트랙이 변경되지 않았을 때만 재생/일시정지 처리
		const audioTrackId = audio.dataset.trackId || null;
		if (currentTrack.id !== audioTrackId) {
			return; // 트랙 변경 중이면 무시 (Handle track changes에서 처리)
		}

		if (isPlaying) {
			// 로드 완료 후 재생 (로드 속도 때문에 일시정지되는 것을 방지)
			const handleCanPlayForControl = () => {
				audio.play().catch(() => {
					setIsPlaying(false);
				});
			};

			if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
				// 이미 로드된 경우 즉시 재생
				handleCanPlayForControl();
			} else {
				// 로드 완료 대기
				audio.addEventListener('canplay', handleCanPlayForControl, { once: true });
			}
		} else {
			audio.pause();
		}

		previousIsPlayingRef.current = isPlaying;
	}, [isPlaying, currentTrack, setIsPlaying]);

	// Volume control
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.volume = Math.min(1, Math.max(0, volume / 100));
	}, [volume]);

	// Reset prefetch markers when track changes
	useEffect(() => {
		prefetchedTrackIdRef.current = null;
		if (prefetchAbortRef.current) {
			prefetchAbortRef.current.abort();
			prefetchAbortRef.current = null;
		}
		setShowNextPrefetchToast(false);
		setShowNextReadyToast(false);
	}, [currentTrack?.id]);

	// Prefetch next track when remaining time <= 30s
	useEffect(() => {
		if (!currentTrack || !selectedGenre) {
			if (showNextPrefetchToast) {
				setShowNextPrefetchToast(false);
			}
			return;
		}
		if (nextTrack || (queue.currentIndex >= 0 && queue.currentIndex < queue.tracks.length - 1)) {
			if (showNextPrefetchToast) {
				setShowNextPrefetchToast(false);
			}
			return;
		}

		const trackDuration = currentTrack.duration ?? audioRef.current?.duration;
		if (!trackDuration || trackDuration <= 30) {
			return;
		}

		const remaining = trackDuration - currentTime;
		if (remaining > 30 || remaining <= 0) {
			return;
		}

		if (prefetchedTrackIdRef.current === currentTrack.id) {
			return;
		}

		const abortController = new AbortController();
		prefetchAbortRef.current = abortController;
		prefetchedTrackIdRef.current = currentTrack.id;
		setShowNextPrefetchToast(true);

		fetchTrackForGenre(selectedGenre, abortController.signal)
			.then((track) => {
				if (!abortController.signal.aborted) {
					setNextTrack(track);
					setShowNextReadyToast(true);
				}
			})
			.catch((error) => {
				if (!abortController.signal.aborted) {
					console.error('다음 트랙 프리페치 실패:', error);
				}
			})
			.finally(() => {
				if (prefetchAbortRef.current === abortController) {
					prefetchAbortRef.current = null;
					setShowNextPrefetchToast(false);
				}
			});
	}, [currentTrack, currentTime, nextTrack, selectedGenre, setNextTrack, showNextPrefetchToast, queue.currentIndex, queue.tracks.length]);

	// Smooth progress updates while playing
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const tick = () => {
			setCurrentTime(audio.currentTime);
			rafIdRef.current = requestAnimationFrame(tick);
		};

		if (isPlaying) {
			rafIdRef.current = requestAnimationFrame(tick);
		} else if (rafIdRef.current !== null) {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}

		return () => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
		};
	}, [isPlaying, setCurrentTime]);

	// Sync external seeks
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		if (!Number.isFinite(currentTime)) return;

		const diff = Math.abs(audio.currentTime - currentTime);
		if (diff > 0.25) {
			audio.currentTime = currentTime;
		}
	}, [currentTime]);

	return (
		<>
			{showNextPrefetchToast && (
				<Toast
					message="다음 노래를 준비 중이에요!"
					type="info"
					duration={null}
					onClose={() => setShowNextPrefetchToast(false)}
				/>
			)}
			{showNextReadyToast && (
				<Toast
					message="다음 노래가 준비되었어요"
					type="success"
					duration={3000}
					onClose={() => setShowNextReadyToast(false)}
				/>
			)}
		</>
	);
};
