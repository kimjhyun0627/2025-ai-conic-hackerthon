import { BaseCarouselSection } from './BaseCarouselSection';
import { MUSIC_THEMES } from '../../constants/themes';
import type { ThemeCategory } from '../../types';

interface CategoryCarouselSectionProps {
	visibleRange: number;
	currentIndex: number;
	playingCategory: ThemeCategory | null;
	onCategoryClick: (index: number) => void;
	onPrev: () => void;
	onNext: () => void;
	onGoTo: (index: number) => void;
	onPlayCategory: (category: ThemeCategory) => void;
	onPauseCategory: () => void;
}

export const CategoryCarouselSection = ({ visibleRange, currentIndex, playingCategory, onCategoryClick, onPrev, onNext, onGoTo, onPlayCategory, onPauseCategory }: CategoryCarouselSectionProps) => {
	const items = MUSIC_THEMES.map((theme) => ({
		id: theme.category,
		nameKo: theme.categoryNameKo,
		name: theme.categoryName,
		description: theme.description,
		image: theme.image,
		category: theme.category,
	}));

	return (
		<BaseCarouselSection
			items={items}
			visibleRange={visibleRange}
			currentIndex={currentIndex}
			playingId={playingCategory}
			onItemClick={(index) => onCategoryClick(index)}
			onPrev={onPrev}
			onNext={onNext}
			onGoTo={onGoTo}
			onPlay={(id) => onPlayCategory(id as ThemeCategory)}
			onPause={onPauseCategory}
			getPlayingId={(item) => (item as { category: ThemeCategory }).category}
			titleTag="h2"
			titleSize="text-2xl md:text-3xl"
			nameSize="text-lg md:text-xl"
		/>
	);
};
