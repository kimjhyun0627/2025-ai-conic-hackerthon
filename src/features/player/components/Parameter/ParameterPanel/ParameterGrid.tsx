import { motion, AnimatePresence } from 'framer-motion';
import { ParameterSlider } from '../ParameterSlider';
import type { CategoryParameter } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../../constants';

interface ParameterGridProps {
	allParams: CategoryParameter[];
	themeAdditionalParams: CategoryParameter[];
	activeCommonParams: CategoryParameter[];
	shouldUseTwoRowsLayout: boolean;
	topRowCount: number;
	totalParamsCount: number;
	orientation: 'horizontal' | 'vertical';
	getParamValue: (paramId: string) => number;
	setParamValue: (paramId: string, value: number) => void;
	onRemoveThemeParam: (paramId: string) => void;
	onRemoveCommonParam: (paramId: string) => void;
}

export const ParameterGrid = ({
	allParams,
	themeAdditionalParams,
	activeCommonParams,
	shouldUseTwoRowsLayout,
	topRowCount,
	totalParamsCount,
	orientation,
	getParamValue,
	setParamValue,
	onRemoveThemeParam,
	onRemoveCommonParam,
}: ParameterGridProps) => {
	return (
		<motion.div
			layout="size"
			style={{
				display: 'grid',
				gridTemplateColumns: shouldUseTwoRowsLayout ? `repeat(${topRowCount}, minmax(0, 1fr))` : `repeat(${totalParamsCount}, minmax(0, 1fr))`,
				gridTemplateRows: shouldUseTwoRowsLayout ? 'repeat(2, auto)' : 'repeat(1, auto)',
				gridAutoFlow: 'column',
				gap: PLAYER_CONSTANTS.PARAMETER.UI.GRID_GAP,
				width: '100%',
			}}
			initial={PLAYER_CONSTANTS.ANIMATIONS.parameterGrid.initial}
			animate={PLAYER_CONSTANTS.ANIMATIONS.parameterGrid.animate}
			exit={PLAYER_CONSTANTS.ANIMATIONS.parameterGrid.exit}
			transition={{
				layout: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
				gridTemplateColumns: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
				gridTemplateRows: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
				opacity: {
					...PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.OPACITY,
					delay: PLAYER_CONSTANTS.PARAMETER.UI.OPACITY_DELAY,
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
								minWidth: PLAYER_CONSTANTS.PARAMETER.UI.PARAM_SLIDER_MIN_WIDTH,
							}}
							transition={PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT_OPACITY}
						>
							<ParameterSlider
								param={param}
								value={getParamValue(param.id)}
								onChange={(value: number) => setParamValue(param.id, value)}
								onRemove={isRemovable ? (themeAdditionalParams.some((p) => p.id === param.id) ? () => onRemoveThemeParam(param.id) : () => onRemoveCommonParam(param.id)) : undefined}
								isRemovable={isRemovable}
								orientation={orientation}
							/>
						</motion.div>
					);
				})}
			</AnimatePresence>
		</motion.div>
	);
};
