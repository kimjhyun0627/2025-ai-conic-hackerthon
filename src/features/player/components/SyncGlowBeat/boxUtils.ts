/**
 * 박스 스타일 계산 유틸리티 함수
 */

export interface BoxStyleConfig {
	baseSize: number; // 기본 크기 (vh)
	colorRgb: string; // RGB 색상 값
}

export interface IntensityBoxConfig extends BoxStyleConfig {
	intensity: number;
	extraPixels: number;
}

export interface BeatBoxConfig extends BoxStyleConfig {
	beatLevel: number;
	extraPixels: number;
}

/**
 * Intensity 박스 스타일 계산
 */
export const getIntensityBoxStyle = (config: IntensityBoxConfig) => {
	const { colorRgb, intensity, extraPixels } = config;

	return {
		background: `linear-gradient(135deg, rgba(${colorRgb}, 0.4) 0%, rgba(${colorRgb}, 0.2) 50%, rgba(${colorRgb}, 0.4) 100%)`,
		border: `1px solid rgba(${colorRgb}, 0.5)`,
		boxShadow: `
			0 0 ${10 + intensity * 20}px rgba(${colorRgb}, ${0.3 + intensity * 0.3}),
			0 0 ${20 + intensity * 40}px rgba(${colorRgb}, ${0.2 + intensity * 0.2}),
			inset 0 0 ${10 + intensity * 10}px rgba(${colorRgb}, ${0.1 + intensity * 0.2})
		`,
		backdropFilter: 'blur(10px)',
		filter: `blur(${2 + intensity * 3}px)`,
		opacity: 0.5,
		extraPixels,
	};
};

/**
 * Beat 박스 스타일 계산
 */
export const getBeatBoxStyle = (config: BeatBoxConfig) => {
	const { colorRgb, beatLevel, extraPixels } = config;

	return {
		background: `radial-gradient(circle, rgba(${colorRgb}, 0.9) 0%, rgba(${colorRgb}, 0.6) 50%, rgba(${colorRgb}, 0.3) 100%)`,
		border: `2px solid rgba(${colorRgb}, 0.8)`,
		boxShadow: `
			0 0 ${30 + beatLevel * 20}px rgba(${colorRgb}, ${0.5 + beatLevel * 0.3}),
			0 0 ${60 + beatLevel * 40}px rgba(${colorRgb}, ${0.3 + beatLevel * 0.2}),
			0 0 ${90 + beatLevel * 60}px rgba(${colorRgb}, ${0.1 + beatLevel * 0.2}),
			inset 0 0 ${30 + beatLevel * 20}px rgba(${colorRgb}, ${0.2 + beatLevel * 0.2})
		`,
		backdropFilter: 'blur(15px)',
		filter: `blur(${2 + beatLevel * 2}px) brightness(${1 + beatLevel * 0.4})`,
		opacity: 0.5 + beatLevel * 0.4,
		extraPixels,
	};
};

/**
 * Transition 계산 유틸리티
 */
export const getTransition = (isGrowing: boolean, type: 'intensity' | 'beat') => {
	const fastDuration = 0.03;
	const slowDuration = type === 'intensity' ? 0.15 : 0.15;

	return {
		width: { duration: isGrowing ? fastDuration : slowDuration, ease: 'easeOut' as const },
		height: { duration: isGrowing ? fastDuration : slowDuration, ease: 'easeOut' as const },
		left: { duration: isGrowing ? fastDuration : slowDuration, ease: 'easeOut' as const },
		top: { duration: isGrowing ? fastDuration : slowDuration, ease: 'easeOut' as const },
		opacity: { duration: 0.1 },
		boxShadow: { duration: isGrowing ? fastDuration : slowDuration, ease: 'easeOut' as const },
		filter: { duration: isGrowing ? fastDuration : slowDuration, ease: 'easeOut' as const },
	};
};
