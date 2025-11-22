import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { PLAYER_CONSTANTS } from '../../../constants';
import { useThemeColors } from '@/shared/hooks';

interface ParameterModeToggleProps {
	orientation: 'horizontal' | 'vertical';
	onToggle: () => void;
}

export const ParameterModeToggle = ({ orientation, onToggle }: ParameterModeToggleProps) => {
	const colors = useThemeColors();

	return (
		<motion.div
			layout
			className="w-full pt-3 border-t"
			style={{
				borderColor: colors.glassBorder,
				...(orientation === 'vertical'
					? {
							width: '100%',
							minWidth: '100%',
						}
					: {}),
			}}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 10 }}
			transition={{
				duration: PLAYER_CONSTANTS.PARAMETER.ANIMATION_DURATIONS.OPACITY / 1000,
				delay: PLAYER_CONSTANTS.PARAMETER.UI.MODE_TOGGLE_DELAY,
			}}
		>
			<div className="flex items-center justify-center">
				<button
					onClick={onToggle}
					className="p-2.5 md:p-3 rounded-full transition-all duration-200 glow-primary shadow-2xl relative overflow-hidden group hover:scale-110 active:scale-95"
					style={{
						background: colors.playButtonGradient,
					}}
					aria-label={orientation === 'horizontal' ? '세로 모드로 전환' : '가로 모드로 전환'}
				>
					<motion.div
						style={{
							position: 'absolute',
							inset: 0,
							background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
						}}
						animate={{ x: ['-100%', '200%'] }}
						transition={PLAYER_CONSTANTS.ANIMATIONS.playButtonShine.transition}
					/>
					<AnimatePresence mode="wait">
						{orientation === 'horizontal' ? (
							<motion.div
								key="grid"
								{...PLAYER_CONSTANTS.ANIMATIONS.playButtonIcon}
							>
								<LayoutGrid className="w-4 h-4 md:w-5 md:h-5 text-white fill-white relative z-10" />
							</motion.div>
						) : (
							<motion.div
								key="list"
								{...PLAYER_CONSTANTS.ANIMATIONS.playButtonIcon}
							>
								<LayoutList className="w-4 h-4 md:w-5 md:h-5 text-white fill-white relative z-10" />
							</motion.div>
						)}
					</AnimatePresence>
				</button>
			</div>
		</motion.div>
	);
};
