import { useState, useCallback, useEffect } from 'react';

export const useCarousel = <T>(items: T[]) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	// items가 변경되면 인덱스를 0으로 리셋
	useEffect(() => {
		setCurrentIndex(0);
	}, [items]);

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
