import { motion, AnimatePresence } from 'framer-motion';
import type { Transition } from 'framer-motion';

interface AnimatedBoxProps {
	keyValue: string;
	trackId: string | null;
	baseSize: number; // 기본 크기 (vh)
	extraPixels: number; // 추가 크기 (vh)
	opacity: number;
	background: string;
	border: string;
	boxShadow: string;
	backdropFilter?: string;
	filter: string;
	initialOpacity?: number;
	transition: Transition;
}

/**
 * 애니메이션 박스 공통 컴포넌트
 */
export const AnimatedBox = ({ keyValue, trackId, baseSize, extraPixels, opacity, background, border, boxShadow, backdropFilter, filter, initialOpacity = 0.3, transition }: AnimatedBoxProps) => {
	const totalSize = baseSize + extraPixels;
	const offset = totalSize / 2;

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={`${keyValue}-${trackId || 'none'}`}
				className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-4xl md:rounded-2rem"
				style={{
					background,
					border,
					backdropFilter,
					zIndex: 1,
				}}
				initial={{
					width: `calc(100% + ${baseSize}vh)`,
					height: `calc(100% + ${baseSize}vh)`,
					left: `-${baseSize / 2}vh`,
					top: `-${baseSize / 2}vh`,
					opacity: initialOpacity,
					filter: filter.includes('blur') ? filter.split(' ')[0] : 'blur(2px)',
				}}
				animate={{
					width: `calc(100% + ${totalSize}vh)`,
					height: `calc(100% + ${totalSize}vh)`,
					left: `-${offset}vh`,
					top: `-${offset}vh`,
					opacity,
					boxShadow,
					filter,
				}}
				exit={{
					width: `calc(100% + ${baseSize}vh)`,
					height: `calc(100% + ${baseSize}vh)`,
					left: `-${baseSize / 2}vh`,
					top: `-${baseSize / 2}vh`,
					opacity: 0,
					filter: filter.includes('blur') ? filter.split(' ')[0] : 'blur(2px)',
				}}
				transition={transition}
			/>
		</AnimatePresence>
	);
};
