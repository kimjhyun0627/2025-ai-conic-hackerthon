/**
 * Intensity 박스 스타일 계산 유틸리티 함수
 */

export interface IntensityBoxStyleConfig {
	colorRgb: string;
	intensity: number;
	extraPixels: number;
	type: 'low' | 'mid' | 'high';
}

// 스타일 계산 상수
const STYLE_CONSTANTS = {
	LOW: {
		BACKGROUND_OPACITY: {
			START_BASE: 0.9,
			START_MULTIPLIER: 0.1,
			MID_BASE: 0.6,
			MID_MULTIPLIER: 0.2,
			END_BASE: 0.3,
			END_MULTIPLIER: 0.3,
		},
		BORDER_OPACITY_BASE: 0.6,
		BORDER_OPACITY_MULTIPLIER: 0.2,
		BACKDROP_FILTER_BLUR: 0, // blur 제거
		FILTER_BLUR_BASE: 0, // blur 제거
		FILTER_BLUR_MULTIPLIER: 0, // blur 제거
		FILTER_BRIGHTNESS_MULTIPLIER: 0.3,
		OPACITY_BASE: 0.5,
		OPACITY_MULTIPLIER: 0.4,
		BOX_SHADOW: {
			BLUR_BASE: 30,
			BLUR_MULTIPLIER: 30,
			BLUR_OPACITY_BASE: 0.5,
			BLUR_OPACITY_MULTIPLIER: 0.4,
			SPREAD_BASE: 60,
			SPREAD_MULTIPLIER: 60,
			SPREAD_OPACITY_BASE: 0.3,
			SPREAD_OPACITY_MULTIPLIER: 0.3,
			FAR_SPREAD_BASE: 90,
			FAR_SPREAD_MULTIPLIER: 90,
			FAR_SPREAD_OPACITY_BASE: 0.1,
			FAR_SPREAD_OPACITY_MULTIPLIER: 0.2,
			INSET_BLUR_BASE: 30,
			INSET_BLUR_MULTIPLIER: 30,
			INSET_OPACITY_BASE: 0.2,
			INSET_OPACITY_MULTIPLIER: 0.3,
		},
	},
	MID: {
		BACKGROUND_OPACITY: {
			START_BASE: 0.4,
			START_MULTIPLIER: 0.4,
			MID_BASE: 0.2,
			MID_MULTIPLIER: 0.3,
			END_BASE: 0.4,
			END_MULTIPLIER: 0.4,
		},
		BORDER_OPACITY_BASE: 0.5,
		BORDER_OPACITY_MULTIPLIER: 0.3,
		BACKDROP_FILTER_BLUR: 0, // blur 제거
		FILTER_BLUR_BASE: 0, // blur 제거
		FILTER_BLUR_MULTIPLIER: 0, // blur 제거
		OPACITY_BASE: 0.4,
		OPACITY_MULTIPLIER: 0.4,
		BOX_SHADOW: {
			BLUR_BASE: 10,
			BLUR_MULTIPLIER: 20,
			BLUR_OPACITY_BASE: 0.3,
			BLUR_OPACITY_MULTIPLIER: 0.3,
			SPREAD_BASE: 20,
			SPREAD_MULTIPLIER: 40,
			SPREAD_OPACITY_BASE: 0.2,
			SPREAD_OPACITY_MULTIPLIER: 0.2,
			INSET_BLUR_BASE: 10,
			INSET_BLUR_MULTIPLIER: 10,
			INSET_OPACITY_BASE: 0.1,
			INSET_OPACITY_MULTIPLIER: 0.2,
		},
	},
	HIGH: {
		BACKGROUND_OPACITY: {
			START_BASE: 0.3,
			START_MULTIPLIER: 0.4,
			MID_BASE: 0.2,
			MID_MULTIPLIER: 0.3,
			END_BASE: 0.1,
			END_MULTIPLIER: 0.2,
		},
		BORDER_OPACITY_BASE: 0.4,
		BORDER_OPACITY_MULTIPLIER: 0.4,
		BACKDROP_FILTER_BLUR: 0, // blur 제거
		FILTER_BLUR_BASE: 0, // blur 제거
		FILTER_BLUR_MULTIPLIER: 0, // blur 제거
		OPACITY_BASE: 0.3,
		OPACITY_MULTIPLIER: 0.3,
		BOX_SHADOW: {
			BLUR_BASE: 30,
			BLUR_MULTIPLIER: 30,
			BLUR_OPACITY_BASE: 0.5,
			BLUR_OPACITY_MULTIPLIER: 0.4,
			SPREAD_BASE: 60,
			SPREAD_MULTIPLIER: 60,
			SPREAD_OPACITY_BASE: 0.3,
			SPREAD_OPACITY_MULTIPLIER: 0.3,
			FAR_SPREAD_BASE: 90,
			FAR_SPREAD_MULTIPLIER: 90,
			FAR_SPREAD_OPACITY_BASE: 0.1,
			FAR_SPREAD_OPACITY_MULTIPLIER: 0.2,
			INSET_BLUR_BASE: 30,
			INSET_BLUR_MULTIPLIER: 30,
			INSET_OPACITY_BASE: 0.2,
			INSET_OPACITY_MULTIPLIER: 0.3,
		},
	},
	TRANSITION: {
		// Low: 느린 파도형 (duration 긴 편, easeInOut)
		LOW_DURATION: 0.6,
		LOW_EASE: 'easeOut' as const,

		// Mid: 중간 속도 맥동 (duration 중간, easeOut)
		MID_DURATION: 0.4,
		MID_EASE: 'easeOut' as const,

		// High: 빠른 깜빡임 (duration 짧은 편, linear)
		HIGH_DURATION: 0.2,
		HIGH_EASE: 'easeOut' as const,

		// Opacity 전환 (모든 박스 동일)
		OPACITY_DURATION: 0.1,
	},
} as const;

/**
 * Intensity 박스 스타일 계산
 */
export const getIntensityBoxStyle = (config: IntensityBoxStyleConfig) => {
	const { colorRgb, intensity, extraPixels, type } = config;
	const styleConfig = STYLE_CONSTANTS[type.toUpperCase() as 'LOW' | 'MID' | 'HIGH'];

	// 가변 투명도 제거 - 고정값 사용
	const backgroundStartOpacity = 0.1; //styleConfig.BACKGROUND_OPACITY.START_BASE;
	const backgroundMidOpacity = 0.1; //styleConfig.BACKGROUND_OPACITY.MID_BASE;
	const backgroundEndOpacity = 0.1; //styleConfig.BACKGROUND_OPACITY.END_BASE;

	// border 색상을 background의 중간 opacity와 맞추기
	const avgBackgroundOpacity = (backgroundStartOpacity + backgroundMidOpacity + backgroundEndOpacity) / 3;
	const borderOpacity = Math.min(avgBackgroundOpacity + 0.2, 1); // background보다 약간 더 진하게

	// 모든 박스 동일한 투명도 0.95
	const opacity = 0.95;

	// 배경색 제거 - 투명하게
	const background = 'transparent';

	// 모든 박스 blur 제거, Low 박스만 brightness 적용
	const filter = type === 'low' && 'FILTER_BRIGHTNESS_MULTIPLIER' in styleConfig ? `brightness(${1 + intensity * styleConfig.FILTER_BRIGHTNESS_MULTIPLIER})` : 'none';

	const borderWidth = type === 'low' ? 2 : 1;

	// Box shadow 계산
	const blurValue = styleConfig.BOX_SHADOW.BLUR_BASE + intensity * styleConfig.BOX_SHADOW.BLUR_MULTIPLIER;
	const blurOpacity = styleConfig.BOX_SHADOW.BLUR_OPACITY_BASE + intensity * styleConfig.BOX_SHADOW.BLUR_OPACITY_MULTIPLIER;
	const spreadValue = styleConfig.BOX_SHADOW.SPREAD_BASE + intensity * styleConfig.BOX_SHADOW.SPREAD_MULTIPLIER;
	const spreadOpacity = styleConfig.BOX_SHADOW.SPREAD_OPACITY_BASE + intensity * styleConfig.BOX_SHADOW.SPREAD_OPACITY_MULTIPLIER;
	const insetBlurValue = styleConfig.BOX_SHADOW.INSET_BLUR_BASE + intensity * styleConfig.BOX_SHADOW.INSET_BLUR_MULTIPLIER;
	const insetOpacity = styleConfig.BOX_SHADOW.INSET_OPACITY_BASE + intensity * styleConfig.BOX_SHADOW.INSET_OPACITY_MULTIPLIER;

	let boxShadow = `
		0 0 ${blurValue}px rgba(${colorRgb}, ${blurOpacity}),
		0 0 ${spreadValue}px rgba(${colorRgb}, ${spreadOpacity}),
		inset 0 0 ${insetBlurValue}px rgba(${colorRgb}, ${insetOpacity})
	`;

	// Low와 High 박스는 추가 far spread shadow
	if ((type === 'low' || type === 'high') && 'FAR_SPREAD_BASE' in styleConfig.BOX_SHADOW) {
		const farSpreadValue = styleConfig.BOX_SHADOW.FAR_SPREAD_BASE + intensity * styleConfig.BOX_SHADOW.FAR_SPREAD_MULTIPLIER;
		const farSpreadOpacity = styleConfig.BOX_SHADOW.FAR_SPREAD_OPACITY_BASE + intensity * styleConfig.BOX_SHADOW.FAR_SPREAD_OPACITY_MULTIPLIER;
		boxShadow = `
			0 0 ${blurValue}px rgba(${colorRgb}, ${blurOpacity}),
			0 0 ${spreadValue}px rgba(${colorRgb}, ${spreadOpacity}),
			0 0 ${farSpreadValue}px rgba(${colorRgb}, ${farSpreadOpacity}),
			inset 0 0 ${insetBlurValue}px rgba(${colorRgb}, ${insetOpacity})
		`;
	}

	return {
		background,
		border: `${borderWidth}px solid rgba(${colorRgb}, ${borderOpacity})`,
		boxShadow: boxShadow.trim(),
		backdropFilter: styleConfig.BACKDROP_FILTER_BLUR > 0 ? `blur(${styleConfig.BACKDROP_FILTER_BLUR}px)` : 'none', // blur 제거
		filter,
		opacity,
		extraPixels,
	};
};

/**
 * Transition 계산 유틸리티 (주파수 대역별 차별화)
 */
export const getTransition = (type: 'low' | 'mid' | 'high') => {
	const { TRANSITION } = STYLE_CONSTANTS;

	// 주파수 대역별 다른 애니메이션 패턴
	const duration = type === 'low' ? TRANSITION.LOW_DURATION : type === 'mid' ? TRANSITION.MID_DURATION : TRANSITION.HIGH_DURATION;
	const ease = type === 'low' ? TRANSITION.LOW_EASE : type === 'mid' ? TRANSITION.MID_EASE : TRANSITION.HIGH_EASE;

	return {
		width: { duration, ease },
		height: { duration, ease },
		left: { duration, ease },
		top: { duration, ease },
		opacity: { duration: TRANSITION.OPACITY_DURATION },
		boxShadow: { duration, ease },
		filter: { duration, ease },
	};
};
