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
					}}
					{...PLAYER_ANIMATIONS.parameterPanel}
				>
					<div className="w-full max-w-[960px] mx-auto">
						<motion.div
							layout
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
								gap: '1rem',
							}}
							{...PLAYER_ANIMATIONS.parameterGrid}
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
										{...PLAYER_ANIMATIONS.parameterItem}
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
								{availableCommonParams.length > 0 && (
									<motion.div
										layout
										{...PLAYER_ANIMATIONS.commonParamPanel}
										className="glass-card rounded-2xl p-4 md:p-5"
									>
										<div className="flex flex-wrap gap-2">
											{availableCommonParams.map((param) => (
												<motion.button
													key={param.id}
													onClick={() => onAddCommonParam(param.id)}
													{...PLAYER_ANIMATIONS.commonParamButton}
													className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-md border"
													style={{
														background: colors.parameterButtonBg,
														borderColor: colors.glassBorder,
													}}
												>
													<Plus className="w-4 h-4" style={{ color: colors.iconColor }} />
													<span className="text-sm font-medium" style={{ color: colors.textMutedColor }}>
														{param.nameKo}
													</span>
												</motion.button>
											))}
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

