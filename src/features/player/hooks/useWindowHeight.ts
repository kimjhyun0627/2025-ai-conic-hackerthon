import { useMemo } from 'react';
import { useWindowSize } from '@/shared/hooks';
import { HORIZONTAL_MAX_WIDTH_RATIO, DEFAULT_HORIZONTAL_MAX_WIDTH } from '../constants';

/**
 * 윈도우 높이 추적 및 가로 모드 최대 너비 계산 커스텀 훅
 * - 내부적으로 shared/hooks/useWindowSize 를 사용해 창 크기를 일관되게 관리
 */
export const useWindowHeight = () => {
	const { height: windowHeight } = useWindowSize();

	// 초기 화면 높이에 비례한 maxWidth 계산 (초기 높이의 80% 정도, 이후 고정)
	const horizontalMaxWidth = useMemo(() => {
		if (!windowHeight) return DEFAULT_HORIZONTAL_MAX_WIDTH;
		return windowHeight * HORIZONTAL_MAX_WIDTH_RATIO;
	}, [windowHeight]);

	return {
		initialWindowHeight: windowHeight,
		windowHeight,
		horizontalMaxWidth,
	};
};
