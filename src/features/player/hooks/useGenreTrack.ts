import { useCallback, useRef, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useToast } from '@/shared/components/ui';
import { useTrackFetcher } from './useTrackFetcher';
import type { MusicGenre } from '@/shared/types';
import { isCancelError } from '@/shared/utils';

/**
 * 장르별 트랙 관리 훅
 * - 장르 변경 시 트랙 가져오기
 * - 큐 초기화 로직
 * - 토스트 알림 관리
 */
export const useGenreTrack = () => {
	const { fetchTrack, cleanup } = useTrackFetcher();
	const { selectedGenre, setSelectedGenre, setCurrentTrack, setNextTrack, moveToNextTrack, setDuration, resetQueue, setIsGenreChangeInProgress } = usePlayerStore();
	const { showInfo, showError, removeToast } = useToast();

	const toastIdRef = useRef<string | null>(null);

	// 컴포넌트 언마운트 시 정리
	useEffect(() => {
		return () => {
			cleanup();
		};
	}, [cleanup]);

	/**
	 * 장르 선택 시 트랙을 가져오고 큐를 업데이트합니다.
	 */
	const handleGenreSelect = useCallback(
		async (genre: MusicGenre) => {
			// 같은 장르를 재선택한 경우 아무 액션도 하지 않음
			if (selectedGenre?.id === genre.id) {
				return;
			}

			// 장르 변경 시작 플래그 설정
			setIsGenreChangeInProgress(true);

			// 토스트 표시
			if (toastIdRef.current) {
				removeToast(toastIdRef.current);
			}
			toastIdRef.current = showInfo('새로운 장르를 불러오는 중이에요...', null);

			try {
				const track = await fetchTrack(genre);

				const queue = usePlayerStore.getState().queue;
				const hasCurrentTrack = queue.currentIndex >= 0 && queue.currentIndex < queue.tracks.length;
				const prevGenre = usePlayerStore.getState().selectedGenre;

				// 장르가 실제로 변경된 경우에만 queue 초기화
				const isGenreChanged = !prevGenre || prevGenre.id !== genre.id;

				if (isGenreChanged) {
					// 새 장르로 변경: 큐 초기화 후 새 트랙 설정
					resetQueue();
					setSelectedGenre(genre);
					setCurrentTrack(track);
					setDuration(track.duration || 0);
				} else {
					// 같은 장르 내에서: 다음 트랙으로 추가
					if (!hasCurrentTrack) {
						// 첫 트랙인 경우
						setCurrentTrack(track);
						setDuration(track.duration || 0);
					} else {
						// 이미 트랙이 있는 경우 다음 트랙으로 추가
						setNextTrack(track);
						moveToNextTrack();
						setDuration(track.duration || 0);
					}
				}
			} catch (error) {
				// 취소된 요청은 정상적인 취소이므로 무시
				if (isCancelError(error)) {
					return;
				}

				// 에러 토스트 표시
				console.error('[useGenreTrack] 장르 변경 중 트랙 가져오기 실패:', error);
				showError('음악을 불러오는데 실패했습니다. 다시 시도해주세요.', 5000);
			} finally {
				// 장르 변경 완료 플래그 해제
				setIsGenreChangeInProgress(false);
				if (toastIdRef.current) {
					removeToast(toastIdRef.current);
					toastIdRef.current = null;
				}
			}
		},
		[selectedGenre, fetchTrack, setSelectedGenre, setCurrentTrack, setNextTrack, moveToNextTrack, setDuration, resetQueue, setIsGenreChangeInProgress, showInfo, showError, removeToast]
	);

	return {
		handleGenreSelect,
	};
};
