/**
 * SyncGlowWave 컴포넌트 관련 상수
 */

export const WAVEFORM_CONSTANTS = {
	// Canvas 설정
	CANVAS_WIDTH: 1920,
	CANVAS_HEIGHT: 1080,

	// 파형 설정
	WAVEFORM_LINE_WIDTH: 2,
	WAVEFORM_SMOOTHING: 0.8, // 0-1, 높을수록 부드러움

	// 이미지 투명도
	IMAGE_OPACITY_DARK: 0.85,
	IMAGE_OPACITY_LIGHT: 0.95,

	// 주파수 대역별 색상 (그라디언트용)
	LOW_COLOR_DARK: 'rgba(255, 80, 80, 0.8)', // 저음 - 빨강
	MID_COLOR_DARK: 'rgba(255, 200, 50, 0.8)', // 중음 - 노랑
	HIGH_COLOR_DARK: 'rgba(100, 150, 255, 0.8)', // 고음 - 파랑

	LOW_COLOR_LIGHT: 'rgba(220, 50, 50, 0.8)',
	MID_COLOR_LIGHT: 'rgba(255, 180, 40, 0.8)',
	HIGH_COLOR_LIGHT: 'rgba(80, 120, 230, 0.8)',

	// HUD 패널 설정
	HUD_WIDTH: 280,
	HUD_HEIGHT: 200,
	HUD_PADDING: 16,
	HUD_BORDER_RADIUS: 16,
	HUD_OPACITY: 0.85,

	// BPM 추정 설정
	BPM_MIN: 60,
	BPM_MAX: 200,
	PEAK_THRESHOLD: 0.3, // 피크 감지 임계값
} as const;
