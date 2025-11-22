import { useCallback, useRef, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useToast } from '@/shared/components/ui';
import { useTrackFetcher } from './useTrackFetcher';
import { isCancelError } from '@/shared/utils';

/**
 * 플레이어에서 사용하는 트랙 관리 훅
 * - 다음 트랙 가져오기
 * - 토스트 알림 관리
 * - 에러 처리
 */
export const usePlayerTrack = () => {
	const { fetchTrack } = useTrackFetcher();
	const { selectedGenre, queue, isGenreChangeInProgress, isAutoPrefetching, setNextTrack, moveToNextTrack } = usePlayerStore();
	const { showInfo, showSuccess, showWarning, removeToast } = useToast();

	const loadingToastIdRef = useRef<string | null>(null);
	const readyToastIdRef = useRef<string | null>(null);
	const warningToastIdRef = useRef<string | null>(null);

	// 장르 변경 완료 시 warning 토스트 제거
	useEffect(() => {
		if (!isGenreChangeInProgress && warningToastIdRef.current) {
			removeToast(warningToastIdRef.current);
			warningToastIdRef.current = null;
		}
	}, [isGenreChangeInProgress, removeToast]);

	// 자동 프리페치 완료 시 (nextTrack이 생기면) warning 토스트 제거하고 다음 노래로 이동
	useEffect(() => {
		// warning 토스트가 있고 nextTrack이 생기면 (자동 프리페치가 완료된 경우)
		if (queue.next && warningToastIdRef.current) {
			// warning 토스트 제거
			removeToast(warningToastIdRef.current);
			warningToastIdRef.current = null;
			// 약간의 딜레이를 주어 "다음 노래가 준비되었어요" 토스트가 표시되도록 함
			setTimeout(() => {
				moveToNextTrack();
			}, 100);
		}
	}, [queue.next, removeToast, moveToNextTrack]);

	/**
	 * 다음 트랙으로 이동하거나 새 트랙을 가져옵니다.
	 */
	const handleNextTrack = useCallback(async () => {
		// 자동 프리페치 중이면 warning 토스트 표시
		if (isAutoPrefetching) {
			if (warningToastIdRef.current) {
				removeToast(warningToastIdRef.current);
			}
			warningToastIdRef.current = showWarning('다음 노래를 자동으로 준비 중이에요!', 3000);
			return;
		}

		// 장르 변경 중이면 요청 무시
		if (isGenreChangeInProgress) {
			if (warningToastIdRef.current) {
				removeToast(warningToastIdRef.current);
			}
			warningToastIdRef.current = showWarning('장르를 변경 중이에요!', 3000);
			return;
		}

		// nextTrack이 있으면 바로 이동
		if (queue.next) {
			moveToNextTrack();
			return;
		}

		// tracks에 다음 트랙이 있으면 이동
		if (queue.currentIndex >= 0 && queue.currentIndex < queue.tracks.length - 1) {
			moveToNextTrack();
			return;
		}

		// 새 트랙 가져오기
		if (!selectedGenre) {
			return;
		}

		// 로딩 토스트 표시
		if (loadingToastIdRef.current) {
			removeToast(loadingToastIdRef.current);
		}
		loadingToastIdRef.current = showInfo('다음 트랙을 준비 중이에요!', null);

		try {
			const track = await fetchTrack(selectedGenre);

			// 준비 완료 토스트 표시
			if (loadingToastIdRef.current) {
				removeToast(loadingToastIdRef.current);
				loadingToastIdRef.current = null;
			}

			setNextTrack(track);
			readyToastIdRef.current = showSuccess('다음 트랙이 준비되었어요!', 3000);
			moveToNextTrack();
		} catch (error) {
			// 취소된 요청은 정상적인 취소이므로 무시
			if (isCancelError(error)) {
				return;
			}

			console.error('[usePlayerTrack] 다음 트랙 가져오기 실패:', error);

			if (loadingToastIdRef.current) {
				removeToast(loadingToastIdRef.current);
				loadingToastIdRef.current = null;
			}
		}
	}, [isAutoPrefetching, isGenreChangeInProgress, queue, selectedGenre, fetchTrack, setNextTrack, moveToNextTrack, showInfo, showSuccess, showWarning, removeToast]);

	return {
		handleNextTrack,
	};
};
