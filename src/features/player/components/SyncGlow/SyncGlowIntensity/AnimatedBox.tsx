import { motion, AnimatePresence } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { extractBlurFilter } from './filterUtils';

interface AnimatedIntensityBoxProps {
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
	zIndex?: number;
}

/**
 * Intensity 애니메이션 박스 공통 컴포넌트
 */
export const AnimatedIntensityBox = ({
	keyValue,
	trackId,
	baseSize,
	extraPixels,
	opacity,
	background,
	border,
	boxShadow,
	backdropFilter,
	filter,
	initialOpacity = 0.3,
	transition,
	zIndex = 1,
}: AnimatedIntensityBoxProps) => {
	const totalSize = baseSize + extraPixels;
	const offset = totalSize / 2;
	const initialFilter = extractBlurFilter(filter);

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={`${keyValue}-${trackId || 'none'}`}
				className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-4xl md:rounded-2rem"
				style={{
					background,
					border,
					backdropFilter,
					zIndex,
					mixBlendMode: 'multiply', // 색상 블렌딩으로 각 주파수 대역의 색상이 잘 보이도록
				}}
				initial={{
					width: `calc(100% + ${baseSize}vh)`,
					height: `calc(100% + ${baseSize}vh)`,
					left: `-${baseSize / 2}vh`,
					top: `-${baseSize / 2}vh`,
					opacity: initialOpacity,
					filter: initialFilter,
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
					filter: initialFilter,
				}}
				transition={transition}
			/>
		</AnimatePresence>
	);
};
