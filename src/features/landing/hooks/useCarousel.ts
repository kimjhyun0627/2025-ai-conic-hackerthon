import { useState, useCallback, useEffect } from 'react';

interface UseCarouselOptions {
	initialIndex?: number;
	randomInitialIndex?: boolean;
}

export const useCarousel = <T>(items: T[], options?: UseCarouselOptions) => {
	const { initialIndex, randomInitialIndex } = options || {};

	// 초기 인덱스 계산: randomInitialIndex가 true면 랜덤, initialIndex가 있으면 그것을 사용, 아니면 0
	const [currentIndex, setCurrentIndex] = useState(() => {
		if (randomInitialIndex && items.length > 0) {
			return Math.floor(Math.random() * items.length);
		}
		return initialIndex ?? 0;
	});

	// items가 변경되면 인덱스를 리셋 (랜덤 옵션이 있으면 다시 랜덤으로)
	useEffect(() => {
		if (randomInitialIndex && items.length > 0) {
			setCurrentIndex(Math.floor(Math.random() * items.length));
		} else {
			setCurrentIndex(initialIndex ?? 0);
		}
	}, [items, initialIndex, randomInitialIndex]);

	const next = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % items.length);
	}, [items.length]);

	const prev = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
	}, [items.length]);

	const goTo = useCallback((index: number) => {
		setCurrentIndex(index);
	}, []);

	return { currentIndex, next, prev, goTo };
};
