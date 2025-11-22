import { motion, AnimatePresence } from 'framer-motion';
import type { MusicGenre } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../../constants';

interface GenreImageProps {
	genre: MusicGenre;
	isPlaying: boolean;
	imageOpacity: number;
	zIndex?: number;
	/**
	 * 컨테이너 border 스타일
	 * @default 'none'
	 */
	border?: string;
	/**
	 * 컨테이너 className
	 * @default 'overflow-hidden rounded-4xl md:rounded-2rem'
	 */
	className?: string;
	/**
	 * 이미지 투명도 배율 (기본 이미지 투명도에 곱해짐)
	 * @default 0.5
	 */
	opacityMultiplier?: number;
}

/**
 * 장르 이미지 렌더링 컴포넌트 (공통)
 */
export const GenreImage = ({ genre, isPlaying, imageOpacity, zIndex = 4, border = 'none', className = 'overflow-hidden rounded-4xl md:rounded-2rem', opacityMultiplier = 0.5 }: GenreImageProps) => {
	return (
		<motion.div
			{...PLAYER_CONSTANTS.ANIMATIONS.centerImage}
			style={{
				width: '100%',
				height: '100%',
				position: 'relative',
				zIndex,
				border,
			}}
			className={className}
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
							opacity: imageOpacity * opacityMultiplier,
						}}
						initial={{ opacity: 0 }}
						animate={{ opacity: imageOpacity * opacityMultiplier }}
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
