import type { CategoryParameter } from '@/shared/types';

/**
 * CategoryParameter를 완전한 형태로 변환 (musicThemes.ts의 값 사용)
 */
export const mergeParamWithDefaults = (param: CategoryParameter): CategoryParameter & { min: number; max: number; default: number } => {
	return {
		...param,
		// musicThemes.ts에 정의된 값 사용, 없으면 기본값
		min: param.min ?? 0,
		max: param.max ?? 100,
		default: param.default ?? 50,
	};
};
