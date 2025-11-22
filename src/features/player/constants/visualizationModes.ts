import { Square, Activity, Sparkles, Radio } from 'lucide-react';
import type { VisualizationModeOption } from '../types/visualization';

/**
 * 비주얼 모드 옵션 상수
 */
export const VISUALIZATION_MODES: readonly VisualizationModeOption[] = [
	{ id: 'box', name: '박스', description: '주파수 대역별 색상', icon: Square },
	{ id: 'wave', name: '웨이브', description: '주파수 분석 파형', icon: Activity },
	{ id: 'particle', name: '파티클', description: '오디오 기반 생성형 비주얼', icon: Sparkles },
	{ id: 'oscilloscope', name: '오실로스코프', description: '원형 오실로스코프 파형', icon: Radio },
] as const;

/**
 * 기본 비주얼 모드
 */
export const DEFAULT_VISUALIZATION_MODE: VisualizationModeOption['id'] = 'box';

/**
 * 비주얼 모드 ID로 옵션 찾기
 */
export const getVisualizationModeById = (id: VisualizationModeOption['id']): VisualizationModeOption | undefined => {
	return VISUALIZATION_MODES.find((mode) => mode.id === id);
};
