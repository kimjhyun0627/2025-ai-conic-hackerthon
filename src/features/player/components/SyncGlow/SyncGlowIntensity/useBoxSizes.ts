import { useRef } from 'react';
import { INTENSITY_BOX_CONSTANTS } from './constants';

interface UseIntensityBoxSizesProps {
	lowIntensity: number;
	midIntensity: number;
	highIntensity: number;
	isPlaying: boolean;
}

/**
 * Intensity 박스 크기 계산 커스텀 훅 (Low/Mid/High)
 */
export const useIntensityBoxSizes = ({ lowIntensity, midIntensity, highIntensity, isPlaying }: UseIntensityBoxSizesProps) => {
	// 모든 박스 동일한 크기 사용
	const prevLowExtraPixelsRef = useRef<number>(INTENSITY_BOX_CONSTANTS.BOX_IDLE_SIZE);
	const prevMidExtraPixelsRef = useRef<number>(INTENSITY_BOX_CONSTANTS.BOX_IDLE_SIZE);
	const prevHighExtraPixelsRef = useRef<number>(INTENSITY_BOX_CONSTANTS.BOX_IDLE_SIZE);

	// Low Intensity 계산
	const lowExtraPixels = isPlaying ? INTENSITY_BOX_CONSTANTS.BOX_IDLE_SIZE + lowIntensity * INTENSITY_BOX_CONSTANTS.BOX_MAX_EXTRA : INTENSITY_BOX_CONSTANTS.BOX_IDLE_SIZE;
	const lowIsGrowing = lowExtraPixels > prevLowExtraPixelsRef.current;
	prevLowExtraPixelsRef.current = lowExtraPixels;

	// Mid Intensity 계산
	const midExtraPixels = isPlaying ? INTENSITY_BOX_CONSTANTS.BOX_IDLE_SIZE + midIntensity * INTENSITY_BOX_CONSTANTS.BOX_MAX_EXTRA : INTENSITY_BOX_CONSTANTS.BOX_IDLE_SIZE;
	const midIsGrowing = midExtraPixels > prevMidExtraPixelsRef.current;
	prevMidExtraPixelsRef.current = midExtraPixels;

	// High Intensity 계산
	const highExtraPixels = isPlaying ? INTENSITY_BOX_CONSTANTS.BOX_IDLE_SIZE + highIntensity * INTENSITY_BOX_CONSTANTS.BOX_MAX_EXTRA : INTENSITY_BOX_CONSTANTS.BOX_IDLE_SIZE;
	const highIsGrowing = highExtraPixels > prevHighExtraPixelsRef.current;
	prevHighExtraPixelsRef.current = highExtraPixels;

	return {
		lowExtraPixels,
		lowIsGrowing,
		midExtraPixels,
		midIsGrowing,
		highExtraPixels,
		highIsGrowing,
	};
};
