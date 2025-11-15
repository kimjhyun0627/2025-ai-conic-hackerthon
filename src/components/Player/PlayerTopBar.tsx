import { motion } from 'framer-motion';
import { Home, Maximize, Minimize } from 'lucide-react';
import { Button, ThemeToggle } from '../UI';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useThemeColors } from '../../hooks/useThemeColors';
import { PLAYER_ANIMATIONS, PLAYER_STYLES } from '../../constants/playerConstants';
import { useThemeStore } from '../../store/themeStore';

interface PlayerTopBarProps {
	onHomeClick: () => void;
}

export const PlayerTopBar = ({ onHomeClick }: PlayerTopBarProps) => {
	const { isFullscreen, toggleFullscreen } = useFullscreen();
	const colors = useThemeColors();
	const theme = useThemeStore((state) => state.theme);

	return (
		<div className="absolute top-6 right-6 z-10 flex items-center gap-3">
			<motion.div {...PLAYER_ANIMATIONS.topBar}>
				<Button
					variant="ghost"
					size="sm"
					onClick={onHomeClick}
					className={PLAYER_STYLES.glassButton.homeButton}
				>
					<Home className="w-5 h-5 mr-2" />
					홈으로
				</Button>
			</motion.div>

			<motion.div {...PLAYER_ANIMATIONS.topBarDelayed}>
				<ThemeToggle className="h-11 rounded-2xl backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/30 dark:hover:bg-slate-800/40 hover:shadow-xl transition-all duration-300" />
			</motion.div>

			<motion.div {...PLAYER_ANIMATIONS.topBar}>
				<button
					onClick={toggleFullscreen}
					className={PLAYER_STYLES.glassButton.base}
					aria-label={isFullscreen ? '전체화면 해제' : '전체화면'}
				>
					{isFullscreen ? (
						<Minimize
							className="w-5 h-5 dark:text-slate-300"
							style={{ color: theme === 'dark' ? undefined : '#0f172a' }}
						/>
					) : (
						<Maximize
							className="w-5 h-5 dark:text-slate-300"
							style={{ color: theme === 'dark' ? undefined : '#0f172a' }}
						/>
					)}
				</button>
			</motion.div>
		</div>
	);
};

