import { motion, AnimatePresence } from 'framer-motion';
import type { MusicGenre } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../constants';

interface PlayerCenterImageProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

export const PlayerCenterImage = ({ genre, isPlaying }: PlayerCenterImageProps) => {
	return (
		<div className="flex-1 flex items-center justify-center p-6 md:p-8 pt-32 pb-40 relative">
			<div className="w-full max-w-4xl aspect-square glass-card rounded-4xl md:rounded-[2.5rem] overflow-hidden shadow-2xl relative">
				<motion.div
					{...PLAYER_CONSTANTS.ANIMATIONS.centerImage}
					style={{
						width: '100%',
						height: '100%',
					}}
				>
					<AnimatePresence>
						{genre.image ? (
							<motion.img
								key={genre.id}
								src={genre.image}
								alt={genre.nameKo}
								draggable={false}
								className="w-full h-full object-cover absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, scale: isPlaying ? 1.05 : 1 }}
								exit={{ opacity: 0 }}
								transition={{
									opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
									scale: { duration: 4, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
								}}
							/>
						) : (
							<motion.div
								key={`fallback-${genre.id}`}
								className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500/20 to-primary-700/20 absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
							>
								<motion.div
									className="text-8xl"
									{...(isPlaying
										? {
												animate: {
													scale: [1, 1.1, 1],
													rotate: [0, 5, -5, 0],
												},
												transition: {
													duration: 2,
													repeat: Infinity,
													ease: 'easeInOut',
												},
											}
										: {})}
								>
									🎵
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
					{/* Animated Background Gradient Overlay */}
					{isPlaying && (
						<motion.div
							className="absolute inset-0 opacity-30"
							animate={{
								background: [
									'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3), transparent 50%)',
									'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.3), transparent 50%)',
									'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.3), transparent 50%)',
									'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3), transparent 50%)',
								],
							}}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						/>
					)}
				</motion.div>
			</div>
		</div>
	);
};
