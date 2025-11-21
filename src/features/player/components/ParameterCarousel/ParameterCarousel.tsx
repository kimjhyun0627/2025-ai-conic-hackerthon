import type { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { CategoryParameter } from '@/shared/types';
import { ParameterSlider } from '../ParameterSlider';
import { useThemeColors } from '@/shared/hooks';
import { PLAYER_CONSTANTS, type NavigationDirection } from '../../constants';

interface ParameterCarouselProps {
	carouselRef: RefObject<HTMLDivElement | null>;
	currentParams: CategoryParameter[];
	currentStartIndex: number;
	allParams: CategoryParameter[];
	navigationDirectionRef: React.MutableRefObject<NavigationDirection>;
	horizontalMaxWidth: number;
	themeAdditionalParams: CategoryParameter[];
	activeCommonParams: CategoryParameter[];
	getParamValue: (paramId: string) => number;
	setParamValue: (paramId: string, value: number) => void;
	onRemoveThemeParam: (paramId: string) => void;
	onRemoveCommonParam: (paramId: string) => void;
	onPrev: () => void;
	onNext: () => void;
}

export const ParameterCarousel = ({
	carouselRef,
	currentParams,
	currentStartIndex,
	allParams,
	navigationDirectionRef,
	horizontalMaxWidth,
	themeAdditionalParams,
	activeCommonParams,
	getParamValue,
	setParamValue,
	onRemoveThemeParam,
	onRemoveCommonParam,
	onPrev,
	onNext,
}: ParameterCarouselProps) => {
	const colors = useThemeColors();

	return (
		<div
			className="relative flex flex-col items-center gap-4 mb-4"
			style={{ width: '100%', maxWidth: `${horizontalMaxWidth}px`, margin: '1.5rem auto 0 auto' }}
		>
			<motion.div
				layout
				className="flex flex-col items-center gap-4 w-full"
				style={{
					maxWidth: `${horizontalMaxWidth}px`,
					margin: '0 auto',
				}}
				transition={{
					layout: {
						duration: 0.6,
						ease: [0.4, 0, 0.2, 1],
					},
				}}
			>
				{/* 캐러셀 컨테이너와 인디케이터를 나란히 배치 */}
				<div className="relative flex items-start justify-center w-full">
					{/* 캐러셀 컨테이너 */}
					<div
						ref={carouselRef}
						className="relative flex flex-col items-center justify-center overflow-visible rounded-2xl gap-4 w-full"
						style={{
							minHeight: '200px',
							// 파라미터 추가 블록과 너비 맞추기
							// 파라미터 추가 블록: 세로 모드 컨테이너(0.5rem) + 블록 자체(1.25rem) = 1.75rem
							// 캐러셀 컨테이너: 파라미터 패널(1rem) + 컨테이너 자체 = 1.75rem이 되려면 0.75rem 필요
							padding: '1rem 0.7rem', // 상하 1rem, 좌우 0.7rem
						}}
					>
						{/* 상단 네비게이션 버튼 (절반 겹침) */}
						<motion.button
							onClick={onPrev}
							className="btn-glass p-2 md:p-3 rounded-full hover:glow-primary transition-all shadow-lg z-10"
							aria-label="이전 파라미터"
							whileHover={{ scale: 1.1, rotate: -5 }}
							whileTap={{ scale: 0.95 }}
							transition={{ type: 'spring', stiffness: 400, damping: 17 }}
							style={{
								color: colors.isDark ? '#f1f5f9' : '#1e293b',
								position: 'absolute',
								top: '-10px',
								left: '50%',
								x: '-50%', // Framer Motion의 x 속성 사용 (transform과 분리)
								pointerEvents: 'auto',
							}}
							layout={false}
						>
							<ChevronUp
								className="w-4 h-4 md:w-5 md:h-5"
								style={{ color: 'inherit' }}
							/>
						</motion.button>
						{/* 하단 네비게이션 버튼 (절반 겹침) */}
						<motion.button
							onClick={onNext}
							className="btn-glass p-2 md:p-3 rounded-full hover:glow-primary transition-all shadow-lg z-10"
							aria-label="다음 파라미터"
							whileHover={{ scale: 1.1, rotate: 5 }}
							whileTap={{ scale: 0.95 }}
							transition={{ type: 'spring', stiffness: 400, damping: 17 }}
							style={{
								color: colors.isDark ? '#f1f5f9' : '#1e293b',
								position: 'absolute',
								bottom: '-10px',
								left: '50%',
								x: '-50%', // Framer Motion의 x 속성 사용 (transform과 분리)
								pointerEvents: 'auto',
							}}
							layout={false}
						>
							<ChevronDown
								className="w-4 h-4 md:w-5 md:h-5"
								style={{ color: 'inherit' }}
							/>
						</motion.button>
						<div className="relative w-full overflow-visible">
							<AnimatePresence mode="wait">
								<motion.div
									key={`params-${currentStartIndex}`}
									initial={{
										opacity: 0,
										y: (() => {
											const dir = navigationDirectionRef.current;
											// 위 버튼(up): 새 블록이 위에서 내려옴, 아래 버튼(down): 새 블록이 아래에서 올라옴
											if (dir === 'up') return PLAYER_CONSTANTS.PARAMETER.CAROUSEL_ANIMATION.initialY.up;
											if (dir === 'down') return PLAYER_CONSTANTS.PARAMETER.CAROUSEL_ANIMATION.initialY.down;
											return PLAYER_CONSTANTS.PARAMETER.CAROUSEL_ANIMATION.initialY.default;
										})(),
									}}
									animate={{
										opacity: 1,
										y: 0,
									}}
									exit={{
										opacity: 0,
										y: (() => {
											const dir = navigationDirectionRef.current;
											// 위 버튼(up): 기존 블록이 아래로 사라짐, 아래 버튼(down): 기존 블록이 위로 사라짐
											if (dir === 'up') return PLAYER_CONSTANTS.PARAMETER.CAROUSEL_ANIMATION.exitY.up;
											if (dir === 'down') return PLAYER_CONSTANTS.PARAMETER.CAROUSEL_ANIMATION.exitY.down;
											return PLAYER_CONSTANTS.PARAMETER.CAROUSEL_ANIMATION.exitY.default;
										})(),
									}}
									transition={PLAYER_CONSTANTS.PARAMETER.CAROUSEL_ANIMATION.spring}
									className="w-full flex flex-col gap-4"
								>
									{currentParams.map((param, index) => {
										const isRemovable = themeAdditionalParams.some((p) => p.id === param.id) || activeCommonParams.some((p) => p.id === param.id);

										return (
											<div
												key={`${param.id}-${(currentStartIndex + index) % allParams.length}`}
												className="w-full"
											>
												<ParameterSlider
													param={param}
													value={getParamValue(param.id)}
													onChange={(value: number) => setParamValue(param.id, value)}
													onRemove={
														isRemovable
															? themeAdditionalParams.some((p) => p.id === param.id)
																? () => onRemoveThemeParam(param.id)
																: () => onRemoveCommonParam(param.id)
															: undefined
													}
													isRemovable={isRemovable}
													orientation="horizontal"
												/>
											</div>
										);
									})}
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};
