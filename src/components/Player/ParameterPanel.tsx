import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, LayoutList } from 'lucide-react';
import { ParameterSection } from './ParameterSection';
import type { CategoryParameter } from '../../types';
import { PLAYER_ANIMATIONS, PLAYER_STYLES } from '../../constants/playerConstants';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useGlassButton } from '../../hooks/useGlassButton';
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
	const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
	const { buttonStyle, handleMouseEnter, handleMouseLeave } = useGlassButton();
	const panelRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const handleButtonClick = (param: CategoryParameter) => {
		setRemovingButtonIds((prev) => new Set(prev).add(param.id));
		onAddCommonParam(param.id);
		setTimeout(() => {
			setRemovingButtonIds((prev) => {
				const next = new Set(prev);
				next.delete(param.id);
				return next;
			});
		}, 300);
	};

	return (
		<AnimatePresence>
			{isExpanded && (
				<motion.div
					ref={panelRef}
					layout={orientation === 'vertical' ? false : true}
					className={PLAYER_STYLES.parameterPanel}
					style={{
						...getParameterPanelStyle(colors, orientation),
						...(orientation === 'vertical'
							? {
									width: 'max-content',
									minWidth: '100%',
									left: '50%',
									right: undefined,
								}
							: {}),
					}}
					initial={{
						...PLAYER_ANIMATIONS.parameterPanel.initial,
						...(orientation === 'vertical'
							? {
									x: '-50%',
									y: 0,
								}
							: {}),
					}}
					animate={{
						...PLAYER_ANIMATIONS.parameterPanel.animate,
						...(orientation === 'vertical'
							? {
									x: '-50%',
									y: 0,
								}
							: {}),
					}}
					exit={PLAYER_ANIMATIONS.parameterPanel.exit}
					transition={{
						...PLAYER_ANIMATIONS.parameterPanel.transition,
						...(orientation === 'vertical'
							? {}
							: {
									layout: {
										duration: 0.6,
										ease: [0.4, 0, 0.2, 1],
									},
								}),
						width: {
							duration: 0.6,
							ease: [0.4, 0, 0.2, 1],
						},
						height: {
							duration: 0.6,
							ease: [0.4, 0, 0.2, 1],
						},
						x:
							orientation === 'vertical'
								? {
										duration: 0,
									}
								: undefined,
						y:
							orientation === 'vertical'
								? {
										duration: 0,
									}
								: undefined,
					}}
				>
					<motion.div
						ref={contentRef}
						layout
						className={orientation === 'vertical' ? '' : 'w-full max-w-[960px] mx-auto'}
						style={{
							...(orientation === 'vertical'
								? {
										width: 'max-content',
										minWidth: '100%',
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
							height: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
						}}
					>
						<motion.div
							layout
							className="flex flex-col gap-4"
							style={{
								width: orientation === 'vertical' ? 'max-content' : undefined,
								minWidth: orientation === 'vertical' ? '100%' : undefined,
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
								height: {
									duration: 0.6,
									ease: [0.4, 0, 0.2, 1],
								},
							}}
						>
							{/* 파라미터 그리드 */}
							<motion.div
								layout
								style={{
									display: orientation === 'vertical' ? 'flex' : 'grid',
									flexWrap: orientation === 'vertical' ? 'nowrap' : undefined,
									gap: '1rem',
									gridTemplateColumns: orientation === 'vertical' ? undefined : 'repeat(1, minmax(0, 1fr))',
									width: orientation === 'vertical' ? 'max-content' : undefined,
								}}
								initial={PLAYER_ANIMATIONS.parameterGrid.initial}
								animate={PLAYER_ANIMATIONS.parameterGrid.animate}
								exit={PLAYER_ANIMATIONS.parameterGrid.exit}
								transition={{
									layout: {
										duration: 0.6,
										ease: [0.4, 0, 0.2, 1],
									},
									width: {
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

							{/* 공통 파라미터 추가 버튼 - 항상 하단에 배치 */}
							<AnimatePresence>
								{availableCommonParams.length > 0 && (
									<motion.div
										layout
										{...PLAYER_ANIMATIONS.commonParamPanel}
										className="glass-card rounded-2xl p-4 md:p-5"
										style={{
											...getCommonParamPanelStyle(colors),
											...(orientation === 'vertical'
												? {
														width: '100%',
														minWidth: '100%',
													}
												: {}),
										}}
										transition={{
											...PLAYER_ANIMATIONS.commonParamPanel.transition,
											layout: {
												duration: 0.6,
												ease: [0.4, 0, 0.2, 1],
											},
											width: {
												duration: 0.6,
												ease: [0.4, 0, 0.2, 1],
											},
											height: {
												duration: 0.6,
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
										className={PLAYER_STYLES.glassButton.controlButton}
										style={buttonStyle}
										onMouseEnter={handleMouseEnter}
										onMouseLeave={handleMouseLeave}
										aria-label={orientation === 'horizontal' ? '세로 모드로 전환' : '가로 모드로 전환'}
									>
										{orientation === 'horizontal' ? (
											<LayoutGrid
												className="w-5 h-5 md:w-6 md:h-6"
												style={{ color: colors.iconColor }}
											/>
										) : (
											<LayoutList
												className="w-5 h-5 md:w-6 md:h-6"
												style={{ color: colors.iconColor }}
											/>
										)}
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
