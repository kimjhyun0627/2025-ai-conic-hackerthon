import { motion } from 'framer-motion';
import { BaseCarouselSection } from '../BaseCarouselSection';
import type { MusicTheme, MusicGenre } from '@/shared/types';

interface GenreSectionProps {
	selectedTheme: MusicTheme | null;
	visibleRange: number;
	currentIndex: number;
	playingGenre: string | null;
	onGenreClick: (index: number, genre: MusicGenre) => void;
	onPrev: () => void;
	onNext: () => void;
	onGoTo: (index: number) => void;
	onBack: () => void;
	onPlayGenre: (genreId: string) => void;
	onPauseGenre: () => void;
	onIndicatorRef?: (ref: HTMLDivElement | null) => void;
	onBackButtonRef?: (ref: HTMLDivElement | null) => void;
}

export const GenreSection = ({
	selectedTheme,
	visibleRange,
	currentIndex,
	playingGenre,
	onGenreClick,
	onPrev,
	onNext,
	onGoTo,
	onBack,
	onPlayGenre,
	onPauseGenre,
	onIndicatorRef,
	onBackButtonRef,
}: GenreSectionProps) => {
	if (!selectedTheme) return null;

	const items = selectedTheme.genres.map((genre: MusicGenre) => ({
		...genre,
		image: genre.image || selectedTheme.image,
	}));

	return (
		<motion.div
			key="genres"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.4 }}
		>
			<BaseCarouselSection
				items={items}
				visibleRange={visibleRange}
				currentIndex={currentIndex}
				playingId={playingGenre}
				onItemClick={(index, item) => onGenreClick(index, item as MusicGenre)}
				onPrev={onPrev}
				onNext={onNext}
				onGoTo={onGoTo}
				onPlay={onPlayGenre}
				onPause={onPauseGenre}
				onBack={onBack}
				fallbackImage={selectedTheme.image}
				titleTag="h3"
				titleSize="text-3xl md:text-4xl"
				nameSize="text-base md:text-lg"
				onIndicatorRef={onIndicatorRef}
				onBackButtonRef={onBackButtonRef}
			/>
		</motion.div>
	);
};
