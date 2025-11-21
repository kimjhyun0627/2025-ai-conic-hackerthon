import { PLAYER_CONSTANTS } from '../constants';

/**
 * 세로 모드에서 2행 레이아웃일 때 상단/하단 분할 계산
 */
export const getRowSplit = (count: number): [number, number] => {
	if (count <= 5) return [count, 0];
	if (count === 6) return [3, 3];
	if (count === 7) return [4, 3];
	if (count === 8) return [4, 4];
	if (count === 9) return [5, 4];
	if (count === 10) return [5, 5];
	// 10개 이상
	const topCount = Math.ceil(count / 2);
	return [topCount, count - topCount];
};

/**
 * 세로 모드에서 2행 레이아웃 사용 여부 결정
 */
export const shouldUseTwoRows = (totalParamsCount: number): boolean => {
	return totalParamsCount >= PLAYER_CONSTANTS.PARAMETER.VERTICAL_TWO_ROWS_THRESHOLD;
};
