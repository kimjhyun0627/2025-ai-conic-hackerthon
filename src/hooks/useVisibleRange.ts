import { useMemo } from 'react';

export const useVisibleRange = (windowWidth: number, maxRange: number = 2) => {
	return useMemo(() => {
		if (windowWidth === 0) return 0; // 초기 렌더링
		if (windowWidth < 960) return 0; // 모바일: 1개만
		if (windowWidth < 1200) return 1; // 태블릿: 3개
		return maxRange; // 데스크톱: 최대 범위
	}, [windowWidth, maxRange]);
};
