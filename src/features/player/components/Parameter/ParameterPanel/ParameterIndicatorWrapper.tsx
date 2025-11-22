import { motion, AnimatePresence } from 'framer-motion';
import { ParameterIndicator } from '../ParameterIndicator';
import type { CategoryParameter } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../../constants';

interface ParameterIndicatorWrapperProps {
	shouldShowIndicator: boolean;
	indicatorLeft: number | string;
	indicatorTop: number | string;
	allParams: CategoryParameter[];
	currentStartIndex: number;
	visibleCount: number;
	onIndicatorClick: (index: number) => void;
}

export const ParameterIndicatorWrapper = ({ shouldShowIndicator, indicatorLeft, indicatorTop, allParams, currentStartIndex, visibleCount, onIndicatorClick }: ParameterIndicatorWrapperProps) => {
	return (
		<AnimatePresence>
			{shouldShowIndicator && (
				<motion.div
					key="indicator"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{
						opacity: 1,
						scale: 1,
						left: typeof indicatorLeft === 'number' ? indicatorLeft : indicatorLeft,
						top: typeof indicatorTop === 'number' ? indicatorTop : indicatorTop,
						y: '-50%', // 인디케이터 블록의 중앙이 top 위치에 오도록
					}}
					exit={{ opacity: 0, scale: 0.8 }}
					transition={{
						type: 'spring',
						stiffness: 300,
						damping: 25,
						left: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
						top: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
						y: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
					}}
					style={{
						position: 'fixed',
						left: typeof indicatorLeft === 'number' ? `${indicatorLeft}px` : indicatorLeft,
						top: typeof indicatorTop === 'number' ? `${indicatorTop}px` : indicatorTop,
						zIndex: 100,
						pointerEvents: 'auto',
					}}
				>
					<ParameterIndicator
						allParams={allParams}
						currentStartIndex={currentStartIndex}
						visibleCount={visibleCount}
						indicatorLeft={typeof indicatorLeft === 'number' ? `${indicatorLeft}px` : indicatorLeft}
						indicatorTop={typeof indicatorTop === 'number' ? `${indicatorTop}px` : indicatorTop}
						onIndicatorClick={onIndicatorClick}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
