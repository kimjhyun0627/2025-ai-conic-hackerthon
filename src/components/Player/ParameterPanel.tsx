import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, LayoutList, ChevronUp, ChevronDown } from 'lucide-react';
import { ParameterSlider } from './ParameterSlider';
import type { CategoryParameter } from '../../types';
import { PLAYER_ANIMATIONS, PLAYER_STYLES } from '../../constants/playerConstants';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getParameterPanelStyle, getCommonParamPanelStyle, getCommonParamButtonStyle } from '../../utils/playerStyleUtils';

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
	const [removingButtonIds, setRemovingButtonIds] = useState<Set<string>>(new Set());
	const [shouldHidePanel, setShouldHidePanel] = useState(false);
	const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
	const [initialWindowHeight, setInitialWindowHeight] = useState(0);
	const [windowHeight, setWindowHeight] = useState(0);
	const [currentStartIndex, setCurrentStartIndex] = useState(0);
	const [prevStartIndex, setPrevStartIndex] = useState(0);
	const [indicatorRight, setIndicatorRight] = useState<string>('1rem');
	const [indicatorTop, setIndicatorTop] = useState<string>('50%');
	const panelRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const carouselRef = useRef<HTMLDivElement>(null);

	// 초기 화면 높이 추적 (너비 계산용, 한 번만 설정)
	useEffect(() => {
		if (initialWindowHeight === 0) {
			setInitialWindowHeight(window.innerHeight);
		}
	}, [initialWindowHeight]);

	// 현재 화면 높이 추적 (반응형)
	useEffect(() => {
		const handleResize = () => {
			setWindowHeight(window.innerHeight);
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// 인디케이터 위치 계산 (패널 오른쪽 바깥 거리 조정)
	const INDICATOR_OFFSET_FROM_PANEL = 28; // px 단위 - 이 값을 조정하여 패널 오른쪽 바깥에서의 거리 변경
	useEffect(() => {
		if (panelRef.current && carouselRef.current && orientation === 'horizontal' && isExpanded) {
			const updateIndicatorPosition = () => {
				const panelRect = panelRef.current?.getBoundingClientRect();
				const carouselRect = carouselRef.current?.getBoundingClientRect();
				if (panelRect && carouselRect) {
					const panelRight = panelRect.right;
					// 패널 오른쪽 바깥에서 INDICATOR_OFFSET_FROM_PANEL만큼 떨어진 위치
					const indicatorRightPosition = window.innerWidth - panelRight - INDICATOR_OFFSET_FROM_PANEL;
					setIndicatorRight(`${indicatorRightPosition}px`);

					// 캐러셀 영역의 수직 가운데 위치 계산 (정확한 중앙)
					const carouselCenter = carouselRect.top + carouselRect.height / 2;
					setIndicatorTop(`${carouselCenter}px`);
				}
			};
			updateIndicatorPosition();

			// 위치 업데이트를 위한 이벤트 리스너
			window.addEventListener('resize', updateIndicatorPosition);
			window.addEventListener('scroll', updateIndicatorPosition);

			// 캐러셀 내용 변경 시에도 위치 업데이트
			const observer = new MutationObserver(updateIndicatorPosition);
			if (carouselRef.current) {
				observer.observe(carouselRef.current, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ['style', 'class'],
				});
			}

			// requestAnimationFrame을 사용하여 더 부드러운 업데이트
			let rafId: number;
			const scheduleUpdate = () => {
				if (rafId) cancelAnimationFrame(rafId);
				rafId = requestAnimationFrame(updateIndicatorPosition);
			};

			window.addEventListener('resize', scheduleUpdate);
			window.addEventListener('scroll', scheduleUpdate);

			return () => {
				window.removeEventListener('resize', updateIndicatorPosition);
				window.removeEventListener('scroll', updateIndicatorPosition);
				window.removeEventListener('resize', scheduleUpdate);
				window.removeEventListener('scroll', scheduleUpdate);
				observer.disconnect();
				if (rafId) cancelAnimationFrame(rafId);
			};
		}
	}, [orientation, isExpanded, currentStartIndex]);

	// 가로 모드에서 초기 화면 높이에 비례한 maxWidth 계산 (초기 높이의 80% 정도, 이후 고정)
	const horizontalMaxWidth = initialWindowHeight > 0 ? initialWindowHeight * 0.8 : 960;

	// 세로 모드에서 모든 파라미터 합치기
	const allParams = [...themeBaseParams, ...themeAdditionalParams, ...activeCommonParams];
	const totalParamsCount = allParams.length;
	const shouldUseTwoRows = orientation === 'vertical' && totalParamsCount >= 6;

	// 화면 높이에 따른 표시 개수 결정 (최대 3개)
	const getVisibleCount = (height: number): number => {
		if (height === 0) return 1; // 초기값
		// 높이에 따른 구간별 표시 개수 (최대 3개)
		if (height < 600) return 1; // 매우 작은 화면
		if (height < 800) return 2; // 작은 화면
		return 3; // 중간 이상 화면 (최대 3개)
	};

	const visibleCount = getVisibleCount(windowHeight);

	// 캐러셀 네비게이션 함수 (한 칸씩 이동, 무한 순환)
	const nextParam = () => {
		if (allParams.length === 0) return;
		setCurrentStartIndex((prev) => {
			setPrevStartIndex(prev);
			return (prev + 1) % allParams.length;
		});
	};

	const prevParam = () => {
		if (allParams.length === 0) return;
		setCurrentStartIndex((prev) => {
			setPrevStartIndex(prev);
			return (prev - 1 + allParams.length) % allParams.length;
		});
	};

	// 현재 표시할 파라미터들 (슬라이딩 윈도우)
	const getCurrentParams = () => {
		if (allParams.length === 0) return [];
		const params: CategoryParameter[] = [];
		for (let i = 0; i < visibleCount; i++) {
			const index = (currentStartIndex + i) % allParams.length;
			params.push(allParams[index]);
		}
		return params;
	};

	// 2행일 때 상단/하단 분할
	const getRowSplit = (count: number): [number, number] => {
		if (count <= 5) return [count, 0];
		if (count === 6) return [3, 3];
		if (count === 7) return [4, 3];
		if (count === 8) return [4, 4];
		if (count === 9) return [5, 4];
		if (count === 10) return [5, 5];
		// 10개 이상
		const topCount = Math.ceil(count / 2);
		return [topCount, count - topCount];
	};

	const [topRowCount] = shouldUseTwoRows ? getRowSplit(totalParamsCount) : [totalParamsCount, 0];

	const handleButtonClick = (param: CategoryParameter) => {
		const isLastButton = availableCommonParams.length === 1;
		setRemovingButtonIds((prev) => new Set(prev).add(param.id));

		if (isLastButton) {
			// 마지막 버튼인 경우: 버튼 애니메이션(0.3초) 완료 후 컨테이너 exit 애니메이션 시작
			setTimeout(() => {
				setShouldHidePanel(true);
				// exit 애니메이션(0.3초)이 시작되도록 약간의 딜레이 후 파라미터 추가
				setTimeout(() => {
					onAddCommonParam(param.id);
					// exit 애니메이션이 완료된 후 상태 리셋
					setTimeout(() => {
						setRemovingButtonIds((prev) => {
							const next = new Set(prev);
							next.delete(param.id);
							return next;
						});
						setShouldHidePanel(false);
					}, 300); // exit 애니메이션 지속 시간
				}, 50);
			}, 300); // 버튼 애니메이션 지속 시간
		} else {
			onAddCommonParam(param.id);
			setTimeout(() => {
				setRemovingButtonIds((prev) => {
					const next = new Set(prev);
					next.delete(param.id);
					return next;
				});
			}, 300);
		}
	};

	return (
		<>
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						ref={panelRef}
						layout={orientation === 'vertical' ? 'size' : true}
						className={PLAYER_STYLES.parameterPanel}
						style={{
							...getParameterPanelStyle(colors, orientation),
							...(orientation === 'vertical'
								? {
										width: '100%',
										right: undefined,
										transform: 'translateX(-50%)',
										x: 0, // Framer Motion x를 0으로 설정하여 transform과 분리
									}
								: {}),
						}}
						initial={{
							...PLAYER_ANIMATIONS.parameterPanel.initial,
							...(orientation === 'vertical'
								? {
										x: 0,
									}
								: {}),
						}}
						animate={{
							...PLAYER_ANIMATIONS.parameterPanel.animate,
							...(orientation === 'vertical'
								? {
										x: 0,
									}
								: {}),
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
							layout={orientation === 'vertical' ? 'size' : true}
							className={orientation === 'vertical' ? '' : 'w-full mx-auto'}
							style={{
								...(orientation === 'vertical'
									? {
											width: '100%',
										}
									: {
											maxWidth: `${horizontalMaxWidth}px`,
											display: 'flex',
											flexDirection: 'column',
										}),
							}}
							transition={{
								layout: {
									duration: 0.6,
									ease: [0.4, 0, 0.2, 1],
								},
							}}
						>
							{/* 캐러셀 파라미터 영역 (가로 모드만) */}
							{orientation === 'horizontal' && allParams.length > 0 && (
								<motion.div
									layout
									className="flex flex-col items-center gap-4 mb-4"
									style={{
										width: '100%',
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
										{/* 상단 네비게이션 버튼 (절반 겹침) */}
										{allParams.length > 0 && (
											<motion.button
												onClick={prevParam}
												className="absolute btn-glass p-2 md:p-3 rounded-full hover:glow-primary transition-all shadow-lg z-10"
												aria-label="이전 파라미터"
												whileHover={{ scale: 1.1, rotate: -5 }}
												whileTap={{ scale: 0.95 }}
												transition={{ type: 'spring', stiffness: 400, damping: 17 }}
												style={{
													color: colors.isDark ? '#f1f5f9' : '#1e293b',
													top: '-20px', // 절반 겹치도록
													left: '50%',
													transform: 'translateX(-50%)',
												}}
											>
												<ChevronUp
													className="w-4 h-4 md:w-5 md:h-5"
													style={{ color: 'inherit' }}
												/>
											</motion.button>
										)}

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
											<div className="relative w-full overflow-hidden">
												<AnimatePresence mode="wait">
													<motion.div
														key={`params-${currentStartIndex}`}
														initial={{
															opacity: 0,
															y: (() => {
																const direction = currentStartIndex - prevStartIndex;
																// 원형 구조 고려
																if (Math.abs(direction) > allParams.length / 2) {
																	return direction > 0 ? -50 : 50;
																}
																return direction > 0 ? 50 : -50;
															})(),
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														exit={{
															opacity: 0,
															y: (() => {
																const direction = currentStartIndex - prevStartIndex;
																// 원형 구조 고려
																if (Math.abs(direction) > allParams.length / 2) {
																	return direction > 0 ? 50 : -50;
																}
																return direction > 0 ? -50 : 50;
															})(),
														}}
														transition={{
															type: 'spring',
															stiffness: 300,
															damping: 30,
														}}
														className="w-full flex flex-col gap-4"
													>
														{getCurrentParams().map((param, index) => {
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
																		orientation={orientation}
																	/>
																</div>
															);
														})}
													</motion.div>
												</AnimatePresence>
											</div>
										</div>

										{/* 하단 네비게이션 버튼 (절반 겹침) */}
										{allParams.length > 0 && (
											<motion.button
												onClick={nextParam}
												className="absolute btn-glass p-2 md:p-3 rounded-full hover:glow-primary transition-all shadow-lg z-10"
												aria-label="다음 파라미터"
												whileHover={{ scale: 1.1, rotate: 5 }}
												whileTap={{ scale: 0.95 }}
												transition={{ type: 'spring', stiffness: 400, damping: 17 }}
												style={{
													color: colors.isDark ? '#f1f5f9' : '#1e293b',
													bottom: '-20px', // 절반 겹치도록
													left: '50%',
													transform: 'translateX(-50%)',
												}}
											>
												<ChevronDown
													className="w-4 h-4 md:w-5 md:h-5"
													style={{ color: 'inherit' }}
												/>
											</motion.button>
										)}
									</div>
								</motion.div>
							)}

							{/* 세로 모드 또는 전체 레이아웃 컨테이너 */}
							<motion.div
								layout={orientation === 'vertical' ? 'size' : true}
								className="flex flex-col gap-4"
								style={{
									width: orientation === 'vertical' ? '100%' : undefined,
									...(orientation === 'horizontal' ? { flexShrink: 0 } : {}),
									paddingLeft: '0.5rem',
									paddingRight: '0.5rem',
								}}
								transition={{
									layout: {
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
											gridTemplateColumns: shouldUseTwoRows ? `repeat(${topRowCount}, minmax(0, 1fr))` : `repeat(${totalParamsCount}, minmax(0, 1fr))`,
											gridTemplateRows: shouldUseTwoRows ? 'repeat(2, auto)' : 'repeat(1, auto)',
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
								<AnimatePresence mode="popLayout">
									{availableCommonParams.length > 0 && !shouldHidePanel && (
										<motion.div
											layout="size"
											initial={{
												opacity: 0,
												y: -20,
												scale: 0.95,
											}}
											animate={{
												opacity: 1,
												y: 0,
												scale: 1,
											}}
											exit={{
												opacity: 0,
												y: 20,
												scale: 0.95,
											}}
											className="glass-card rounded-2xl overflow-hidden"
											style={{
												...getCommonParamPanelStyle(colors),
												padding: '1rem 1.25rem',
												marginTop: '2.5rem',
												...(orientation === 'vertical'
													? {
															width: '100%',
															minWidth: '100%',
														}
													: {}),
											}}
											transition={{
												layout: {
													duration: 0.4,
													ease: [0.4, 0, 0.2, 1],
												},
												opacity: {
													duration: 0.4,
													ease: [0.4, 0, 0.2, 1],
												},
												y: {
													duration: 0.4,
													ease: [0.4, 0, 0.2, 1],
												},
												scale: {
													duration: 0.4,
													ease: [0.4, 0, 0.2, 1],
												},
											}}
										>
											<div className="flex flex-wrap gap-2">
												<AnimatePresence mode="popLayout">
													{availableCommonParams.map((param) => {
														const isRemoving = removingButtonIds.has(param.id);
														return (
															<motion.button
																key={param.id}
																layout
																onClick={() => handleButtonClick(param)}
																initial={{ opacity: 0, scale: 0.9 }}
																animate={isRemoving ? { opacity: 0, scale: 0.8, width: 0, paddingLeft: 0, paddingRight: 0, marginRight: 0 } : { opacity: 1, scale: 1 }}
																exit={{ opacity: 0, scale: 0.8, width: 0, paddingLeft: 0, paddingRight: 0, marginRight: 0 }}
																transition={{
																	layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
																	opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
																	scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
																	width: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
																	paddingLeft: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
																	paddingRight: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
																	marginRight: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
																}}
																whileHover={isRemoving ? {} : { scale: 1.05 }}
																whileTap={isRemoving ? {} : { scale: 0.95 }}
																className="flex items-center gap-2 px-3 py-2 rounded-lg overflow-hidden"
																style={getCommonParamButtonStyle(colors)}
															>
																<Plus
																	className="w-4 h-4 shrink-0"
																	style={{ color: colors.iconColor }}
																/>
																<span
																	className="text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
																	style={{ color: colors.textMutedColor }}
																>
																	{param.nameKo}
																</span>
															</motion.button>
														);
													})}
												</AnimatePresence>
											</div>
										</motion.div>
									)}
								</AnimatePresence>

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
				{isExpanded && orientation === 'horizontal' && allParams.length > 0 && (
					<motion.div
						key="indicator-container"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{
							type: 'spring',
							stiffness: 300,
							damping: 25,
						}}
						className="fixed flex flex-col items-center justify-center gap-1.5"
						style={{
							right: indicatorRight,
							top: indicatorTop,
							transform: 'translateY(-50%)',
							zIndex: 100,
							pointerEvents: 'auto',
						}}
					>
						<AnimatePresence mode="popLayout">
							{Array.from({ length: allParams.length }).map((_, paramIndex) => {
								// 현재 보여지는 범위 계산
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
									if (visibleCount === 0) return false;
									if (firstVisibleIndex <= lastVisibleIndex) {
										// 일반적인 경우 (원형이 아닌)
										return paramIndex >= firstVisibleIndex && paramIndex <= lastVisibleIndex;
									} else {
										// 원형 구조 (끝에서 처음으로 넘어가는 경우)
										return paramIndex >= firstVisibleIndex || paramIndex <= lastVisibleIndex;
									}
								})();

								const isActive = isInVisibleRange && isContinuous;

								return (
									<motion.button
										key={paramIndex}
										initial={{ opacity: 0, scale: 0.5, y: -10 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.5, y: 10 }}
										transition={{
											type: 'spring',
											stiffness: 400,
											damping: 25,
											delay: paramIndex * 0.03, // 순차적으로 나타나도록
										}}
										onClick={() => {
											setPrevStartIndex(currentStartIndex);
											setCurrentStartIndex(paramIndex);
										}}
										className="relative group px-3 py-0.5 border-0 outline-none focus:outline-none bg-transparent cursor-pointer min-w-[32px] flex items-center justify-center"
										aria-label={`${paramIndex + 1}번째 파라미터`}
									>
										<motion.div
											className="rounded-full transition-all"
											style={{
												width: '8px',
												height: '8px',
												backgroundColor: colors.isDark ? 'rgba(241, 245, 249, 1)' : 'rgba(30, 41, 59, 1)',
												opacity: isActive ? 0.9 : 0.3, // 활성: 덜 투명, 비활성: 더 투명
												backdropFilter: 'blur(4px)',
												WebkitBackdropFilter: 'blur(4px)',
												boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.1)',
											}}
											whileHover={{
												scale: 1.3,
												opacity: isActive ? 1 : 0.5,
											}}
											transition={{
												type: 'spring',
												stiffness: 400,
												damping: 30,
											}}
										/>
									</motion.button>
								);
							})}
						</AnimatePresence>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};
