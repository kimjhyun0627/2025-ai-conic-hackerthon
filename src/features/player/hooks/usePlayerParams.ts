import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { findThemeByGenre, mergeParamWithDefaults } from '@/shared/utils';
import type { CategoryParameter } from '@/shared/types';

/**
 * 플레이어 파라미터 관리 커스텀 훅
 */
export const usePlayerParams = () => {
	const {
		selectedGenre,
		visibleAdditionalParams,
		additionalParams,
		addVisibleAdditionalParam,
		removeVisibleAdditionalParam,
		setParamValue: setStoreParamValue,
		setAdditionalParams: setStoreAdditionalParams,
	} = usePlayerStore();
	const [hiddenThemeParams, setHiddenThemeParams] = useState<string[]>([]);

	// 테마 찾기
	const selectedTheme = useMemo(() => {
		return findThemeByGenre(selectedGenre);
	}, [selectedGenre]);

	// 테마별 기본 파라미터 3개 (처음 3개)
	const themeBaseParams = useMemo(() => {
		if (!selectedTheme) return [];
		return selectedTheme.parameters.slice(0, 3);
	}, [selectedTheme]);

	// 테마별 추가 파라미터 (기본 3개 제외)
	// visibleAdditionalParams에 포함된 파라미터는 표시, 나머지는 숨김
	const themeAdditionalParams = useMemo(() => {
		if (!selectedTheme) return [];
		const baseParamIds = themeBaseParams.map((p) => p.id);
		const result = selectedTheme.parameters.filter((param) => !baseParamIds.includes(param.id) && visibleAdditionalParams.includes(param.id));
		return result;
	}, [selectedTheme, themeBaseParams, visibleAdditionalParams]);

	// 활성화된 공통 파라미터 (생성 순서 유지) - 하위 호환성을 위해 유지하지만 실제로는 사용되지 않음
	const activeCommonParamsList = useMemo((): CategoryParameter[] => {
		return []; // COMMON_PARAMETERS가 제거되었으므로 항상 빈 배열 반환
	}, []);

	// 사용 가능한 테마 추가 파라미터 (아직 표시되지 않은 것들)
	const availableCommonParams = useMemo(() => {
		if (!selectedTheme) return [];

		// 테마의 모든 파라미터 중에서:
		// 1. 기본 3개 제외
		// 2. 현재 표시 중인 추가 파라미터 제외 (hiddenThemeParams에 포함되지 않은 것들)
		const baseParamIds = themeBaseParams.map((p) => p.id);
		const visibleAdditionalParamIds = themeAdditionalParams.map((p) => p.id);

		return selectedTheme.parameters.filter((param) => !baseParamIds.includes(param.id) && !visibleAdditionalParamIds.includes(param.id));
	}, [selectedTheme, themeBaseParams, themeAdditionalParams]);

	// 파라미터 값 가져오기
	const getParamValue = useCallback(
		(paramId: string): number => {
			// 테마 파라미터인지 확인 (기본 + 추가 모두 포함)
			const themeParam = selectedTheme?.parameters.find((p) => p.id === paramId);
			if (themeParam) {
				const merged = mergeParamWithDefaults(themeParam);
				// additionalParams에 값이 있으면 우선 사용, 없으면 테마의 default 값 사용
				return additionalParams[paramId] ?? merged.default;
			}

			// 테마 파라미터가 아닌 경우 additionalParams 또는 기본값 50
			return additionalParams[paramId] ?? 50;
		},
		[selectedTheme, additionalParams]
	);

	// 파라미터 값 설정하기
	const setParamValue = (paramId: string, value: number) => {
		// 모든 파라미터는 store의 additionalParams에 저장
		setStoreParamValue(paramId, value);
	};

	// 테마 추가 파라미터 표시 (visibleAdditionalParams에 추가)
	const addCommonParam = (paramId: string) => {
		// 테마 파라미터인지 확인
		const themeParam = selectedTheme?.parameters.find((p) => p.id === paramId);
		if (themeParam) {
			const merged = mergeParamWithDefaults(themeParam);
			// visibleAdditionalParams에 추가
			addVisibleAdditionalParam(paramId);
			// 기본값 설정
			setStoreParamValue(paramId, merged.default);
		}
	};

	// 테마 추가 파라미터 숨기기 (visibleAdditionalParams에서 제거)
	const removeCommonParam = (paramId: string) => {
		// 테마 추가 파라미터인지 확인
		const themeParam = selectedTheme?.parameters.find((p) => p.id === paramId);
		if (themeParam) {
			// visibleAdditionalParams에서 제거
			removeVisibleAdditionalParam(paramId);
			// 값은 유지 (나중에 다시 표시할 때를 위해)
		}
	};

	// 테마별 추가 파라미터 제거
	const removeThemeParam = (paramId: string) => {
		removeVisibleAdditionalParam(paramId);
		const currentParams = { ...additionalParams };
		delete currentParams[paramId];
		setStoreAdditionalParams(currentParams);
	};

	// 테마별 기본 파라미터 초기화 (장르가 변경될 때마다 테마의 default 값으로 설정)
	useEffect(() => {
		if (!selectedGenre) {
			return;
		}

		const theme = findThemeByGenre(selectedGenre);
		if (!theme) {
			return;
		}

		// 테마의 모든 파라미터를 초기화
		const additionalParamsUpdates: Record<string, number> = {};

		// 테마의 모든 parameters를 순회하며 초기화
		theme.parameters.forEach((param) => {
			const merged = mergeParamWithDefaults(param);
			additionalParamsUpdates[param.id] = merged.default;
		});

		// 기존 additionalParams에서 숨겨진 테마 파라미터의 값은 유지 (나중에 다시 표시할 때를 위해)
		const preservedHiddenParams: Record<string, number> = {};
		hiddenThemeParams.forEach((paramId) => {
			if (additionalParams[paramId] !== undefined) {
				preservedHiddenParams[paramId] = additionalParams[paramId];
			}
		});

		// 테마 파라미터와 유지할 숨겨진 파라미터를 병합
		const finalAdditionalParams = {
			...additionalParamsUpdates,
			...preservedHiddenParams,
		};

		// hiddenThemeParams는 더 이상 사용하지 않지만, 하위 호환성을 위해 유지
		// visibleAdditionalParams에 없는 추가 파라미터를 hiddenThemeParams에 저장
		const baseParamIds = theme.parameters.slice(0, 3).map((p) => p.id);
		const additionalParamIds = theme.parameters.filter((p) => !baseParamIds.includes(p.id)).map((p) => p.id);
		const hiddenParams = additionalParamIds.filter((id) => !visibleAdditionalParams.includes(id));
		setHiddenThemeParams(hiddenParams);

		// 파라미터 업데이트
		setStoreAdditionalParams(finalAdditionalParams);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGenre?.id, selectedGenre?.category]);

	// 현재 활성화된 모든 파라미터와 그 값들을 반환하는 함수
	// store의 additionalParams를 직접 참조하여 항상 최신 값을 가져옴
	const getActiveParamsWithValues = useCallback((): Record<string, number> => {
		const activeParams = [...themeBaseParams, ...themeAdditionalParams, ...activeCommonParamsList];
		const paramValues: Record<string, number> = {};

		activeParams.forEach((param) => {
			// store의 additionalParams에서 직접 가져오기 (항상 최신 값)
			const themeParam = selectedTheme?.parameters.find((p) => p.id === param.id);
			if (themeParam) {
				const merged = mergeParamWithDefaults(themeParam);
				paramValues[param.id] = additionalParams[param.id] ?? merged.default;
			} else {
				paramValues[param.id] = additionalParams[param.id] ?? 50;
			}
		});

		return paramValues;
	}, [themeBaseParams, themeAdditionalParams, activeCommonParamsList, additionalParams, selectedTheme]);

	return {
		selectedTheme,
		themeBaseParams,
		themeAdditionalParams,
		activeCommonParamsList,
		availableCommonParams,
		getParamValue,
		setParamValue,
		addCommonParam,
		removeCommonParam,
		removeThemeParam,
		getActiveParamsWithValues,
	};
};
