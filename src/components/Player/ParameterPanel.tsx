import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ParameterSlider } from './ParameterSlider';
import type { CategoryParameter } from '../../types';
import { PLAYER_ANIMATIONS, PLAYER_STYLES } from '../../constants/playerConstants';
import { useThemeColors } from '../../hooks/useThemeColors';

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

	const handleButtonClick = (param: CategoryParameter) => {
		// 버튼 사라지는 애니메이션을 위해 상태 설정
		setRemovingButtonIds((prev) => new Set(prev).add(param.id));
		// 즉시 파라미터 추가 (새 파라미터 컨테이너가 생성되면서 애니메이션 시작)
		onAddCommonParam(param.id);
		// 애니메이션 완료 후 상태 정리
		setTimeout(() => {
			setRemovingButtonIds((prev) => {
				const next = new Set(prev);
				next.delete(param.id);
				return next;
			});
		}, 300);
	};

	// 표시할 버튼 목록: availableCommonParams만 사용 (애니메이션 상태로 제어)
	const visibleButtons = availableCommonParams;

	return (
		<AnimatePresence>
			{isExpanded && (
				<motion.div
					layout
					className={PLAYER_STYLES.parameterPanel}
					style={{
						backdropFilter: 'blur(20px) saturate(180%)',
						WebkitBackdropFilter: 'blur(20px) saturate(180%)',
						background: colors.parameterPanelBg,
						borderColor: colors.glassBorder,
						padding: '1rem 1.5rem',
						position: 'absolute',
						bottom: '100%',
						left: 0,
						right: 0,
						zIndex: 0,
					}}
					initial={PLAYER_ANIMATIONS.parameterPanel.initial}
					animate={PLAYER_ANIMATIONS.parameterPanel.animate}
					exit={PLAYER_ANIMATIONS.parameterPanel.exit}
					transition={{
						...PLAYER_ANIMATIONS.parameterPanel.transition,
						layout: {
							duration: 0.5,
							ease: [0.4, 0, 0.2, 1],
						},
					}}
				>
					<motion.div
						layout
						className="w-full max-w-[960px] mx-auto"
						transition={{
							layout: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
						}}
					>
						<motion.div
							layout
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
								gap: '1rem',
							}}
							initial={PLAYER_ANIMATIONS.parameterGrid.initial}
							animate={PLAYER_ANIMATIONS.parameterGrid.animate}
							exit={PLAYER_ANIMATIONS.parameterGrid.exit}
							transition={{
								layout: {
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
							{themeBaseParams.map((param) => (
								<motion.div
									key={param.id}
									layout
									transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
								>
									<ParameterSlider
										param={param}
										value={getParamValue(param.id)}
										onChange={(value) => setParamValue(param.id, value)}
									/>
								</motion.div>
							))}

							{/* 테마별 추가 파라미터 */}
							<AnimatePresence mode="popLayout">
								{themeAdditionalParams.map((param) => (
									<motion.div
										key={param.id}
										layout
										{...PLAYER_ANIMATIONS.parameterItem}
									>
										<ParameterSlider
											param={param}
											value={getParamValue(param.id)}
											onChange={(value) => setParamValue(param.id, value)}
											onRemove={() => onRemoveThemeParam(param.id)}
											isRemovable
										/>
									</motion.div>
								))}
							</AnimatePresence>

							{/* 활성화된 공통 파라미터 */}
							<AnimatePresence mode="popLayout">
								{activeCommonParams.map((param) => (
									<motion.div
										key={param.id}
										layout
										initial={PLAYER_ANIMATIONS.parameterItem.initial}
										animate={PLAYER_ANIMATIONS.parameterItem.animate}
										exit={PLAYER_ANIMATIONS.parameterItem.exit}
										transition={{
											layout: {
												duration: 0.6,
												ease: [0.4, 0, 0.2, 1],
											},
											opacity: {
												duration: 0.5,
												ease: 'easeOut',
											},
											height: {
												duration: 0.6,
												ease: [0.4, 0, 0.2, 1],
											},
											y: {
												duration: 0.5,
												ease: 'easeOut',
											},
											scale: {
												duration: 0.5,
												ease: 'easeOut',
											},
										}}
									>
										<ParameterSlider
											param={param}
											value={getParamValue(param.id)}
											onChange={(value) => setParamValue(param.id, value)}
											onRemove={() => onRemoveCommonParam(param.id)}
											isRemovable
										/>
									</motion.div>
								))}
							</AnimatePresence>

							{/* 공통 파라미터 추가 버튼 */}
							<AnimatePresence>
								{visibleButtons.length > 0 && (
									<motion.div
										layout
										{...PLAYER_ANIMATIONS.commonParamPanel}
										className="glass-card rounded-2xl p-4 md:p-5"
										style={{
											background: colors.isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)',
											backdropFilter: 'blur(30px) saturate(200%)',
											WebkitBackdropFilter: 'blur(30px) saturate(200%)',
											border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.5)'}`,
											boxShadow: colors.isDark
												? 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.4), inset 0 1px 2px 0 rgba(0, 0, 0, 0.3), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)'
												: 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.15), inset 0 1px 2px 0 rgba(0, 0, 0, 0.1), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(31, 38, 135, 0.05)',
										}}
									>
										<div className="flex flex-wrap gap-2">
											<AnimatePresence mode="popLayout">
												{visibleButtons.map((param) => {
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
															style={{
																background: colors.isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.6)',
																backdropFilter: 'blur(20px) saturate(180%)',
																WebkitBackdropFilter: 'blur(20px) saturate(180%)',
																border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)'}`,
																boxShadow: colors.isDark
																	? '0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
																	: '0 4px 16px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
															}}
														>
															<Plus
																className="w-4 h-4 shrink-0"
																style={{ color: colors.iconColor }}
															/>
															<span
																className="text-sm font-medium whitespace-nowrap"
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
						</motion.div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
