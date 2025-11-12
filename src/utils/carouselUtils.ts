import { CAROUSEL_CONSTANTS } from '../constants/carouselConstants';

/**
 * 원형 구조를 위한 상대 인덱스 계산
 */
export const getRelativeIndex = (index: number, currentIndex: number, total: number): number => {
	let diff = index - currentIndex;
	if (diff > total / 2) diff -= total;
	if (diff < -total / 2) diff += total;
	return diff;
};

/**
 * 카드 위치 계산
 */
interface Position {
	x: number;
	scale: number;
	opacity: number;
	zIndex: number;
}

export const calculateCardPosition = (relativeIndex: number, isActive: boolean, isVisible: boolean, effectiveRange: number): Position => {
	const { POSITION, Z_INDEX } = CAROUSEL_CONSTANTS;

	if (!isVisible) {
		const offset = relativeIndex < 0 ? -POSITION.HIDDEN_OFFSET : POSITION.HIDDEN_OFFSET;
		return {
			x: offset,
			scale: POSITION.HIDDEN_SCALE,
			opacity: POSITION.HIDDEN_OPACITY,
			zIndex: 0,
		};
	}

	if (isActive) {
		return {
			x: 0,
			scale: POSITION.ACTIVE_SCALE,
			opacity: POSITION.ACTIVE_OPACITY,
			zIndex: Z_INDEX.ACTIVE_CARD,
		};
	}

	const baseOffset = effectiveRange === 2 ? POSITION.BASE_OFFSET_RANGE_2 : POSITION.BASE_OFFSET_DEFAULT;
	const scale = POSITION.INACTIVE_SCALE;
	const zIndex = Z_INDEX.INACTIVE_CARD_BASE - Math.abs(relativeIndex);
	const opacity = POSITION.OPACITY_BASE + (zIndex / Z_INDEX.INACTIVE_CARD_BASE) * POSITION.OPACITY_RANGE;

	// 가장자리 카드 조정
	if (effectiveRange === 2 && Math.abs(relativeIndex) === 2) {
		const adjustedOffset = baseOffset * POSITION.EDGE_OFFSET_MULTIPLIER;
		return {
			x: relativeIndex * adjustedOffset,
			scale: scale - Math.abs(relativeIndex) * POSITION.SCALE_DECREMENT,
			opacity,
			zIndex,
		};
	}

	return {
		x: relativeIndex * baseOffset,
		scale: scale - Math.abs(relativeIndex) * POSITION.SCALE_DECREMENT,
		opacity,
		zIndex,
	};
};
