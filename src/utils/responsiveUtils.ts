import { CAROUSEL_CONSTANTS } from '../constants/carouselConstants';

/**
 * 반응형 텍스트 크기 계산
 */
export const getResponsiveTextSize = (windowWidth: number, type: 'heading' | 'subtitle') => {
	const { BREAKPOINTS } = CAROUSEL_CONSTANTS;

	if (type === 'heading') {
		if (windowWidth >= BREAKPOINTS.DESKTOP) return '64px';
		if (windowWidth >= 1280) return '56px';
		if (windowWidth >= 1024) return '48px';
		if (windowWidth >= 768) return '40px';
		if (windowWidth >= 640) return '32px';
		if (windowWidth >= 480) return '24px';
		return '20px';
	}

	// subtitle
	if (windowWidth >= BREAKPOINTS.DESKTOP) return '28px';
	if (windowWidth >= 1280) return '24px';
	if (windowWidth >= 1024) return '20px';
	if (windowWidth >= 1024) return '16px';
	if (windowWidth >= 768) return '12px';
	return '10px';
};
