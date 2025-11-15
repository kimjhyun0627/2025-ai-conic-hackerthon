import { CAROUSEL_CONSTANTS } from '../constants/carouselConstants';

/**
 * 반응형 텍스트 크기 계산
 */
export const getResponsiveTextSize = (windowWidth: number, type: 'heading' | 'subtitle' | 'caption') => {
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

	if (type === 'subtitle') {
		if (windowWidth >= BREAKPOINTS.DESKTOP) return '28px';
		if (windowWidth >= 1280) return '24px';
		if (windowWidth >= 1024) return '20px';
		if (windowWidth >= 1024) return '16px';
		if (windowWidth >= 768) return '12px';
		return '10px';
	}

	// caption (subtitle보다 작은 크기)
	if (windowWidth >= BREAKPOINTS.DESKTOP) return '20px';
	if (windowWidth >= 1280) return '18px';
	if (windowWidth >= 1024) return '16px';
	if (windowWidth >= 768) return '14px';
	if (windowWidth >= 640) return '12px';
	return '10px';
};

/**
 * 반응형 nav/footer 텍스트 크기 계산
 */
export const getResponsiveNavTextSize = (windowWidth: number) => {
	const { BREAKPOINTS } = CAROUSEL_CONSTANTS;

	if (windowWidth >= BREAKPOINTS.DESKTOP) return '16px';
	if (windowWidth >= 1280) return '15px';
	if (windowWidth >= 1024) return '14px';
	if (windowWidth >= 768) return '13px';
	if (windowWidth >= 640) return '12px';
	return '10px';
};
