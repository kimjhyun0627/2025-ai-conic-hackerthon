import { useState, useEffect, useMemo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { DEFAULT_AUDIO_PARAMS } from '@/shared/constants';
import { findThemeByGenre, mergeParamWithDefaults } from '@/shared/utils';

/**
 * 플레이어 파라미터 관리 커스텀 훅
 */
export const usePlayerParams = () => {
	const { selectedGenre, audioParams, setAudioParams } = usePlayerStore();
	const [additionalParams, setAdditionalParams] = useState<Record<string, number>>({});
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
	const themeAdditionalParams = useMemo(() => {
		if (!selectedTheme) return [];
		const baseParamIds = themeBaseParams.map((p) => p.id);
		return selectedTheme.parameters.filter((param) => !baseParamIds.includes(param.id) && !hiddenThemeParams.includes(param.id));
	}, [selectedTheme, themeBaseParams, hiddenThemeParams]);

	// 활성화된 공통 파라미터 (생성 순서 유지) - 하위 호환성을 위해 유지하지만 실제로는 사용되지 않음
	const activeCommonParamsList = useMemo(() => {
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
	const getParamValue = (paramId: string): number => {
		// 테마 파라미터인지 확인 (기본 + 추가 모두 포함)
		const themeParam = selectedTheme?.parameters.find((p) => p.id === paramId);
		if (themeParam) {
			const merged = mergeParamWithDefaults(themeParam);
			// additionalParams에 값이 있으면 우선 사용, 없으면 기본값
			return additionalParams[paramId] ?? merged.default;
		}

		// 하위 호환성: energy, bass, tempo는 audioParams에서 가져오기 (테마 파라미터가 아닌 경우만)
		if (paramId === 'energy') {
			return audioParams.energy;
		}
		if (paramId === 'bass') {
			return audioParams.bass;
		}
		if (paramId === 'tempo') {
			return audioParams.tempo;
		}

		// 그 외의 경우 additionalParams 또는 기본값
		return additionalParams[paramId] ?? DEFAULT_AUDIO_PARAMS[paramId as keyof typeof DEFAULT_AUDIO_PARAMS] ?? 50;
	};

	// 파라미터 값 설정하기
	const setParamValue = (paramId: string, value: number) => {
		// 테마 파라미터인지 확인 (기본 + 추가 모두 포함)
		const themeParam = selectedTheme?.parameters.find((p) => p.id === paramId);
		if (themeParam) {
			// 테마 파라미터는 additionalParams에 저장
			setAdditionalParams((prev) => ({ ...prev, [paramId]: value }));
			// 하위 호환성: energy, bass, tempo는 audioParams에도 동기화
			if (paramId === 'energy' || paramId === 'bass' || paramId === 'tempo') {
				setAudioParams({ [paramId]: value } as Partial<typeof audioParams>);
			}
			return;
		}

		// 하위 호환성: energy, bass, tempo는 audioParams에 저장 (테마 파라미터가 아닌 경우만)
		if (paramId === 'energy') {
			setAudioParams({ energy: value });
		} else if (paramId === 'bass') {
			setAudioParams({ bass: value });
		} else if (paramId === 'tempo') {
			setAudioParams({ tempo: value });
		} else {
			setAdditionalParams((prev) => ({ ...prev, [paramId]: value }));
		}
	};

	// 테마 추가 파라미터 표시 (hiddenThemeParams에서 제거)
	const addCommonParam = (paramId: string) => {
		// 테마 파라미터인지 확인
		const themeParam = selectedTheme?.parameters.find((p) => p.id === paramId);
		if (themeParam) {
			const merged = mergeParamWithDefaults(themeParam);
			// hiddenThemeParams에서 제거하여 표시
			setHiddenThemeParams((prev) => prev.filter((id) => id !== paramId));
			// 기본값 설정
			setAdditionalParams((prev) => ({ ...prev, [paramId]: merged.default }));
		}
	};

	// 테마 추가 파라미터 숨기기 (hiddenThemeParams에 추가)
	const removeCommonParam = (paramId: string) => {
		// 테마 추가 파라미터인지 확인
		const themeParam = selectedTheme?.parameters.find((p) => p.id === paramId);
		if (themeParam) {
			// hiddenThemeParams에 추가하여 숨김
			setHiddenThemeParams((prev) => (prev.includes(paramId) ? prev : [...prev, paramId]));
			// 값은 유지 (나중에 다시 표시할 때를 위해)
		}
	};

	// 테마별 추가 파라미터 제거
	const removeThemeParam = (paramId: string) => {
		setHiddenThemeParams((prev) => [...prev, paramId]);
		setAdditionalParams((prev) => {
			const next = { ...prev };
			delete next[paramId];
			return next;
		});
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

		// 기본 파라미터 업데이트 (처음 3개)
		const audioParamsUpdates: Partial<typeof audioParams> = {};

		// 추가 파라미터 업데이트 (테마의 모든 파라미터)
		const additionalParamsUpdates: Record<string, number> = {};

		// 테마의 모든 parameters를 순회하며 초기화
		theme.parameters.forEach((param) => {
			const merged = mergeParamWithDefaults(param);
			additionalParamsUpdates[param.id] = merged.default;

			// 하위 호환성을 위해 energy, bass, tempo는 audioParams에도 설정
			if (param.id === 'energy') {
				audioParamsUpdates.energy = merged.default;
			} else if (param.id === 'bass') {
				audioParamsUpdates.bass = merged.default;
			} else if (param.id === 'tempo') {
				audioParamsUpdates.tempo = merged.default;
			}
		});

		// 매핑되지 않은 기본 파라미터는 DEFAULT_AUDIO_PARAMS의 기본값 사용
		if (audioParamsUpdates.energy === undefined) {
			audioParamsUpdates.energy = DEFAULT_AUDIO_PARAMS.energy;
		}
		if (audioParamsUpdates.bass === undefined) {
			audioParamsUpdates.bass = DEFAULT_AUDIO_PARAMS.bass;
		}
		if (audioParamsUpdates.tempo === undefined) {
			audioParamsUpdates.tempo = DEFAULT_AUDIO_PARAMS.tempo;
		}

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

		// 기본 3개를 제외한 나머지 추가 파라미터를 기본적으로 숨김 상태로 설정
		const baseParamIds = theme.parameters.slice(0, 3).map((p) => p.id);
		const additionalParamIds = theme.parameters.filter((p) => !baseParamIds.includes(p.id)).map((p) => p.id);
		setHiddenThemeParams(additionalParamIds);

		// 기본 파라미터 업데이트
		setAudioParams(audioParamsUpdates);

		// 추가 파라미터 업데이트
		setAdditionalParams(finalAdditionalParams);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGenre?.id, selectedGenre?.category]);

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
	};
};
