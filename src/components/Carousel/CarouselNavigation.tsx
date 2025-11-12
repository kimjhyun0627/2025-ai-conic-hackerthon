import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselButtonProps {
	onClick: () => void;
	direction: 'prev' | 'next';
}

export const CarouselButton = ({ onClick, direction }: CarouselButtonProps) => {
	const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
	const label = direction === 'prev' ? '이전' : '다음';
	const rotateValue = direction === 'prev' ? -5 : 5;
	const xValue = direction === 'prev' ? -2 : 2;

	return (
		<motion.button
			onClick={onClick}
			className="flex-shrink-0 btn-glass p-3 md:p-4 rounded-full hover:glow-primary transition-all shadow-lg z-30"
			aria-label={label}
			whileHover={{ scale: 1.1, rotate: rotateValue }}
			whileTap={{ scale: 0.95 }}
			transition={{ type: 'spring', stiffness: 400, damping: 17 }}
		>
			<motion.div
				whileHover={{ x: xValue }}
				transition={{ type: 'spring', stiffness: 400, damping: 17 }}
			>
				<Icon className="w-5 h-5 md:w-6 md:h-6" />
			</motion.div>
		</motion.button>
	);
};
