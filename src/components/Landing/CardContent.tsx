import { motion, AnimatePresence } from 'framer-motion';
import { RecordPlayer, SamplePlayButton } from '../RecordPlayer';
import { CAROUSEL_CONSTANTS } from '../../constants/carouselConstants';

interface CardContentData {
	nameKo: string;
	name: string;
	description?: string;
	image?: string;
}

interface CardContentProps {
	data: CardContentData;
	isPlaying: boolean;
	onPlayClick: (e: React.MouseEvent) => void;
	onPauseClick: (e?: React.MouseEvent) => void;
	titleTag?: 'h2' | 'h3';
	titleSize?: string;
	nameSize?: string;
}

export const CardContent = ({ data, isPlaying, onPlayClick, onPauseClick, titleTag = 'h2', titleSize = 'text-2xl md:text-3xl', nameSize = 'text-lg md:text-xl' }: CardContentProps) => {
	const TitleTag = titleTag;

	return (
		<AnimatePresence mode="wait">
			{isPlaying ? (
				<motion.div
					key="record-player"
					className="w-full h-full flex items-center justify-center"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					transition={{ duration: CAROUSEL_CONSTANTS.ANIMATION.FADE_DURATION, ease: 'easeInOut' }}
					style={{
						position: 'relative',
						zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_PLAYER_CONTAINER,
					}}
				>
					<RecordPlayer
						imageUrl={data.image || ''}
						onPause={onPauseClick}
					/>
				</motion.div>
			) : (
				<motion.div
					key="default-layout"
					className="text-center w-full"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					transition={{ duration: CAROUSEL_CONSTANTS.ANIMATION.FADE_DURATION, ease: 'easeInOut' }}
				>
					<TitleTag className={`${titleSize} font-semibold text-slate-950 dark:text-white mb-4 drop-shadow-lg`}>{data.nameKo}</TitleTag>
					<SamplePlayButton onClick={onPlayClick} />
					<p
						className={`${nameSize} font-medium text-slate-900 dark:text-white/90 drop-shadow-md uppercase mb-1`}
						style={{ marginTop: 0, marginBottom: '2px' }}
					>
						{data.name}
					</p>
					{data.description && (
						<p
							className="text-sm md:text-base text-slate-800 dark:text-white/80 drop-shadow-sm"
							style={{ marginTop: 0 }}
						>
							{data.description}
						</p>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
};
