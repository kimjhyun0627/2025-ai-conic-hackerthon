import type { LucideIcon } from 'lucide-react';

/**
 * 비주얼 옵션 모드 타입
 */
export type VisualizationMode = 'box' | 'wave' | 'particle' | 'oscilloscope';

/**
 * 비주얼 모드 옵션 인터페이스
 */
export interface VisualizationModeOption {
	id: VisualizationMode;
	name: string;
	description: string;
	icon: LucideIcon;
}
