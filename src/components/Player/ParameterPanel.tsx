import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, LayoutList } from 'lucide-react';
import { ParameterSection } from './ParameterSection';
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
	const panelRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	// 세로 모드에서 모든 파라미터 합치기
	const allParams = [...themeBaseParams, ...themeAdditionalParams, ...activeCommonParams];
	const totalParamsCount = allParams.length;
	const shouldUseTwoRows = orientation === 'vertical' && totalParamsCount >= 6;

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
						className={orientation === 'vertical' ? '' : 'w-full max-w-[960px] mx-auto'}
						style={{
							...(orientation === 'vertical'
								? {
										width: '100%',
									}
								: {}),
						}}
						transition={{
							layout: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
						}}
					>
						<motion.div
							layout={orientation === 'vertical' ? 'size' : true}
							className="flex flex-col gap-4"
							style={{
								width: orientation === 'vertical' ? '100%' : undefined,
							}}
							transition={{
								layout: {
									duration: 0.6,
									ease: [0.4, 0, 0.2, 1],
								},
							}}
						>
							{/* 파라미터 그리드 */}
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
													initial={{ opacity: 0, scale: 0.9 }}
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0.9 }}
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
														scale: {
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
							) : (
								<motion.div
									layout
									style={{
										display: 'grid',
										gap: '1rem',
										gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
									}}
									initial={PLAYER_ANIMATIONS.parameterGrid.initial}
									animate={PLAYER_ANIMATIONS.parameterGrid.animate}
									exit={PLAYER_ANIMATIONS.parameterGrid.exit}
									transition={{
										layout: {
											duration: 0.6,
											ease: [0.4, 0, 0.2, 1],
										},
										height: {
											duration: 0.6,
											ease: [0.4, 0, 0.2, 1],
										},
										opacity: {
											duration: 0.3,
											delay: 0.1,
										},
									}}
								>
									{/* 기본 파라미터 (테마별 처음 3개) */}
									<ParameterSection
										params={themeBaseParams}
										getParamValue={getParamValue}
										setParamValue={setParamValue}
										useLayoutAnimation={true}
										orientation={orientation}
									/>

									{/* 테마별 추가 파라미터 */}
									<ParameterSection
										params={themeAdditionalParams}
										getParamValue={getParamValue}
										setParamValue={setParamValue}
										onRemove={onRemoveThemeParam}
										isRemovable={true}
										useLayoutAnimation={true}
										orientation={orientation}
									/>

									{/* 활성화된 공통 파라미터 */}
									<ParameterSection
										params={activeCommonParams}
										getParamValue={getParamValue}
										setParamValue={setParamValue}
										onRemove={onRemoveCommonParam}
										isRemovable={true}
										useLayoutAnimation={true}
										orientation={orientation}
									/>
								</motion.div>
							)}

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
	);
};
