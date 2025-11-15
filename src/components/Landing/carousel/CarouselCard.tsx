import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useThemeStore } from '../../../store/themeStore';
import { useWindowWidth } from '../../../hooks/useWindowWidth';

interface CarouselCardProps {
	onClick: () => void;
	children: ReactNode;
	index: number;
	currentIndex: number;
	total: number;
	backImage?: ReactNode; // 뒷면 이미지
	frontImage?: ReactNode; // 앞면 이미지 (활성 카드용)
	visibleRange?: number; // 보여줄 카드 범위 (양쪽으로 몇 개씩)
}

const CarouselCard = ({
	onClick,
	children,
	index,
	currentIndex,
	total,
	backImage,
	frontImage,
	visibleRange = 1, // 기본값: 양쪽으로 1개씩 (총 3개)
}: CarouselCardProps) => {
	const theme = useThemeStore((state) => state.theme);
	const windowWidth = useWindowWidth();

	// 반응형 visibleRange 결정
	const effectiveRange =
		visibleRange ||
		(windowWidth === 0
			? 1
			: windowWidth < 960
				? 0 // 모바일: 1개만
				: windowWidth < 1200
					? 1 // 태블릿: 3개
					: 2); // 데스크톱: 5개

	// 원형 구조를 위한 상대 인덱스 계산
	const getRelativeIndex = () => {
		let diff = index - currentIndex;
		if (diff > total / 2) diff -= total;
		if (diff < -total / 2) diff += total;
		return diff;
	};

	const relativeIndex = getRelativeIndex();
	const isActive = relativeIndex === 0;
	const isVisible = Math.abs(relativeIndex) <= effectiveRange;

	// 내용물 표시 상태 (이동 애니메이션 완료 후 변경)
	const [showContent, setShowContent] = useState(isActive);
	const prevIsActiveRef = useRef(isActive);

	// 이전 상태 추적 (useRef 사용하여 렌더링 전에 접근 가능)
	const prevVisibleRef = useRef(isVisible);
	const prevRelativeIndexRef = useRef(relativeIndex);
	const isFirstRender = useRef(true);

	// 상태 변경 감지
	const wasVisible = prevVisibleRef.current;
	const wasRelativeIndex = prevRelativeIndexRef.current;
	const isEntering = !wasVisible && isVisible;
	const isExiting = wasVisible && !isVisible;

	// relativeIndex 변경 추적
	useEffect(() => {
		prevVisibleRef.current = isVisible;
		prevRelativeIndexRef.current = relativeIndex;
		isFirstRender.current = false;
	}, [relativeIndex, isVisible]);

	// isActive 상태 변경 감지 및 내용물 지연 업데이트
	useEffect(() => {
		if (prevIsActiveRef.current !== isActive) {
			// 첫 렌더링이 아닐 때만 지연 적용
			if (!isFirstRender.current) {
				if (isActive) {
					// 활성화되는 경우: 이동과 동시에 블러 적용, 데이터 표시는 약간 지연
					const timer = setTimeout(() => {
						setShowContent(true);
					}, 400); // 이동 애니메이션과 약간 겹치도록

					prevIsActiveRef.current = isActive;
					return () => {
						clearTimeout(timer);
					};
				} else {
					// 비활성화되는 경우: 즉시 변경
					setShowContent(false);
					prevIsActiveRef.current = isActive;
				}
			} else {
				// 첫 렌더링 시에는 즉시 업데이트 (활성 카드는 블러와 콘텐츠 모두 표시)
				if (isActive) {
					setShowContent(true);
				}
				prevIsActiveRef.current = isActive;
			}
		}
	}, [isActive]);

	// 위치 계산 (반응형)
	const getPosition = () => {
		if (!isVisible) {
			// 보이지 않는 카드들도 flip 효과를 받도록 처리
			if (relativeIndex < 0) return { x: -400, scale: 0.5, opacity: 0, zIndex: 0 };
			return { x: 400, scale: 0.5, opacity: 0, zIndex: 0 };
		}

		if (isActive) return { x: 0, scale: 1, opacity: 1, zIndex: 40 };

		// 반응형 위치 계산
		// 5개가 보일 때 (effectiveRange = 2) baseOffset을 줄여서 카드들이 더 가깝게 배치
		const baseOffset = effectiveRange === 2 ? 260 : 310;
		const scale = 0.8;
		const zIndex = 30 - Math.abs(relativeIndex);

		// zIndex에 따라 opacity 조절 (레이어 전환을 부드럽게)
		// zIndex가 높을수록 opacity 높게, 낮을수록 낮게
		const opacity = 0.7 + (zIndex / 10) * 0.3; // 0.7 ~ 1.0 범위

		// 5개가 보일 때 가장자리 카드들(±2)의 위치를 더 조정
		if (effectiveRange === 2 && Math.abs(relativeIndex) === 2) {
			// 가장자리 카드들을 네비게이션 버튼 중앙에 모서리가 오도록 위치 조정
			// 화면 크기에 따라 동적으로 계산
			const inactiveCardMaxWidth = 380; // 비활성 카드 최대 너비
			const inactiveCardWidth = windowWidth > 0 ? Math.min(windowWidth * 0.7, inactiveCardMaxWidth) : inactiveCardMaxWidth;
			const cardHalfWidth = inactiveCardWidth / 2;

			// gap: 모바일 16px (gap-4), 데스크톱 24px (md:gap-6)
			const gap = windowWidth >= 768 ? 24 : 16;

			// 버튼 크기: 모바일 p-2 + 아이콘 w-4 h-4, 데스크톱 p-3 + 아이콘 w-5 h-5
			const buttonPadding = windowWidth >= 768 ? 12 : 8; // md:p-3 = 12px, p-2 = 8px
			const iconSize = windowWidth >= 768 ? 20 : 16; // md:w-5 h-5 = 20px, w-4 h-4 = 16px
			const buttonHalfSize = (buttonPadding * 2 + iconSize) / 2;

			const targetOffset = cardHalfWidth + gap + buttonHalfSize;
			const adjustedOffset = targetOffset * 0.85; // 더 안쪽으로 이동

			if (relativeIndex < 0) {
				return {
					x: relativeIndex * adjustedOffset,
					scale: scale - Math.abs(relativeIndex) * 0.1,
					opacity,
					zIndex,
				};
			} else {
				return {
					x: relativeIndex * adjustedOffset,
					scale: scale - relativeIndex * 0.1,
					opacity,
					zIndex,
				};
			}
		}

		if (relativeIndex < 0) {
			// 왼쪽 카드들
			return {
				x: relativeIndex * baseOffset,
				scale: scale - Math.abs(relativeIndex) * 0.1,
				opacity,
				zIndex,
			};
		} else {
			// 오른쪽 카드들
			return {
				x: relativeIndex * baseOffset,
				scale: scale - relativeIndex * 0.1,
				opacity,
				zIndex,
			};
		}
	};

	const position = getPosition();

	// 이동 애니메이션 설정
	const positionConfig = {
		type: 'spring' as const,
		stiffness: 120,
		damping: 28,
		mass: 2.5,
	};

	// 등장/퇴장 애니메이션을 위한 초기 값 설정
	const getInitialValues = () => {
		// 첫 렌더링이거나 등장하는 경우
		if (isFirstRender.current || isEntering) {
			if (relativeIndex < 0) {
				return { x: -400, scale: 0.5, opacity: 0 };
			} else if (relativeIndex > 0) {
				return { x: 400, scale: 0.5, opacity: 0 };
			}
		}
		// 퇴장하는 경우는 animate에서 처리
		return false;
	};

	const initialValues = getInitialValues();

	// 퇴장 애니메이션을 위한 exit 값
	const exitValues = isExiting
		? {
				x: wasRelativeIndex < 0 ? -400 : 400,
				scale: 0.5,
				opacity: 0,
			}
		: undefined;

	return (
		<motion.div
			layout
			className="absolute"
			initial={initialValues}
			animate={{
				x: position.x,
				scale: position.scale,
				opacity: position.opacity,
				rotateY: 0,
			}}
			exit={exitValues}
			style={{
				zIndex: position.zIndex,
			}}
			transition={{
				x: positionConfig,
				scale: positionConfig,
				opacity: {
					...positionConfig,
					duration: 0.5, // opacity transition을 더 부드럽게
				},
				rotateY: {
					type: 'spring' as const,
					stiffness: 100,
					damping: 25,
					mass: 4,
				},
			}}
			whileHover={
				isActive
					? {
							scale: position.scale * 1.02,
						}
					: {
							scale: position.scale * 1.05,
						}
			}
		>
			<motion.button
				onClick={onClick}
				className={`rounded-4xl group cursor-pointer relative overflow-hidden ${
					isActive ? 'glass-card w-[min(90vw,450px)] h-[min(90vw,450px)]' : 'p-0 w-[min(70vw,380px)] h-[min(70vw,380px)]'
				}`}
				style={
					!isActive
						? {
								background: theme === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.15)',
								backdropFilter: 'blur(8px) saturate(150%)',
								WebkitBackdropFilter: 'blur(8px) saturate(150%)',
								border: theme === 'dark' ? '0.5px solid rgba(255, 255, 255, 0.1)' : '0.5px solid rgba(255, 255, 255, 0.3)',
								boxShadow: theme === 'dark' ? '0 4px 16px rgba(0, 0, 0, 0.25)' : '0 4px 16px rgba(0, 0, 0, 0.7)',
								padding: 0,
							}
						: undefined
				}
				whileTap={{ scale: 0.98 }}
			>
				{frontImage ? (
					<>
						{/* 활성 카드 배경 이미지 - 꽉 채우기 (blur 효과로 텍스트 가독성 향상) */}
						<div
							className="w-[min(90vw,450px)] h-[min(90vw,450px)] rounded-4xl overflow-hidden"
							style={{
								filter: isActive ? (theme === 'light' ? 'blur(15px) brightness(0.7) contrast(0.7)' : 'blur(15px) brightness(0.2) contrast(0.9)') : 'none',
								transition: 'filter 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
								transform: 'scale(1.05)',
								position: 'absolute',
								top: 0,
								left: 0,
								zIndex: isActive ? 0 : -1,
							}}
						>
							{frontImage}
						</div>
						{/* 반투명 레이어 - 이미지 위에 */}
						{isActive && (
							<div
								className="absolute inset-0 z-1 rounded-4xl"
								style={{
									background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.5)',
								}}
							/>
						)}
					</>
				) : (
					<>
						{/* 비활성 카드 배경 - 이미지 꽉 채우기 */}
						{backImage ? (
							<div className="w-full h-full rounded-4xl overflow-hidden">{backImage}</div>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500 to-primary-700 rounded-4xl overflow-hidden">
								<div className="text-6xl md:text-8xl opacity-80">🎵</div>
							</div>
						)}
					</>
				)}
			</motion.button>
			{/* 활성 카드 콘텐츠 - 버튼 밖으로 분리하여 최상위 레이어에 배치 */}
			{frontImage && (
				<AnimatePresence mode="wait">
					{showContent && isActive && (
						<motion.div
							key="card-content"
							className="absolute flex items-center justify-center text-center p-8 md:p-12 rounded-4xl cursor-pointer"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.5, ease: 'easeInOut' }}
							whileTap={{ scale: 0.98 }}
							onClick={onClick}
							style={{
								top: 0,
								left: 0,
								width: 'min(90vw, 450px)',
								height: 'min(90vw, 450px)',
								zIndex: 1000,
								pointerEvents: 'auto',
							}}
						>
							<div className="w-full">
								<div>{children}</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			)}
		</motion.div>
	);
};

export default CarouselCard;
