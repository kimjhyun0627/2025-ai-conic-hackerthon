import { motion } from 'framer-motion';
import type { MusicGenre } from '../../types';
import { PLAYER_ANIMATIONS } from '../../constants/playerConstants';

interface PlayerCenterImageProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

export const PlayerCenterImage = ({ genre, isPlaying }: PlayerCenterImageProps) => {
	return (
		<div className="flex-1 flex items-center justify-center p-6 md:p-8 pt-32 pb-40 relative">
			<div className="w-full max-w-4xl aspect-square glass-card rounded-4xl md:rounded-[2.5rem] overflow-hidden shadow-2xl relative">
				<motion.div
					{...PLAYER_ANIMATIONS.centerImage}
					style={{
						width: '100%',
						height: '100%',
					}}
				>
					{genre.image ? (
						<motion.img
							src={genre.image}
							alt={genre.nameKo}
							className="w-full h-full object-cover"
							initial={{ scale: 1.1 }}
							animate={{ scale: isPlaying ? 1.05 : 1 }}
							transition={{ duration: 4, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500/20 to-primary-700/20">
							<motion.div className="text-8xl" {...(isPlaying ? PLAYER_ANIMATIONS.emojiAnimation : {})}>
								🎵
							</motion.div>
						</div>
					)}
					{/* Animated Background Gradient Overlay */}
					{isPlaying && (
						<motion.div className="absolute inset-0 opacity-30" {...PLAYER_ANIMATIONS.gradientOverlay} />
					)}
				</motion.div>
			</div>
		</div>
	);
};

