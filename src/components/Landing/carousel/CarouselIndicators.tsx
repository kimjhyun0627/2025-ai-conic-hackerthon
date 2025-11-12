import { motion } from 'framer-motion';
import { useThemeStore } from '../../../store/themeStore';

interface CarouselIndicatorsProps {
	count: number;
	currentIndex: number;
	onSelect: (index: number) => void;
}

export const CarouselIndicators = ({ count, currentIndex, onSelect }: CarouselIndicatorsProps) => {
	const isDarkMode = useThemeStore((state) => state.theme === 'dark');

	const getIndicatorColor = (isActive: boolean) => {
		if (isActive) {
			return isDarkMode ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.9)'; // indicator-dark/90, indicator-light/90
		}
		return isDarkMode ? 'rgba(241, 245, 249, 0.5)' : 'rgba(30, 41, 59, 0.5)'; // indicator-dark/50, indicator-light/50
	};

	const getHoverColor = (isActive: boolean) => {
		if (isActive) {
			return isDarkMode ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.9)';
		}
		return isDarkMode ? 'rgba(241, 245, 249, 0.7)' : 'rgba(30, 41, 59, 0.7)'; // indicator-dark/70, indicator-light/70
	};

	return (
		<div className="flex items-center justify-center gap-1.5 pt-12 pb-4">
			{Array.from({ length: count }).map((_, index) => {
				const isActive = index === currentIndex;
				return (
					<button
						key={index}
						onClick={() => onSelect(index)}
						className="relative group px-0.5 py-3 border-0 outline-none focus:outline-none bg-transparent cursor-pointer min-h-[32px] flex items-center justify-center"
						aria-label={`${index + 1}번째 항목`}
					>
						<motion.div
							className="rounded-full transition-all"
							style={{
								height: '6px',
								minWidth: '6px',
								backgroundColor: getIndicatorColor(isActive),
								backdropFilter: 'blur(4px)',
								WebkitBackdropFilter: 'blur(4px)',
								boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.1)',
							}}
							whileHover={{
								backgroundColor: getHoverColor(isActive),
								scale: 1.3,
								height: '8px',
								width: isActive ? 24 : 8,
							}}
							initial={{
								width: isActive ? 20 : 6,
							}}
							animate={{
								width: isActive ? 20 : 6,
							}}
							transition={{
								type: 'spring',
								stiffness: 400,
								damping: 30,
							}}
						/>
					</button>
				);
			})}
		</div>
	);
};
