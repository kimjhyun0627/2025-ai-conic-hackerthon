/**
 * 환경 변수 래퍼
 * - Vite 환경 변수를 한 곳에서 타입 안전하게 관리
 */
export const ENV = {
	API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
	FREESOUND_API_KEY: import.meta.env.VITE_FREESOUND_API_KEY || '',
} as const;
