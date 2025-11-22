/**
 * Filter 관련 유틸리티 함수
 */

const DEFAULT_FILTER = 'blur(2px)';

/**
 * Filter 문자열에서 blur 값만 추출
 * @param filter - CSS filter 문자열 (예: "blur(3px) brightness(1.2)")
 * @returns blur 값만 포함된 filter 문자열 (예: "blur(3px)")
 */
export const extractBlurFilter = (filter: string): string => {
	if (filter.includes('blur')) {
		// "blur(Xpx)" 부분만 추출
		const blurMatch = filter.match(/blur\([^)]+\)/);
		return blurMatch ? blurMatch[0] : DEFAULT_FILTER;
	}
	return DEFAULT_FILTER;
};
