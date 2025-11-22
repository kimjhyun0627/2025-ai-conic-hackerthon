import { motion, AnimatePresence } from 'framer-motion';
import type { MusicGenre } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../constants';
import { useThemeColors } from '@/shared/hooks';

interface PlayerCenterImageProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

export const PlayerCenterImage = ({ genre, isPlaying }: PlayerCenterImageProps) => {
	const colors = useThemeColors();

	// 테마별 이미지 투명도 및 애니메이션 색상
	const imageOpacity = colors.isDark ? 0.85 : 0.95;
	const waveOpacity = colors.isDark ? 0.3 : 0.15;
	const waveColor1 = colors.isDark ? 'rgba(251, 113, 133, 0.4)' : 'rgba(251, 113, 133, 0.25)';
	const waveColor2 = colors.isDark ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.25)';
	const waveColor3 = colors.isDark ? 'rgba(236, 72, 153, 0.4)' : 'rgba(236, 72, 153, 0.25)';

	return (
		<div className="fixed inset-0 z-0 flex items-center justify-center md:pt-[28px] md:pb-[28px] py-[40px] md:px-[28px] md:py-[40px]">
			<motion.div
				className="w-full h-full glass-card rounded-xl md:rounded-2rem overflow-hidden shadow-2xl relative"
				// animate={
				// 	isPlaying
				// 		? {
				// 				scale: [1, 1.17, 1],
				// 			}
				// 		: { scale: 1 }
				// }
				// transition={{
				// 	duration: 9,
				// 	repeat: isPlaying ? Infinity : 0,
				// 	ease: 'easeInOut',
				// }}
			>
				<motion.div
					{...PLAYER_CONSTANTS.ANIMATIONS.centerImage}
					style={{
						width: '100%',
						height: '100%',
					}}
				>
					<AnimatePresence>
						{genre.backgroundImage || genre.image ? (
							<motion.img
								key={genre.id}
								src={genre.backgroundImage || genre.image}
								alt={genre.nameKo}
								draggable={false}
								className="w-full h-full object-cover absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: imageOpacity }}
								exit={{ opacity: 0 }}
								transition={{
									opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
								}}
							/>
						) : (
							<motion.div
								key={`fallback-${genre.id}`}
								className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500/20 to-primary-700/20 absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
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
					{/* {isPlaying && (
						<motion.div
							className="absolute inset-0 opacity-30"
							animate={{
								background: [
									'radial-gradient(circle at 20% 50%, rgba(251, 113, 133, 0.3), transparent 50%)',
									'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.3), transparent 50%)',
									'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.3), transparent 50%)',
									'radial-gradient(circle at 20% 50%, rgba(251, 113, 133, 0.3), transparent 50%)',
								],
							}}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						/>
					)} */}
					{/* 물결치는 효과 */}
					{isPlaying && (
						<>
							<motion.div
								className="absolute inset-0"
								style={{
									opacity: waveOpacity,
									background: `linear-gradient(90deg, transparent, ${waveColor1}, transparent)`,
									backgroundSize: '200% 100%',
								}}
								animate={{
									backgroundPosition: ['-200% 0', '200% 0'],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: 'linear',
								}}
							/>
							<motion.div
								className="absolute inset-0"
								style={{
									opacity: waveOpacity,
									background: `linear-gradient(90deg, transparent, ${waveColor2}, transparent)`,
									backgroundSize: '200% 100%',
								}}
								animate={{
									backgroundPosition: ['200% 0', '-200% 0'],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: 'linear',
									delay: 1,
								}}
							/>
							<motion.div
								className="absolute inset-0"
								style={{
									opacity: waveOpacity,
									background: `linear-gradient(90deg, transparent, ${waveColor3}, transparent)`,
									backgroundSize: '200% 100%',
								}}
								animate={{
									backgroundPosition: ['-200% 0', '200% 0'],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: 'linear',
									delay: 2,
								}}
							/>
						</>
					)}
				</motion.div>
			</motion.div>
		</div>
	);
};
