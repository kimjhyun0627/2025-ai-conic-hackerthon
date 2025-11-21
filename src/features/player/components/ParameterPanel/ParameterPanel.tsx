import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { ParameterSlider } from '../ParameterSlider';
import { ParameterCarousel } from '../ParameterCarousel';
import { ParameterIndicator } from '../ParameterIndicator';
import { CommonParamButtons } from '../CommonParamButtons';
import type { CategoryParameter } from '@/shared/types';
import { PLAYER_ANIMATIONS, PLAYER_STYLES } from '../../constants';
import { useThemeColors } from '@/shared/hooks';
import { useWindowHeight } from '../../hooks';
import { useIndicatorPosition } from '../../hooks';
import { useParameterCarousel } from '../../hooks';
import { getParameterPanelStyle } from '../../utils';
import { getRowSplit, shouldUseTwoRows } from '../../utils';

interface ParameterPanelProps {
	isExpanded: boolean;
	themeBaseParams: CategoryParameter[];
	themeAdditionalParams: CategoryParameter[];
	activeCommonParams: CategoryParameter[];
	availableCommonParams: CategoryParameter[];
	getParamValue: (paramId: string) => number;
	setParamValue: (paramId: string, value: number) => void;
	onRemoveThemeParam: (paramId: string) => void;
	onRemoveCommonParam: (paramId: string) => void;
	onAddCommonParam: (paramId: string) => void;
}

export const ParameterPanel = ({
	isExpanded,
	themeBaseParams,
	themeAdditionalParams,
	activeCommonParams,
	availableCommonParams,
	getParamValue,
	setParamValue,
	onRemoveThemeParam,
	onRemoveCommonParam,
	onAddCommonParam,
}: ParameterPanelProps) => {
	const colors = useThemeColors();
	const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
	const [shouldShowIndicator, setShouldShowIndicator] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const carouselRef = useRef<HTMLDivElement>(null);

	// 윈도우 높이 및 가로 모드 최대 너비 계산
	const { horizontalMaxWidth } = useWindowHeight();

	// 세로 모드에서 모든 파라미터 합치기
	const allParams = [...themeBaseParams, ...themeAdditionalParams, ...activeCommonParams];
	const totalParamsCount = allParams.length;
	const shouldUseTwoRowsLayout = shouldUseTwoRows(totalParamsCount);

	// 캐러셀 로직
	const { currentStartIndex, visibleCount, navigationDirectionRef, nextParam, prevParam, getCurrentParams, goToIndex } = useParameterCarousel({
		allParams,
		themeBaseParams,
		themeAdditionalParams,
		activeCommonParams,
		orientation,
	});

	// 인디케이터 위치 계산
	const { indicatorLeft, indicatorTop } = useIndicatorPosition({
		panelRef,
		carouselRef,
		orientation,
		isExpanded,
		currentStartIndex,
		allParamsLength: allParams.length,
	});

	// 2행일 때 상단/하단 분할
	const [topRowCount] = shouldUseTwoRowsLayout ? getRowSplit(totalParamsCount) : [totalParamsCount, 0];

	// 현재 표시할 파라미터들 (가로 모드용)
	const currentParams = getCurrentParams();

	// 인디케이터 표시 지연: 패널 애니메이션이 완료된 후 표시 (0.6초 후)
	useEffect(() => {
		if (isExpanded && orientation === 'horizontal' && allParams.length > 0) {
			// 이미 인디케이터가 표시되어 있으면 유지 (파라미터 추가 시에도 사라지지 않도록)
			if (shouldShowIndicator) {
				return;
			}
			// 패널 애니메이션 완료 후 인디케이터 표시
			const timer = setTimeout(() => {
				setShouldShowIndicator(true);
			}, 600); // layout 애니메이션 duration (0.6초)

			return () => {
				clearTimeout(timer);
			};
		} else {
			setShouldShowIndicator(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isExpanded, orientation]); // allParams.length는 의존성에서 제거하여 파라미터 추가 시에도 인디케이터가 유지되도록 함

	return (
		<>
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						ref={panelRef}
						layout
						className={PLAYER_STYLES.parameterPanel}
						style={{
							// 패널 자체는 가로/세로 모드 모두 동일한 위치/폭을 유지
							...getParameterPanelStyle(colors),
						}}
						initial={{
							...PLAYER_ANIMATIONS.parameterPanel.initial,
						}}
						animate={{
							...PLAYER_ANIMATIONS.parameterPanel.animate,
						}}
						exit={PLAYER_ANIMATIONS.parameterPanel.exit}
						transition={{
							...PLAYER_ANIMATIONS.parameterPanel.transition,
							layout: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
							height: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
							width: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
							...(orientation === 'vertical'
								? {
										x: {
											duration: 0,
										},
									}
								: {}),
						}}
					>
						<motion.div
							ref={contentRef}
							layout
							// 내부 컨텐츠 래퍼는 항상 패널 너비를 꽉 채우고,
							// 가로 모드일 때만 maxWidth로 내용 폭을 제한
							className="w-full mx-auto"
							style={{
								...(orientation === 'horizontal'
									? {
											maxWidth: `${horizontalMaxWidth}px`,
											display: 'flex',
											flexDirection: 'column',
										}
									: {}),
							}}
							transition={{
								layout: {
									duration: 0.6,
									ease: [0.4, 0, 0.2, 1],
								},
								width: {
									duration: 0.6,
									ease: [0.4, 0, 0.2, 1],
								},
							}}
						>
							{/* 캐러셀 파라미터 영역 (가로 모드만) */}
							{orientation === 'horizontal' && allParams.length > 0 && (
								<ParameterCarousel
									carouselRef={carouselRef}
									currentParams={currentParams}
									currentStartIndex={currentStartIndex}
									allParams={allParams}
									navigationDirectionRef={navigationDirectionRef}
									horizontalMaxWidth={horizontalMaxWidth}
									themeAdditionalParams={themeAdditionalParams}
									activeCommonParams={activeCommonParams}
									getParamValue={getParamValue}
									setParamValue={setParamValue}
									onRemoveThemeParam={onRemoveThemeParam}
									onRemoveCommonParam={onRemoveCommonParam}
									onPrev={prevParam}
									onNext={nextParam}
								/>
							)}

							{/* 세로 모드 또는 전체 레이아웃 컨테이너 */}
							<motion.div
								layout
								className="flex flex-col gap-4"
								style={{
									// 하단 공통 파라미터 영역과 모드 토글 버튼 영역이
									// 모드에 상관없이 동일한 폭/위치를 유지하도록 고정
									width: '100%',
									minWidth: '100%',
									paddingLeft: '0.5rem',
									paddingRight: '0.5rem',
								}}
								transition={{
									layout: {
										duration: 0.6,
										ease: [0.4, 0, 0.2, 1],
									},
									width: {
										duration: 0.6,
										ease: [0.4, 0, 0.2, 1],
									},
								}}
							>
								{/* 파라미터 그리드 (세로 모드만) */}
								{orientation === 'vertical' ? (
									<motion.div
										layout="size"
										style={{
											display: 'grid',
											gridTemplateColumns: shouldUseTwoRowsLayout ? `repeat(${topRowCount}, minmax(0, 1fr))` : `repeat(${totalParamsCount}, minmax(0, 1fr))`,
											gridTemplateRows: shouldUseTwoRowsLayout ? 'repeat(2, auto)' : 'repeat(1, auto)',
											gridAutoFlow: 'column',
											gap: '1rem',
											width: '100%',
										}}
										initial={PLAYER_ANIMATIONS.parameterGrid.initial}
										animate={PLAYER_ANIMATIONS.parameterGrid.animate}
										exit={PLAYER_ANIMATIONS.parameterGrid.exit}
										transition={{
											layout: {
												duration: 0.6,
												ease: [0.4, 0, 0.2, 1],
											},
											gridTemplateColumns: {
												duration: 0.6,
												ease: [0.4, 0, 0.2, 1],
											},
											gridTemplateRows: {
												duration: 0.6,
												ease: [0.4, 0, 0.2, 1],
											},
											opacity: {
												duration: 0.3,
												delay: 0.1,
											},
										}}
									>
										<AnimatePresence mode="popLayout">
											{allParams.map((param) => {
												const isRemovable = themeAdditionalParams.some((p) => p.id === param.id) || activeCommonParams.some((p) => p.id === param.id);
												return (
													<motion.div
														key={param.id}
														layout
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														exit={{ opacity: 0 }}
														style={{
															minWidth: '70px',
														}}
														transition={{
															layout: {
																duration: 0.6,
																ease: [0.4, 0, 0.2, 1],
															},
															opacity: {
																duration: 0.3,
																ease: [0.4, 0, 0.2, 1],
															},
														}}
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
															orientation={orientation}
														/>
													</motion.div>
												);
											})}
										</AnimatePresence>
									</motion.div>
								) : null}

								{/* 공통 파라미터 추가 버튼 - 항상 하단에 배치 */}
								<CommonParamButtons
									availableCommonParams={availableCommonParams}
									onAddCommonParam={onAddCommonParam}
								/>

								{/* 모드 토글 버튼 */}
								<motion.div
									layout
									className="w-full pt-4 border-t"
									style={{
										borderColor: colors.glassBorder,
										...(orientation === 'vertical'
											? {
													width: '100%',
													minWidth: '100%',
												}
											: {}),
									}}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 10 }}
									transition={{
										duration: 0.3,
										delay: 0.2,
									}}
								>
									<div className="flex items-center justify-center">
										<button
											onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
											className="p-2.5 md:p-3 rounded-full transition-all duration-200 glow-primary shadow-2xl relative overflow-hidden group hover:scale-110 active:scale-95"
											style={{
												background: colors.playButtonGradient,
											}}
											aria-label={orientation === 'horizontal' ? '세로 모드로 전환' : '가로 모드로 전환'}
										>
											<motion.div
												style={{
													position: 'absolute',
													inset: 0,
													background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
												}}
												animate={{ x: ['-100%', '200%'] }}
												transition={PLAYER_ANIMATIONS.playButtonShine.transition}
											/>
											<AnimatePresence mode="wait">
												{orientation === 'horizontal' ? (
													<motion.div
														key="grid"
														{...PLAYER_ANIMATIONS.playButtonIcon}
													>
														<LayoutGrid className="w-4 h-4 md:w-5 md:h-5 text-white fill-white relative z-10" />
													</motion.div>
												) : (
													<motion.div
														key="list"
														{...PLAYER_ANIMATIONS.playButtonIcon}
													>
														<LayoutList className="w-4 h-4 md:w-5 md:h-5 text-white fill-white relative z-10" />
													</motion.div>
												)}
											</AnimatePresence>
										</button>
									</div>
								</motion.div>
							</motion.div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
			{/* 인디케이터 (가장 바깥쪽 패널 밖의 공중에 떠 있게) */}
			<AnimatePresence>
				{shouldShowIndicator && (
					<motion.div
						key="indicator"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{
							opacity: 1,
							scale: 1,
							left: typeof indicatorLeft === 'number' ? indicatorLeft : indicatorLeft,
							top: typeof indicatorTop === 'number' ? indicatorTop : indicatorTop,
							y: '-50%', // 인디케이터 블록의 중앙이 top 위치에 오도록
						}}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{
							type: 'spring',
							stiffness: 300,
							damping: 25,
							left: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
							top: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
							y: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
						}}
						style={{
							position: 'fixed',
							left: typeof indicatorLeft === 'number' ? `${indicatorLeft}px` : indicatorLeft,
							top: typeof indicatorTop === 'number' ? `${indicatorTop}px` : indicatorTop,
							zIndex: 100,
							pointerEvents: 'auto',
						}}
					>
						<ParameterIndicator
							allParams={allParams}
							currentStartIndex={currentStartIndex}
							visibleCount={visibleCount}
							indicatorLeft={typeof indicatorLeft === 'number' ? `${indicatorLeft}px` : indicatorLeft}
							indicatorTop={typeof indicatorTop === 'number' ? `${indicatorTop}px` : indicatorTop}
							onIndicatorClick={goToIndex}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};
