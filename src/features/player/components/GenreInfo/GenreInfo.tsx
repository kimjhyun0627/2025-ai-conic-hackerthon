import { motion, AnimatePresence } from 'framer-motion';
import type { MusicGenre, MusicTheme } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../constants';
import { useThemeColors } from '@/shared/hooks';

interface GenreInfoProps {
	genre: MusicGenre;
	theme: MusicTheme | null;
	isVisible?: boolean;
}

export const GenreInfo = ({ genre, theme, isVisible = true }: GenreInfoProps) => {
	const colors = useThemeColors();
	const textColor = colors.isDark ? 'rgb(241 245 249)' : 'rgb(15 23 42)'; // slate-50 : slate-900
	const textSecondaryColor = colors.isDark ? 'rgb(203 213 225)' : 'rgb(30 41 59)'; // slate-300 : slate-800

	return (
		<div className="absolute top-6 left-6 z-10 w-64 md:w-80">
			<AnimatePresence mode="wait">
				{isVisible && (
					<motion.div
						key={`genre-info-${genre.id}-${isVisible}`}
						initial="hidden"
						animate="visible"
						exit="hidden"
						// @ts-expect-error - as const로 인한 타입 추론 제한
						variants={PLAYER_CONSTANTS.ANIMATIONS.genreInfoTransition}
					>
						<div className={`${PLAYER_CONSTANTS.STYLES.glassCard} w-full`}>
							<div className="flex items-center gap-2 mb-1">
								<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gradient">{genre.nameKo}</h2>
								{theme && (
									<span
										className="text-sm md:text-base font-medium"
										style={{ color: textColor }}
									>
										{theme.categoryNameKo}
									</span>
								)}
							</div>
							<p
								className="text-sm md:text-base lg:text-lg mb-2"
								style={{ color: textColor }}
							>
								{genre.name}
							</p>
							{genre.description && (
								<p
									className="text-xs md:text-sm lg:text-base"
									style={{ color: textSecondaryColor }}
								>
									{genre.description}
								</p>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
