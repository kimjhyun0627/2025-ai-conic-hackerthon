import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ParameterSection } from './ParameterSection';
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
					layout
					className={PLAYER_STYLES.parameterPanel}
					style={getParameterPanelStyle(colors)}
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
							<ParameterSection
								params={themeBaseParams}
								getParamValue={getParamValue}
								setParamValue={setParamValue}
								useLayoutAnimation={true}
							/>

							{/* 테마별 추가 파라미터 */}
							<ParameterSection
								params={themeAdditionalParams}
								getParamValue={getParamValue}
								setParamValue={setParamValue}
								onRemove={onRemoveThemeParam}
								isRemovable={true}
								useLayoutAnimation={true}
							/>

							{/* 활성화된 공통 파라미터 */}
							<ParameterSection
								params={activeCommonParams}
								getParamValue={getParamValue}
								setParamValue={setParamValue}
								onRemove={onRemoveCommonParam}
								isRemovable={true}
								useLayoutAnimation={true}
							/>

							{/* 공통 파라미터 추가 버튼 */}
							<AnimatePresence>
								{availableCommonParams.length > 0 && (
									<motion.div
										layout
										{...PLAYER_ANIMATIONS.commonParamPanel}
										className="glass-card rounded-2xl p-4 md:p-5"
										style={getCommonParamPanelStyle(colors)}
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
