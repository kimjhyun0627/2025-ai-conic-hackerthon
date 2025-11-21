import type { CategoryParameter } from '@/shared/types';
import { DEFAULT_AUDIO_PARAMS, PARAM_RANGES } from '@/shared/constants/audioParams';

/**
 * CategoryParameter를 완전한 형태로 변환 (audioParams.ts의 기본값 병합)
 */
export const mergeParamWithDefaults = (param: CategoryParameter): CategoryParameter & { min: number; max: number; default: number } => {
	const range = PARAM_RANGES[param.id as keyof typeof PARAM_RANGES];
	const defaultValue = DEFAULT_AUDIO_PARAMS[param.id as keyof typeof DEFAULT_AUDIO_PARAMS];

	return {
		...param,
		min: param.min ?? range?.min ?? 0,
		max: param.max ?? range?.max ?? 100,
		default: param.default ?? defaultValue ?? 50,
	};
};
