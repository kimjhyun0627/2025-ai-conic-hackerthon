import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CategoryParameter } from '@/shared/types';
import { useThemeColors } from '@/shared/hooks';
import { PLAYER_CONSTANTS } from '../../../constants';

interface ParameterIndicatorProps {
	allParams: CategoryParameter[];
	currentStartIndex: number;
	visibleCount: number;
	indicatorLeft: string;
	indicatorTop: string;
	onIndicatorClick: (paramIndex: number) => void;
}

export const ParameterIndicator = ({ allParams, currentStartIndex, visibleCount, onIndicatorClick }: ParameterIndicatorProps) => {
	const colors = useThemeColors();
	const [hoveredParamIndex, setHoveredParamIndex] = useState<number | null>(null);

	return (
		<motion.div
			layout
			className="flex flex-col items-center justify-center gap-1.5"
			transition={{
				layout: {
					duration: 0.6,
					ease: [0.4, 0, 0.2, 1],
				},
			}}
		>
			<AnimatePresence mode="popLayout">
				{Array.from({ length: allParams.length }).map((_, paramIndex) => {
					// 현재 보여지는 범위 계산 (반응형)
					const isInVisibleRange = (() => {
						for (let i = 0; i < visibleCount; i++) {
							const idx = (currentStartIndex + i) % allParams.length;
							if (idx === paramIndex) return true;
						}
						return false;
					})();

					// 현재 보여지는 범위의 첫 번째와 마지막 인덱스
					const firstVisibleIndex = currentStartIndex % allParams.length;
					const lastVisibleIndex = (currentStartIndex + visibleCount - 1) % allParams.length;

					// 연속된 범위인지 확인 (원형 구조 고려)
					const isContinuous = (() => {
						if (firstVisibleIndex <= lastVisibleIndex) {
							// 일반적인 경우 (원형이 아닌)
							return paramIndex >= firstVisibleIndex && paramIndex <= lastVisibleIndex;
						} else {
							// 원형 구조 (끝에서 처음으로 넘어가는 경우)
							return paramIndex >= firstVisibleIndex || paramIndex <= lastVisibleIndex;
						}
					})();

					const isActive = isInVisibleRange && isContinuous;

					const param = allParams[paramIndex];
					const isHovered = hoveredParamIndex === paramIndex;

					return (
						<motion.button
							key={param.id}
							layout
							initial={{
								opacity: 0,
								scale: PLAYER_CONSTANTS.PARAMETER.INDICATOR_ANIMATION.scale.initial,
								y: PLAYER_CONSTANTS.PARAMETER.INDICATOR_ANIMATION.y.initial,
							}}
							animate={{
								opacity: 1,
								scale: PLAYER_CONSTANTS.PARAMETER.INDICATOR_ANIMATION.scale.animate,
								y: PLAYER_CONSTANTS.PARAMETER.INDICATOR_ANIMATION.y.animate,
							}}
							exit={{
								opacity: 0,
								scale: PLAYER_CONSTANTS.PARAMETER.INDICATOR_ANIMATION.scale.exit,
								y: PLAYER_CONSTANTS.PARAMETER.INDICATOR_ANIMATION.y.exit,
							}}
							transition={{
								...PLAYER_CONSTANTS.PARAMETER.INDICATOR_ANIMATION.spring,
								delay: paramIndex * 0.03, // 순차적으로 나타나도록
								layout: {
									duration: 0.6,
									ease: [0.4, 0, 0.2, 1],
								},
							}}
							onClick={() => onIndicatorClick(paramIndex)}
							onMouseEnter={() => setHoveredParamIndex(paramIndex)}
							onMouseLeave={() => setHoveredParamIndex(null)}
							className="relative group px-3 py-0.5 border-0 outline-none focus:outline-none bg-transparent cursor-pointer min-w-[32px] flex items-center justify-center"
							aria-label={`${param.nameKo} 파라미터`}
						>
							<motion.div
								className="rounded-full transition-all"
								style={{
									width: '8px',
									height: '8px',
									backgroundColor: isActive ? 'rgba(251, 113, 133, 0.7)' : colors.isDark ? 'rgba(30, 41, 59, 0.25)' : 'rgba(241, 245, 249, 0.6)',
									border: `1px solid ${!isActive ? (colors.isDark ? 'rgba(241, 245, 249, 0.6)' : 'transparent') : 'transparent'}`,
									backdropFilter: 'blur(4px)',
									WebkitBackdropFilter: 'blur(4px)',
									boxShadow: isActive ? '0 2px 8px rgba(251, 113, 133, 0.4)' : '0 1px 4px rgba(0, 0, 0, 0.1)',
								}}
								whileHover={{
									scale: 1.3,
									opacity: isActive ? 0.7 : 0.5,
									backgroundColor: isActive ? '#f43f5e' : undefined, // 호버 시 더 진한 로즈
								}}
								transition={{
									type: 'spring',
									stiffness: 400,
									damping: 30,
								}}
							/>
							{/* 툴팁 */}
							<AnimatePresence>
								{isHovered && param && (
									<motion.div
										initial={{ opacity: 0, scale: 0.8, x: -5 }}
										animate={{ opacity: 1, scale: 1, x: 0 }}
										exit={{ opacity: 0, scale: 0.8, x: -5 }}
										transition={{
											type: 'spring',
											stiffness: 400,
											damping: 25,
										}}
										className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 text-xs font-medium pointer-events-none rounded-md backdrop-blur-md"
										style={{
											color: colors.isDark ? '#f1f5f9' : '#1e293b',
											background: colors.isDark ? 'rgba(28, 25, 23, 0.7)' : 'rgba(254, 248, 242, 0.7)',
											border: `1px solid ${colors.glassBorder}`,
											zIndex: 101,
										}}
									>
										{param.nameKo}
									</motion.div>
								)}
							</AnimatePresence>
						</motion.button>
					);
				})}
			</AnimatePresence>
		</motion.div>
	);
};
