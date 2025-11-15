// Default Audio Parameters
export const DEFAULT_AUDIO_PARAMS = {
	// 공통 파라미터
	reverb: 30,
	delay: 20,
	compressor: 50,
	filter: 50,
	distortion: 0,
	'stereo-width': 50,
	gain: 50,
	// 카테고리별 파라미터
	tempo: 80, // focus: 80, relax: 65 -> 평균값 사용
	bass: 50, // focus: 40, energy: 75, mood: 55, workout: 85 -> 평균값 사용
	clarity: 70, // focus
	energy: 80, // energy: 80, workout: 90 -> 평균값 사용
	kick: 85, // energy
	space: 75, // relax
	balance: 50, // relax
	mood: 60, // mood
	texture: 50, // mood
	beat: 90, // workout
};

// Parameter Ranges
export const PARAM_RANGES = {
	// 공통 파라미터
	reverb: { min: 0, max: 100, step: 1 },
	delay: { min: 0, max: 100, step: 1 },
	compressor: { min: 0, max: 100, step: 1 },
	filter: { min: 0, max: 100, step: 1 },
	distortion: { min: 0, max: 100, step: 1 },
	'stereo-width': { min: 0, max: 100, step: 1 },
	gain: { min: 0, max: 100, step: 1 },
	// 카테고리별 파라미터
	tempo: { min: 50, max: 120, step: 1 }, // focus: 60-120, relax: 50-90 -> 전체 범위 통합
	bass: { min: 0, max: 100, step: 1 },
	clarity: { min: 0, max: 100, step: 1 },
	energy: { min: 0, max: 100, step: 1 },
	kick: { min: 0, max: 100, step: 1 },
	space: { min: 0, max: 100, step: 1 },
	balance: { min: 0, max: 100, step: 1 },
	mood: { min: 0, max: 100, step: 1 },
	texture: { min: 0, max: 100, step: 1 },
	beat: { min: 0, max: 100, step: 1 },
};
