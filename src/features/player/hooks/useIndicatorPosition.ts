import { useState, useEffect } from 'react';
import type { RefObject } from 'react';
import { PLAYER_CONSTANTS } from '../constants';

interface UseIndicatorPositionProps {
	panelRef: RefObject<HTMLDivElement | null>;
	carouselRef: RefObject<HTMLDivElement | null>;
	orientation: 'horizontal' | 'vertical';
	isExpanded: boolean;
	currentStartIndex: number;
	allParamsLength: number; // 파라미터 변경 감지를 위해 추가
}

/**
 * 인디케이터 위치 계산 커스텀 훅
 */
export const useIndicatorPosition = ({ panelRef, carouselRef, orientation, isExpanded, currentStartIndex, allParamsLength }: UseIndicatorPositionProps) => {
	const [indicatorLeft, setIndicatorLeft] = useState<number | string>('auto');
	const [indicatorTop, setIndicatorTop] = useState<number | string>('50%');

	useEffect(() => {
		if (panelRef.current && carouselRef.current && orientation === 'horizontal' && isExpanded) {
			// 수평 위치 업데이트: 패널 위치 기준으로 left 값 계산 (스크롤과 무관)
			const updateIndicatorLeft = () => {
				const panelRect = panelRef.current?.getBoundingClientRect();
				if (panelRect) {
					const panelRight = panelRect.right;
					// 패널 오른쪽 바깥에서 INDICATOR_OFFSET_FROM_PANEL만큼 떨어진 위치
					// getBoundingClientRect()는 viewport 기준이므로 fixed 포지션에서 바로 사용 가능
					const indicatorLeftPosition = panelRight + PLAYER_CONSTANTS.PARAMETER.INDICATOR_OFFSET_FROM_PANEL;
					setIndicatorLeft(indicatorLeftPosition); // 숫자로 저장하여 애니메이션 가능하게 함
				}
			};

			// 수직 위치만 업데이트 (캐러셀 영역의 중앙)
			const updateIndicatorTop = () => {
				const carouselRect = carouselRef.current?.getBoundingClientRect();
				if (carouselRect) {
					// 캐러셀 영역의 수직 중앙 위치 계산
					const carouselCenter = carouselRect.top + carouselRect.height / 2;
					setIndicatorTop(carouselCenter); // 숫자로 저장하여 애니메이션 가능하게 함
				}
			};

			// 위치 업데이트 함수 (초기 및 파라미터 변경 시 사용)
			const updatePosition = () => {
				// 첫 번째 프레임: 레이아웃 계산 시작
				requestAnimationFrame(() => {
					// 두 번째 프레임: 레이아웃이 완료된 후 위치 계산
					requestAnimationFrame(() => {
						updateIndicatorLeft();
						updateIndicatorTop();
					});
				});
			};

			// 초기 위치 설정 및 파라미터 변경 시 위치 재계산
			updatePosition();

			// 패널 위치 변경 감지를 위한 ResizeObserver (패널의 크기나 위치가 변경될 때만 반응)
			const panelResizeObserver = new ResizeObserver(() => {
				updateIndicatorLeft();
			});
			if (panelRef.current) {
				panelResizeObserver.observe(panelRef.current);
			}

			// 패널 위치 변경 감지를 위한 MutationObserver (레이아웃 변경 감지)
			const panelMutationObserver = new MutationObserver(() => {
				updateIndicatorLeft();
			});
			if (panelRef.current) {
				panelMutationObserver.observe(panelRef.current, {
					attributes: true,
					attributeFilter: ['style', 'class'],
					childList: false,
					subtree: false,
				});
			}

			// 수평 위치 업데이트: 스크롤, 리사이즈 시 패널 위치에 맞춰 업데이트
			window.addEventListener('resize', updateIndicatorLeft);
			window.addEventListener('scroll', updateIndicatorLeft);

			// 수직 위치 업데이트: 스크롤, 리사이즈, 캐러셀 내용 변경 시
			window.addEventListener('resize', updateIndicatorTop);
			window.addEventListener('scroll', updateIndicatorTop);

			// 캐러셀 내용 변경 시에도 수직 위치 업데이트
			const carouselObserver = new MutationObserver(updateIndicatorTop);
			if (carouselRef.current) {
				carouselObserver.observe(carouselRef.current, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ['style', 'class'],
				});
			}

			// requestAnimationFrame을 사용하여 더 부드러운 수직 위치 업데이트
			let rafId: number;
			const scheduleTopUpdate = () => {
				if (rafId) cancelAnimationFrame(rafId);
				rafId = requestAnimationFrame(updateIndicatorTop);
			};

			window.addEventListener('resize', scheduleTopUpdate);
			window.addEventListener('scroll', scheduleTopUpdate);

			return () => {
				panelResizeObserver.disconnect();
				panelMutationObserver.disconnect();
				window.removeEventListener('resize', updateIndicatorLeft);
				window.removeEventListener('scroll', updateIndicatorLeft);
				window.removeEventListener('resize', updateIndicatorTop);
				window.removeEventListener('scroll', updateIndicatorTop);
				window.removeEventListener('resize', scheduleTopUpdate);
				window.removeEventListener('scroll', scheduleTopUpdate);
				carouselObserver.disconnect();
				if (rafId) cancelAnimationFrame(rafId);
			};
		} else {
			// 패널이 닫히거나 세로 모드일 때 초기값으로 리셋
			setIndicatorLeft('auto');
			setIndicatorTop('50%');
		}
	}, [orientation, isExpanded, currentStartIndex, allParamsLength, panelRef, carouselRef]);

	return { indicatorLeft, indicatorTop };
};
