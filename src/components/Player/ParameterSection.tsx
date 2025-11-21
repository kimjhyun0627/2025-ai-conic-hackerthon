import { motion, AnimatePresence } from 'framer-motion';
import { ParameterSlider } from './ParameterSlider';
import type { CategoryParameter } from '../../types';

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
						initial: { opacity: 0, scale: 0.9, width: isVertical ? 0 : undefined },
						animate: { opacity: 1, scale: 1, width: isVertical ? 'auto' : undefined },
						exit: {
							opacity: 0,
							scale: 0.9,
							width: isVertical ? 0 : undefined,
							marginRight: isVertical ? 0 : undefined,
							paddingLeft: isVertical ? 0 : undefined,
							paddingRight: isVertical ? 0 : undefined,
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
							scale: {
								duration: 0.3,
								ease: [0.4, 0, 0.2, 1],
							},
							width: isVertical
								? {
										duration: 0.4,
										ease: [0.4, 0, 0.2, 1],
									}
								: undefined,
							paddingLeft: isVertical
								? {
										duration: 0.4,
										ease: [0.4, 0, 0.2, 1],
									}
								: undefined,
							paddingRight: isVertical
								? {
										duration: 0.4,
										ease: [0.4, 0, 0.2, 1],
									}
								: undefined,
							marginRight: isVertical
								? {
										duration: 0.4,
										ease: [0.4, 0, 0.2, 1],
									}
								: undefined,
						},
					}
				: {
						initial: { opacity: 0, scale: 0.95 },
						animate: { opacity: 1, scale: 1 },
						transition: {
							layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
							opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
							scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
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
