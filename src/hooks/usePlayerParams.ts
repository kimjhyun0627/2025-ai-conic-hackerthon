import { useState, useEffect, useMemo } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { MUSIC_THEMES, DEFAULT_AUDIO_PARAMS } from '../constants/themes';
import { COMMON_PARAMETERS } from '../constants/musicThemes';
import { findThemeByGenre } from '../utils/themeUtils';
import type { CategoryParameter } from '../types';

/**
 * 플레이어 파라미터 관리 커스텀 훅
 */
export const usePlayerParams = () => {
	const { selectedGenre, audioParams, setAudioParams } = usePlayerStore();
	const [additionalParams, setAdditionalParams] = useState<Record<string, number>>({});
	const [activeCommonParams, setActiveCommonParams] = useState<string[]>([]);
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
		return selectedTheme.parameters.filter(
			(param) => !baseParamIds.includes(param.id) && !hiddenThemeParams.includes(param.id)
		);
	}, [selectedTheme, themeBaseParams, hiddenThemeParams]);

	// 활성화된 공통 파라미터 (생성 순서 유지)
	const activeCommonParamsList = useMemo(() => {
		return activeCommonParams
			.map((paramId) => COMMON_PARAMETERS.find((param) => param.id === paramId))
			.filter((param): param is CategoryParameter => param !== undefined);
	}, [activeCommonParams]);

	// 사용 가능한 공통 파라미터 (아직 추가되지 않은 것들)
	const availableCommonParams = useMemo(() => {
		return COMMON_PARAMETERS.filter((param) => !activeCommonParams.includes(param.id));
	}, [activeCommonParams]);

	// 파라미터 값 가져오기
	const getParamValue = (paramId: string): number => {
		const isBaseParam = themeBaseParams.some((p) => p.id === paramId);
		if (isBaseParam) {
			const themeParam = selectedTheme?.parameters.find((p) => p.id === paramId);
			return additionalParams[paramId] ?? themeParam?.default ?? 50;
		}

		// 기존 energy, bass, tempo는 audioParams에서 가져오기 (하위 호환성)
		if (paramId === 'energy') {
			return audioParams.energy;
		}
		if (paramId === 'bass') {
			return audioParams.bass;
		}
		if (paramId === 'tempo') {
			return audioParams.tempo;
		}

		// 추가 파라미터는 테마별 default 값 또는 공통 파라미터의 default 값 사용
		const themeParam = selectedTheme?.parameters.find((p) => p.id === paramId);
		if (themeParam) {
			return additionalParams[paramId] ?? themeParam.default;
		}
		const commonParam = COMMON_PARAMETERS.find((p) => p.id === paramId);
		if (commonParam) {
			return additionalParams[paramId] ?? commonParam.default;
		}
		return additionalParams[paramId] ?? 50;
	};

	// 파라미터 값 설정하기
	const setParamValue = (paramId: string, value: number) => {
		const isBaseParam = themeBaseParams.some((p) => p.id === paramId);
		if (isBaseParam) {
			setAdditionalParams((prev) => ({ ...prev, [paramId]: value }));
			return;
		}

		// 기존 energy, bass, tempo는 audioParams에 저장 (하위 호환성)
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

	// 공통 파라미터 추가
	const addCommonParam = (paramId: string) => {
		const param = COMMON_PARAMETERS.find((p) => p.id === paramId);
		if (param) {
			setActiveCommonParams((prev) => [...prev, paramId]);
			setAdditionalParams((prev) => ({ ...prev, [paramId]: param.default }));
		}
	};

	// 공통 파라미터 제거
	const removeCommonParam = (paramId: string) => {
		setActiveCommonParams((prev) => prev.filter((id) => id !== paramId));
		setAdditionalParams((prev) => {
			const next = { ...prev };
			delete next[paramId];
			return next;
		});
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
			additionalParamsUpdates[param.id] = param.default;

			// 하위 호환성을 위해 energy, bass, tempo는 audioParams에도 설정
			if (param.id === 'energy') {
				audioParamsUpdates.energy = param.default;
			} else if (param.id === 'bass') {
				audioParamsUpdates.bass = param.default;
			} else if (param.id === 'tempo') {
				audioParamsUpdates.tempo = param.default;
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

		// 기존 additionalParams에서 사용자가 추가한 공통 파라미터는 유지
		const preservedCommonParams: Record<string, number> = {};
		activeCommonParams.forEach((paramId) => {
			if (additionalParams[paramId] !== undefined) {
				preservedCommonParams[paramId] = additionalParams[paramId];
			}
		});

		// 테마 파라미터와 유지할 공통 파라미터를 병합
		const finalAdditionalParams = {
			...additionalParamsUpdates,
			...preservedCommonParams,
		};

		// 숨겨진 테마 파라미터 리셋 (테마가 변경되면 숨겨진 파라미터도 초기화)
		setHiddenThemeParams([]);

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

