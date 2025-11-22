import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { DEFAULT_AUDIO_PARAMS } from '@/shared/constants';
import type { MusicGenre } from '@/shared/types';
import { fetchTrackForGenre } from '@/shared/api';
import { getSharedAudioElement } from '@/shared/audio';

/**
 * 장르 선택 및 음악 생성 API 호출을 관리하는 커스텀 훅
 */
export const useGenreSelection = () => {
	const navigate = useNavigate();
	const setSelectedGenre = usePlayerStore((state) => state.setSelectedGenre);
	const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
	const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
	const setDuration = usePlayerStore((state) => state.setDuration);
	const getVolume = usePlayerStore.getState;

	const cancelApiCallRef = useRef<(() => void) | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const isCancelledRef = useRef<boolean>(false);

	const handleGenreSelect = useCallback(
		async (genre: MusicGenre, setIsTransitioning: (value: boolean) => void) => {
			setIsTransitioning(true);
			setSelectedGenre(genre);
			isCancelledRef.current = false;

			abortControllerRef.current?.abort();
			const abortController = new AbortController();
			abortControllerRef.current = abortController;

			cancelApiCallRef.current = () => {
				isCancelledRef.current = true;
				abortController.abort();
				setIsTransitioning(false);
				cancelApiCallRef.current = null;
			};

			try {
				const track = await fetchTrackForGenre(genre, abortController.signal);
				if (isCancelledRef.current) {
					return;
				}

				setCurrentTrack(track);
				setDuration(track.duration || DEFAULT_AUDIO_PARAMS.tempo);

				const audio = getSharedAudioElement();
				audio.dataset.trackId = track.id;
				audio.src = track.audioUrl || '';
				audio.currentTime = 0;
				const volume = getVolume().volume;
				audio.volume = Math.min(1, Math.max(0, volume / 100));

				try {
					await audio.play();
					setIsPlaying(true);
				} catch (playError) {
					console.warn('초기 재생이 차단되었습니다:', playError);
					setIsPlaying(false);
				}

				setIsTransitioning(false);
				cancelApiCallRef.current = null;

				// 부드러운 전환을 위한 딜레이 후 페이지 이동
				await new Promise((resolve) => setTimeout(resolve, 200));
				if (!isCancelledRef.current) {
					abortControllerRef.current = null;
					cancelApiCallRef.current = null;
					navigate('/player');
				}
			} catch (error) {
				if (isCancelledRef.current) {
					return;
				}

				console.error('FreeSound API 호출 실패:', error);
				setIsTransitioning(false);
				cancelApiCallRef.current = null;
			} finally {
				abortControllerRef.current = null;
			}
		},
		[navigate, setSelectedGenre, setCurrentTrack, setIsPlaying, setDuration, getVolume]
	);

	const handleCancelApiCall = useCallback(() => {
		if (cancelApiCallRef.current) {
			cancelApiCallRef.current();
		}
	}, []);

	return {
		handleGenreSelect,
		handleCancelApiCall,
	};
};
