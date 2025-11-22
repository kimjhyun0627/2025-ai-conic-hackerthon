import { motion, AnimatePresence } from 'framer-motion';
import type { MusicGenre } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../constants';

interface GenreImageProps {
	genre: MusicGenre;
	isPlaying: boolean;
	imageOpacity: number;
	zIndex?: number;
}

/**
 * 장르 이미지 렌더링 컴포넌트
 */
export const GenreImage = ({ genre, isPlaying, imageOpacity, zIndex = 4 }: GenreImageProps) => {
	return (
		<motion.div
			{...PLAYER_CONSTANTS.ANIMATIONS.centerImage}
			style={{
				width: '100%',
				height: '100%',
				position: 'relative',
				zIndex,
				border: 'none',
			}}
			className="overflow-hidden rounded-4xl md:rounded-2rem"
		>
			<AnimatePresence>
				{genre.backgroundImage || genre.image ? (
					<motion.img
						key={genre.id}
						src={genre.backgroundImage || genre.image}
						alt={genre.nameKo}
						draggable={false}
						className="w-full h-full object-cover absolute inset-0"
						style={{
							opacity: imageOpacity * 0.3, // 반투명하게 (기존 투명도의 50%)
						}}
						initial={{ opacity: 0 }}
						animate={{ opacity: imageOpacity * 0.5 }}
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
		</motion.div>
	);
};
