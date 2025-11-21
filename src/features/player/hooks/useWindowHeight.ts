import { useMemo } from 'react';
import { useWindowSize } from '@/shared/hooks';
import { PLAYER_CONSTANTS } from '../constants';

/**
 * 윈도우 높이 추적 및 가로 모드 최대 너비 계산 커스텀 훅
 * - 내부적으로 shared/hooks/useWindowSize 를 사용해 창 크기를 일관되게 관리
 */
export const useWindowHeight = () => {
	const { width: windowWidth, height: windowHeight } = useWindowSize();

	// 가로 모드에서 파라미터 패널의 최대 너비는
	// 화면 "높이"가 아닌 "너비"에 기반해서 계산해야
	// landscape 모드에서 높이가 줄어들어도 폭이 같이 줄어들지 않는다.
	const horizontalMaxWidth = useMemo(() => {
		if (!windowWidth) return PLAYER_CONSTANTS.PARAMETER.DEFAULT_HORIZONTAL_MAX_WIDTH;
		return windowWidth * PLAYER_CONSTANTS.PARAMETER.HORIZONTAL_MAX_WIDTH_RATIO;
	}, [windowWidth]);

	return {
		initialWindowHeight: windowHeight,
		windowHeight,
		horizontalMaxWidth,
	};
};
