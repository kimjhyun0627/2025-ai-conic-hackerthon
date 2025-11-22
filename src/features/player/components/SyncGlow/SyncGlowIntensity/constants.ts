/**
 * SyncGlowIntensity 컴포넌트 관련 상수
 */

export const INTENSITY_BOX_CONSTANTS = {
	// 박스 기본 크기 (모든 박스 동일)
	BOX_BASE_SIZE: 0, // vh

	// 박스 idle 상태 크기 (모든 박스 동일)
	BOX_IDLE_SIZE: 0, // vh

	// 박스 최대 확장 크기 (모든 박스 동일)
	BOX_MAX_EXTRA: 20, // vh

	// 박스 초기 투명도 (모든 박스 동일)
	BOX_INITIAL_OPACITY: 0.3,

	// 이미지 투명도
	IMAGE_OPACITY_DARK: 0.85,
	IMAGE_OPACITY_LIGHT: 0.95,

	// 주파수 대역별 색상 RGB 값 (프라이머리 컬러 팔레트 사용)
	// 다크 모드: primary-400, primary-300, primary-100
	// 라이트 모드: primary-500, primary-600, primary-700
	// Low: primary-400 (다크) / primary-500 (라이트) - 저음
	LOW_COLOR_RGB_DARK: '251, 113, 133', // primary-400 (#fb7185)
	LOW_COLOR_RGB_LIGHT: '251, 113, 133', // primary-500 (#fb7185)

	// Mid: primary-300 (다크) / primary-600 (라이트) - 중음
	MID_COLOR_RGB_DARK: '252, 165, 165', // primary-300 (#fca5a5)
	MID_COLOR_RGB_LIGHT: '244, 63, 94', // primary-600 (#f43f5e)

	// High: primary-100 (다크) / primary-700 (라이트) - 고음
	HIGH_COLOR_RGB_DARK: '254, 226, 226', // primary-100 (#fee2e2)
	HIGH_COLOR_RGB_LIGHT: '225, 29, 72', // primary-700 (#e11d48)

	// 레거시 호환성 (기본값)
	COLOR_RGB_DARK: '251, 113, 133',
	COLOR_RGB_LIGHT: '200, 60, 90',

	// Z-Index (바깥쪽이 뒤, 안쪽이 앞)
	// Low는 가장 바깥쪽이므로 가장 뒤, High는 가장 안쪽이므로 가장 앞
	Z_INDEX: {
		LOW: 1, // 가장 뒤 (바깥쪽)
		MID: 2, // 중간
		HIGH: 3, // 가장 앞 (안쪽)
		IMAGE: 4, // 이미지는 가장 위
	},
} as const;
