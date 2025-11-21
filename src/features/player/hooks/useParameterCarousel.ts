import { useState, useEffect, useRef } from 'react';
import type { CategoryParameter } from '@/shared/types';
import { PLAYER_CONSTANTS, type NavigationDirection } from '../constants';

interface UseParameterCarouselProps {
	allParams: CategoryParameter[];
	themeBaseParams: CategoryParameter[];
	themeAdditionalParams: CategoryParameter[];
	activeCommonParams: CategoryParameter[];
	orientation: 'horizontal' | 'vertical';
}

/**
 * 파라미터 캐러셀 로직 커스텀 훅
 */
export const useParameterCarousel = ({ allParams, themeBaseParams, themeAdditionalParams, activeCommonParams, orientation }: UseParameterCarouselProps) => {
	const [currentStartIndex, setCurrentStartIndex] = useState(0);
	const [windowHeight, setWindowHeight] = useState(0);
	const navigationDirectionRef = useRef<NavigationDirection>(null);
	const prevActiveCommonParamsRef = useRef<CategoryParameter[]>(activeCommonParams);
	const currentStartIndexRef = useRef(0);

	// 현재 화면 높이 추적 (반응형)
	useEffect(() => {
		const handleResize = () => {
			setWindowHeight(window.innerHeight);
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// 화면 높이에 따른 표시 개수 결정 (반응형: 3개, 2개, 1개)
	const getVisibleCount = (height: number): number => {
		if (height === 0) return 3; // 초기값
		// 높이에 따른 구간별 표시 개수
		if (height < PLAYER_CONSTANTS.PARAMETER.VISIBLE_COUNT_BREAKPOINTS.VERY_SMALL) return 1; // 매우 작은 화면
		if (height < PLAYER_CONSTANTS.PARAMETER.VISIBLE_COUNT_BREAKPOINTS.SMALL) return 2; // 작은 화면
		return 3; // 중간 이상 화면
	};

	const visibleCount = getVisibleCount(windowHeight);

	// currentStartIndex를 ref에 동기화
	useEffect(() => {
		currentStartIndexRef.current = currentStartIndex;
	}, [currentStartIndex]);

	// 새 파라미터 추가 시 가운데로 이동
	useEffect(() => {
		if (orientation === 'horizontal' && allParams.length > 0) {
			const prevParams = [...themeBaseParams, ...themeAdditionalParams, ...prevActiveCommonParamsRef.current];
			const currentParams = allParams;

			// 새로 추가된 파라미터 찾기
			if (currentParams.length > prevParams.length) {
				const newParam = currentParams.find((param) => !prevParams.some((p) => p.id === param.id));
				if (newParam) {
					const newParamIndex = currentParams.findIndex((p) => p.id === newParam.id);
					// 가운데로 이동: visibleCount에 따라 조정
					// visibleCount가 3이면 가운데는 1번째 (offset 1)
					// visibleCount가 2이면 가운데는 1번째 (offset 0, 하지만 1번째가 더 중앙에 가까움)
					// visibleCount가 1이면 가운데는 0번째 (offset 0)
					const centerOffset = visibleCount === 3 ? 1 : 0;
					const targetStartIndex = (newParamIndex - centerOffset + currentParams.length) % currentParams.length;
					setCurrentStartIndex(targetStartIndex);
				}
			}

			// 현재 상태를 이전 상태로 저장
			prevActiveCommonParamsRef.current = activeCommonParams;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeCommonParams.length, themeBaseParams.length, themeAdditionalParams.length, orientation, visibleCount, allParams.length]);

	// 캐러셀 네비게이션 함수 (화면 크기에 따라 페이지 단위로 이동, 무한 순환)
	const nextParam = () => {
		if (allParams.length === 0) return;
		navigationDirectionRef.current = 'down'; // 아래 버튼: 새 블록이 아래에서 올라옴
		setCurrentStartIndex((prev) => (prev + visibleCount) % allParams.length);
	};

	const prevParam = () => {
		if (allParams.length === 0) return;
		navigationDirectionRef.current = 'up'; // 위 버튼: 새 블록이 위에서 내려옴
		setCurrentStartIndex((prev) => (prev - visibleCount + allParams.length) % allParams.length);
	};

	// 현재 표시할 파라미터들 (반응형으로 표시)
	const getCurrentParams = () => {
		if (allParams.length === 0) return [];
		const params: CategoryParameter[] = [];
		for (let i = 0; i < visibleCount; i++) {
			const index = (currentStartIndex + i) % allParams.length;
			params.push(allParams[index]);
		}
		return params;
	};

	// 인덱스로 이동 (인디케이터 클릭 시 사용)
	const goToIndex = (paramIndex: number) => {
		// 클릭한 인덱스가 가운데가 되도록 currentStartIndex 조정
		// visibleCount가 3이면 가운데는 1번째 (offset 1)
		// visibleCount가 2이면 가운데는 1번째 (offset 0, 하지만 1번째가 더 중앙에 가까움)
		// visibleCount가 1이면 가운데는 0번째 (offset 0)
		const centerOffset = visibleCount === 3 ? 1 : 0;
		const targetStartIndex = (paramIndex - centerOffset + allParams.length) % allParams.length;
		setCurrentStartIndex(targetStartIndex);
	};

	return {
		currentStartIndex,
		visibleCount,
		navigationDirectionRef,
		nextParam,
		prevParam,
		getCurrentParams,
		goToIndex,
	};
};
