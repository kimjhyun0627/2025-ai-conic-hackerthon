import { useCallback, useRef, useEffect } from 'react';
import { fetchTrackForGenre } from '@/shared/api';
import type { MusicGenre, Track } from '@/shared/types';
import { usePlayerParams } from './usePlayerParams';
import { usePlayerStore } from '@/store/playerStore';
import { findThemeByGenre, mergeParamWithDefaults, isCancelError } from '@/shared/utils';

/**
 * 트랙 가져오기 로직을 관리하는 커스텀 훅
 * - API 호출
 * - 에러 처리
 * - AbortSignal 관리
 */
export const useTrackFetcher = () => {
	const abortControllerRef = useRef<AbortController | null>(null);
	const selectedGenre = usePlayerStore((state) => state.selectedGenre);
	const { getActiveParamsWithValues } = usePlayerParams();
	const getActiveParamsWithValuesRef = useRef(getActiveParamsWithValues);

	// 최신 getActiveParamsWithValues를 ref에 저장 (API 호출 시점에 최신 값 보장)
	useEffect(() => {
		getActiveParamsWithValuesRef.current = getActiveParamsWithValues;
	}, [getActiveParamsWithValues]);

	const fetchTrack = useCallback(
		async (genre: MusicGenre, signal?: AbortSignal): Promise<Track> => {
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

			// 활성화된 파라미터 수집
			let paramValues: Record<string, number> = {};

			// Player 페이지에서 호출된 경우 (selectedGenre가 있고 현재 장르와 일치하는 경우)
			if (selectedGenre && selectedGenre.id === genre.id) {
				// ref를 통해 최신 활성화된 파라미터 가져오기 (API 호출 시점의 최신 값 보장)
				paramValues = getActiveParamsWithValuesRef.current();
			} else {
				// 랜딩 페이지에서 호출된 경우 또는 장르가 다른 경우
				// genre로 직접 테마를 찾아서 기본 파라미터 3개만 사용
				const theme = findThemeByGenre(genre);
				if (theme) {
					const baseParams = theme.parameters.slice(0, 3);
					baseParams.forEach((param) => {
						const merged = mergeParamWithDefaults(param);
						paramValues[param.id] = merged.default;
					});
				}
			}

			try {
				const track = await fetchTrackForGenre(genre, effectiveSignal, paramValues);
				return track;
			} catch (error) {
				// 취소된 요청은 정상적인 취소이므로 재던지기 (상위에서 처리)
				if (isCancelError(error)) {
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
		},
		[selectedGenre]
	);

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
