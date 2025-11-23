import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useToast } from '@/shared/components/ui';
import { useTrackFetcher } from './useTrackFetcher';

const PREFETCH_THRESHOLD_SECONDS = 10;

/**
 * 자동 프리페치 훅
 * - 현재 트랙이 10초 이하 남았을 때 다음 트랙을 자동으로 가져옵니다.
 */
export const useAutoPrefetch = (currentTrack: { id: string; duration?: number } | null, currentTime: number, audioRef: React.RefObject<HTMLAudioElement | null>) => {
	const { selectedGenre, queue, isGenreChangeInProgress, setNextTrack, setIsAutoPrefetching } = usePlayerStore();
	const { showInfo, showSuccess, removeToast } = useToast();
	const { fetchTrack } = useTrackFetcher();

	const prefetchAbortRef = useRef<AbortController | null>(null);
	const prefetchedTrackIdRef = useRef<string | null>(null);
	const prefetchToastIdRef = useRef<string | null>(null);
	const readyToastIdRef = useRef<string | null>(null);

	// 프리페치 정리 함수
	const cleanupPrefetch = useCallback(() => {
		if (prefetchAbortRef.current) {
			prefetchAbortRef.current.abort();
			prefetchAbortRef.current = null;
		}
		if (prefetchToastIdRef.current) {
			removeToast(prefetchToastIdRef.current);
			prefetchToastIdRef.current = null;
		}
		setIsAutoPrefetching(false);
	}, [removeToast, setIsAutoPrefetching]);

	// 트랙 변경 시 프리페치 마커 리셋
	useEffect(() => {
		prefetchedTrackIdRef.current = null;
		cleanupPrefetch();
		// readyToastIdRef는 자동 프리페치 완료 토스트이므로 트랙 변경 시에도 유지
	}, [currentTrack?.id, cleanupPrefetch]);

	// 자동 프리페치 로직
	useEffect(() => {
		// 장르 변경 중이면 다음 노래 요청 무시
		if (isGenreChangeInProgress) {
			cleanupPrefetch();
			return;
		}

		// 필수 조건 확인
		if (!currentTrack || !selectedGenre) {
			cleanupPrefetch();
			return;
		}

		// 이미 다음 트랙이 있으면 프리페치 불필요
		const hasNextTrack = queue.next || (queue.currentIndex >= 0 && queue.currentIndex < queue.tracks.length - 1);
		if (hasNextTrack) {
			cleanupPrefetch();
			return;
		}

		// 트랙 길이 확인
		const trackDuration = currentTrack.duration ?? audioRef.current?.duration;
		if (!trackDuration || trackDuration <= PREFETCH_THRESHOLD_SECONDS) {
			return;
		}

		// 남은 시간 확인
		const remaining = trackDuration - currentTime;
		if (remaining > PREFETCH_THRESHOLD_SECONDS || remaining <= 0) {
			return;
		}

		// 이미 프리페치한 트랙인지 확인
		if (prefetchedTrackIdRef.current === currentTrack.id) {
			return;
		}

		// 프리페치 시작
		const abortController = new AbortController();
		prefetchAbortRef.current = abortController;
		prefetchedTrackIdRef.current = currentTrack.id;

		// 토스트 표시 및 자동 프리페치 상태 설정
		if (!prefetchToastIdRef.current) {
			prefetchToastIdRef.current = showInfo('다음 트랙을 준비 중이에요!', null);
		}
		setIsAutoPrefetching(true);

		fetchTrack(selectedGenre, abortController.signal)
			.then((track) => {
				if (!abortController.signal.aborted) {
					setNextTrack(track);
					// 프리페치 토스트 제거하고 준비 완료 토스트 표시
					if (prefetchToastIdRef.current) {
						removeToast(prefetchToastIdRef.current);
						prefetchToastIdRef.current = null;
					}
					readyToastIdRef.current = showSuccess('다음 트랙이 준비되었어요!', 3000);
					setIsAutoPrefetching(false);
				}
			})
			.catch(() => {
				if (!abortController.signal.aborted) {
					if (prefetchToastIdRef.current) {
						removeToast(prefetchToastIdRef.current);
						prefetchToastIdRef.current = null;
					}
					setIsAutoPrefetching(false);
				}
			})
			.finally(() => {
				if (prefetchAbortRef.current === abortController) {
					prefetchAbortRef.current = null;
				}
			});
	}, [
		currentTrack,
		currentTime,
		queue.next,
		queue.currentIndex,
		queue.tracks.length,
		selectedGenre,
		isGenreChangeInProgress,
		setNextTrack,
		setIsAutoPrefetching,
		fetchTrack,
		showInfo,
		showSuccess,
		removeToast,
		audioRef,
		cleanupPrefetch,
	]);
};
