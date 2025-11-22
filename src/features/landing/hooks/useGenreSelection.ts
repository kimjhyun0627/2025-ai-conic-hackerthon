import { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import type { MusicGenre } from '@/shared/types';
import { useTrackFetcher } from '@/features/player/hooks/useTrackFetcher';
import { getSharedAudioElement } from '@/shared/audio';
import { useToast } from '@/shared/components/ui';

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
	const { showError } = useToast();

	const { fetchTrack, cancel, cleanup } = useTrackFetcher();
	const cancelApiCallRef = useRef<(() => void) | null>(null);
	const isCancelledRef = useRef<boolean>(false);

	const handleGenreSelect = useCallback(
		async (genre: MusicGenre, setIsTransitioning: (value: boolean) => void) => {
			setIsTransitioning(true);
			setSelectedGenre(genre);
			isCancelledRef.current = false;

			cancelApiCallRef.current = () => {
				isCancelledRef.current = true;
				cancel();
				setIsTransitioning(false);
				cancelApiCallRef.current = null;
			};

			try {
				const track = await fetchTrack(genre);
				if (isCancelledRef.current) {
					return;
				}

				setCurrentTrack(track);
				setDuration(track.duration || 0);

				const audio = getSharedAudioElement();
				audio.dataset.trackId = track.id;
				audio.src = track.audioUrl || '';
				audio.currentTime = 0;
				const volume = getVolume().volume;
				audio.volume = Math.min(1, Math.max(0, volume / 100));

				try {
					await audio.play();
					setIsPlaying(true);
				} catch {
					setIsPlaying(false);
				}

				setIsTransitioning(false);
				cancelApiCallRef.current = null;

				// 부드러운 전환을 위한 딜레이 후 페이지 이동
				await new Promise((resolve) => setTimeout(resolve, 200));
				if (!isCancelledRef.current) {
					cancelApiCallRef.current = null;
					navigate('/player');
				}
			} catch (error) {
				if (isCancelledRef.current) {
					return;
				}

				// AbortError는 정상적인 취소이므로 무시
				if (error instanceof DOMException && error.name === 'AbortError') {
					return;
				}

				setIsTransitioning(false);
				cancelApiCallRef.current = null;

				// 에러 토스트 표시
				showError('음악 생성에 실패했습니다. 다시 시도해주세요.', 5000);
			}
		},
		[navigate, setSelectedGenre, setCurrentTrack, setIsPlaying, setDuration, getVolume, fetchTrack, cancel, showError]
	);

	const handleCancelApiCall = useCallback(() => {
		if (cancelApiCallRef.current) {
			cancelApiCallRef.current();
		}
		cancel();
	}, [cancel]);

	// 컴포넌트 언마운트 시 정리
	useEffect(() => {
		return () => {
			cleanup();
		};
	}, [cleanup]);

	return {
		handleGenreSelect,
		handleCancelApiCall,
	};
};
