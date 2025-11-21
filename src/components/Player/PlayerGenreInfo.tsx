import { motion, AnimatePresence } from 'framer-motion';
import type { MusicGenre, MusicTheme } from '../../types';
import { PLAYER_ANIMATIONS, PLAYER_STYLES } from '../../constants/playerConstants';

interface PlayerGenreInfoProps {
	genre: MusicGenre;
	theme: MusicTheme | null;
	isVisible?: boolean;
}

export const PlayerGenreInfo = ({ genre, theme, isVisible = true }: PlayerGenreInfoProps) => {
	return (
		<div className="absolute top-6 left-6 z-10 max-w-sm md:max-w-md">
			<AnimatePresence>
				{isVisible && (
					<motion.div
						initial="hidden"
						animate="visible"
						exit="hidden"
						variants={{
							hidden: {
								opacity: 0,
								y: -20,
								transition: {
									opacity: {
										duration: 0.3,
										ease: [0.4, 0, 0.2, 1],
									},
									y: {
										duration: 0.3,
										ease: [0.4, 0, 0.2, 1],
									},
								},
							},
							visible: {
								opacity: 1,
								y: 0,
								transition: {
									...PLAYER_ANIMATIONS.genreInfo.transition,
								},
							},
						}}
					>
						<div className={PLAYER_STYLES.glassCard}>
							{theme && (
								<div className="flex items-center gap-2 mb-2">
									<span className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400">{theme.categoryNameKo}</span>
								</div>
							)}
							<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gradient mb-1">{genre.nameKo}</h2>
							<p className="text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-2">{genre.name}</p>
							{genre.description && <p className="text-xs md:text-sm lg:text-base text-slate-500 dark:text-slate-500">{genre.description}</p>}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
