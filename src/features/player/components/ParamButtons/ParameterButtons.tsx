import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { CategoryParameter } from '@/shared/types';
import { useThemeColors } from '@/shared/hooks';
import { getCommonParamPanelStyle, getCommonParamButtonStyle } from '../../utils';
import { PLAYER_CONSTANTS } from '../../constants';

interface ParameterButtonsProps {
	availableCommonParams: CategoryParameter[];
	onAddCommonParam: (paramId: string) => void;
	orientation?: 'horizontal' | 'vertical';
}

export const ParameterButtons = ({ availableCommonParams, onAddCommonParam, orientation = 'horizontal' }: ParameterButtonsProps) => {
	const colors = useThemeColors();
	const [removingButtonIds, setRemovingButtonIds] = useState<Set<string>>(new Set());
	const [shouldHidePanel, setShouldHidePanel] = useState(false);
	const [hoveredButtonId, setHoveredButtonId] = useState<string | null>(null);

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
					}, PLAYER_CONSTANTS.PARAMETER.ANIMATION_DURATIONS.PANEL_EXIT);
				}, 50);
			}, PLAYER_CONSTANTS.PARAMETER.ANIMATION_DURATIONS.BUTTON_REMOVE);
		} else {
			onAddCommonParam(param.id);
			setTimeout(() => {
				setRemovingButtonIds((prev) => {
					const next = new Set(prev);
					next.delete(param.id);
					return next;
				});
			}, PLAYER_CONSTANTS.PARAMETER.ANIMATION_DURATIONS.BUTTON_REMOVE);
		}
	};

	return (
		<AnimatePresence mode="popLayout">
			{availableCommonParams.length > 0 && !shouldHidePanel && (
				<motion.div
					layout="size"
					initial={PLAYER_CONSTANTS.PARAMETER.COMMON_PARAM_PANEL_ANIMATION.initial}
					animate={PLAYER_CONSTANTS.PARAMETER.COMMON_PARAM_PANEL_ANIMATION.animate}
					exit={PLAYER_CONSTANTS.PARAMETER.COMMON_PARAM_PANEL_ANIMATION.exit}
					className="glass-card rounded-2xl overflow-hidden"
					style={{
						...getCommonParamPanelStyle(colors),
						padding: '1rem 1.25rem',
						marginTop: orientation === 'vertical' ? '0' : '2rem',
						// 가로/세로 모드 모두에서 패널의 너비를 100%로 고정해
						// 아래 가로선 및 토글 버튼 영역과 일관된 폭을 유지
						width: '100%',
						minWidth: '100%',
					}}
					transition={PLAYER_CONSTANTS.PARAMETER.COMMON_PARAM_PANEL_ANIMATION.transition}
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
										onMouseEnter={() => setHoveredButtonId(param.id)}
										onMouseLeave={() => setHoveredButtonId(null)}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={isRemoving ? PLAYER_CONSTANTS.PARAMETER.COMMON_PARAM_BUTTON_ANIMATION.removing : { opacity: 1, scale: 1 }}
										exit={PLAYER_CONSTANTS.PARAMETER.COMMON_PARAM_BUTTON_ANIMATION.removing}
										transition={PLAYER_CONSTANTS.PARAMETER.COMMON_PARAM_BUTTON_ANIMATION}
										whileHover={isRemoving ? {} : { scale: 1.05 }}
										whileTap={isRemoving ? {} : { scale: 0.95 }}
										className="flex items-center gap-2 px-3 py-2 rounded-lg overflow-hidden"
										style={getCommonParamButtonStyle(colors)}
									>
										<Plus
											className="w-4 h-4 shrink-0"
											style={{
												color: hoveredButtonId === param.id ? '#fb7185' : colors.iconColor,
											}}
										/>
										<span
											className="text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
											style={{
												color: hoveredButtonId === param.id ? '#fb7185' : colors.textMutedColor,
											}}
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
	);
};
