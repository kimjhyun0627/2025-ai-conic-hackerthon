import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/themeStore';

interface CarouselIndicatorsProps {
	count: number;
	currentIndex: number;
	onSelect: (index: number) => void;
	labels?: string[];
}

export const CarouselIndicators = ({ count, currentIndex, onSelect, labels }: CarouselIndicatorsProps) => {
	const isDarkMode = useThemeStore((state) => state.theme === 'dark');
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
				const label = labels?.[index] ?? `${index + 1}`;
				return (
					<button
						key={index}
						onClick={() => onSelect(index)}
						onMouseEnter={() => setHoveredIndex(index)}
						onMouseLeave={() => setHoveredIndex(null)}
						className="relative group px-0.5 py-3 border-0 outline-none focus:outline-none bg-transparent cursor-pointer min-h-[32px] flex items-center justify-center"
						aria-label={`${index + 1}번째 항목`}
					>
						<AnimatePresence>
							{hoveredIndex === index && (
								<motion.div
									key={`tooltip-${index}`}
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 6 }}
									transition={{ duration: 0.18 }}
									className="absolute -top-1 -translate-y-full whitespace-nowrap px-2 py-0.5 text-xs font-semibold"
									style={{
										color: isDarkMode ? '#f8fafc' : getIndicatorColor(true),
										textShadow: isDarkMode ? '0 1px 6px rgba(15, 23, 42, 0.8)' : '0 1px 4px rgba(148, 163, 184, 0.8)',
									}}
								>
									{label}
								</motion.div>
							)}
						</AnimatePresence>
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
								opacity: 0.9,
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
