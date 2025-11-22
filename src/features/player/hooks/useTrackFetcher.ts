import { useCallback, useRef } from 'react';
import { fetchTrackForGenre } from '@/shared/api';
import type { MusicGenre, Track } from '@/shared/types';

/**
 * 트랙 가져오기 로직을 관리하는 커스텀 훅
 * - API 호출
 * - 에러 처리
 * - AbortSignal 관리
 */
export const useTrackFetcher = () => {
	const abortControllerRef = useRef<AbortController | null>(null);

	const fetchTrack = useCallback(async (genre: MusicGenre, signal?: AbortSignal): Promise<Track> => {
		// 기존 요청이 있다면 취소
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// 새로운 AbortController 생성 (signal이 제공되지 않은 경우)
		const abortController = signal ? undefined : new AbortController();
		if (abortController) {
			abortControllerRef.current = abortController;
		}

		const effectiveSignal = signal || abortController?.signal;

		try {
			const track = await fetchTrackForGenre(genre, effectiveSignal);
			return track;
		} catch (error) {
			// AbortError는 정상적인 취소이므로 무시
			if (error instanceof DOMException && error.name === 'AbortError') {
				throw error;
			}

			// 다른 에러는 재던지기
			throw error;
		} finally {
			// signal이 제공되지 않은 경우에만 ref 정리
			if (!signal && abortControllerRef.current === abortController) {
				abortControllerRef.current = null;
			}
		}
	}, []);

	const cancel = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
	}, []);

	// 컴포넌트 언마운트 시 정리
	const cleanup = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
	}, []);

	return {
		fetchTrack,
		cancel,
		cleanup,
	};
};
