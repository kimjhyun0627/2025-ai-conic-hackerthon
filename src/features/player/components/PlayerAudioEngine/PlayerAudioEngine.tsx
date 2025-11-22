import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getSharedAudioElement } from '@/shared/audio';
import { playAudioSafely } from '../../utils/audioPlaybackUtils';
import { useAutoPrefetch } from '../../hooks/useAutoPrefetch';

export const PlayerAudioEngine = () => {
	// Store 상태를 개별 selector로 가져오기 (객체 반환 시 무한 루프 방지)
	const getCurrentTrack = usePlayerStore((state) => state.getCurrentTrack);
	const isPlaying = usePlayerStore((state) => state.isPlaying);
	const volume = usePlayerStore((state) => state.volume);
	const currentTime = usePlayerStore((state) => state.currentTime);
	const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
	const setDuration = usePlayerStore((state) => state.setDuration);
	const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
	const moveToNextTrack = usePlayerStore((state) => state.moveToNextTrack);

	const currentTrack = getCurrentTrack();
	const audioRef = useRef<HTMLAudioElement | null>(getSharedAudioElement());
	const lastTimeFromAudioRef = useRef(0);
	const rafIdRef = useRef<number | null>(null);
	const previousIsPlayingRef = useRef(isPlaying);

	// 자동 프리페치 훅 사용
	useAutoPrefetch(currentTrack, currentTime, audioRef);

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
				playAudioSafely(audio, () => setIsPlaying(false));
			} else if (isPlaying && audio.paused) {
				// 같은 트랙이지만 isPlaying이 true이고 audio가 일시정지 상태인 경우 재생
				playAudioSafely(audio, () => setIsPlaying(false));
			}
		} else {
			audio.pause();
			audio.removeAttribute('src');
			audio.load();
			audio.dataset.trackId = '';
			setIsPlaying(false);
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
			playAudioSafely(audio, () => setIsPlaying(false));
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

	return null;
};
