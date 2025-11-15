import { motion, AnimatePresence } from 'framer-motion';
import { ParameterSlider } from './ParameterSlider';
import type { CategoryParameter } from '../../types';
import { PLAYER_ANIMATIONS } from '../../constants/playerConstants';

interface ParameterSectionProps {
	params: CategoryParameter[];
	getParamValue: (paramId: string) => number;
	setParamValue: (paramId: string, value: number) => void;
	onRemove?: (paramId: string) => void;
	isRemovable?: boolean;
	useLayoutAnimation?: boolean;
}

export const ParameterSection = ({ params, getParamValue, setParamValue, onRemove, isRemovable = false, useLayoutAnimation = true }: ParameterSectionProps) => {
	if (params.length === 0) {
		return null;
	}

	const content = params.map((param) => (
		<motion.div
			key={param.id}
			layout={useLayoutAnimation}
			{...(isRemovable
				? {
						initial: PLAYER_ANIMATIONS.parameterItem.initial,
						animate: PLAYER_ANIMATIONS.parameterItem.animate,
						exit: PLAYER_ANIMATIONS.parameterItem.exit,
						transition: {
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
						},
					}
				: {
						transition: { layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
					})}
		>
			<ParameterSlider
				param={param}
				value={getParamValue(param.id)}
				onChange={(value) => setParamValue(param.id, value)}
				onRemove={onRemove ? () => onRemove(param.id) : undefined}
				isRemovable={isRemovable}
			/>
		</motion.div>
	));

	if (isRemovable) {
		return <AnimatePresence mode="popLayout">{content}</AnimatePresence>;
	}

	return <>{content}</>;
};
