import { CAROUSEL_CONSTANTS } from '../constants/carouselConstants';

/**
 * 반응형 텍스트 크기 계산
 */
export const getResponsiveTextSize = (windowWidth: number, type: 'heading' | 'subtitle') => {
	const { BREAKPOINTS } = CAROUSEL_CONSTANTS;

	if (type === 'heading') {
		if (windowWidth >= BREAKPOINTS.DESKTOP) return '76px';
		if (windowWidth >= 1280) return '64px';
		if (windowWidth >= 1024) return '56px';
		return '48px';
	}

	// subtitle
	if (windowWidth >= BREAKPOINTS.DESKTOP) return '28px';
	if (windowWidth >= 1280) return '20px';
	if (windowWidth >= 1024) return '16px';
	return '14px';
};
