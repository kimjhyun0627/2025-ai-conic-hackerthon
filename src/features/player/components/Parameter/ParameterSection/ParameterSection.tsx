import { motion, AnimatePresence } from 'framer-motion';
import { ParameterSlider } from '../ParameterSlider';
import type { CategoryParameter } from '@/shared/types';

interface ParameterSectionProps {
	params: CategoryParameter[];
	getParamValue: (paramId: string) => number;
	setParamValue: (paramId: string, value: number) => void;
	onRemove?: (paramId: string) => void;
	isRemovable?: boolean;
	useLayoutAnimation?: boolean;
	orientation?: 'horizontal' | 'vertical';
}

export const ParameterSection = ({ params, getParamValue, setParamValue, onRemove, isRemovable = false, useLayoutAnimation = true, orientation = 'horizontal' }: ParameterSectionProps) => {
	if (params.length === 0) {
		return null;
	}

	const isVertical = orientation === 'vertical';
	const content = params.map((param) => (
		<motion.div
			key={param.id}
			layout={useLayoutAnimation}
			style={{
				...(isVertical
					? {
							minWidth: '60px',
							flex: '1 1 0',
						}
					: {}),
			}}
			{...(isRemovable
				? {
						initial: { opacity: 0 },
						animate: { opacity: 1 },
						exit: {
							opacity: 0,
						},
						transition: {
							layout: {
								duration: 0.6,
								ease: [0.4, 0, 0.2, 1],
							},
							opacity: {
								duration: 0.3,
								ease: [0.4, 0, 0.2, 1],
							},
						},
					}
				: {
						initial: { opacity: 0 },
						animate: { opacity: 1 },
						transition: {
							layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
							opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
						},
					})}
		>
			<ParameterSlider
				param={param}
				value={getParamValue(param.id)}
				onChange={(value) => setParamValue(param.id, value)}
				onRemove={onRemove ? () => onRemove(param.id) : undefined}
				isRemovable={isRemovable}
				orientation={orientation}
			/>
		</motion.div>
	));

	if (isRemovable) {
		return <AnimatePresence mode="popLayout">{content}</AnimatePresence>;
	}

	return <>{content}</>;
};
