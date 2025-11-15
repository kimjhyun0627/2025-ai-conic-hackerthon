import { motion } from 'framer-motion';
import { CarouselButton, CarouselIndicators, CarouselCard, CardImage } from './carousel';
import { CardContent } from './CardContent';
import { Button } from '../UI/index';
import type { ThemeCategory } from '../../types';

interface CarouselItem {
	id: string;
	nameKo: string;
	name: string;
	description?: string;
	image?: string;
}

interface CarouselSectionProps<T extends CarouselItem> {
	items: T[];
	visibleRange: number;
	currentIndex: number;
	playingId: string | ThemeCategory | null;
	onItemClick: (index: number, item: T) => void;
	onPrev: () => void;
	onNext: () => void;
	onGoTo: (index: number) => void;
	onPlay: (id: string | ThemeCategory) => void;
	onPause: () => void;
	onBack?: () => void;
	fallbackImage?: string;
	titleTag?: 'h2' | 'h3';
	titleSize?: string;
	nameSize?: string;
	getPlayingId?: (item: T) => string | ThemeCategory;
}

export const BaseCarouselSection = <T extends CarouselItem>({
	items,
	visibleRange,
	currentIndex,
	playingId,
	onItemClick,
	onPrev,
	onNext,
	onGoTo,
	onPlay,
	onPause,
	onBack,
	fallbackImage,
	titleTag = 'h2',
	titleSize = 'text-2xl md:text-3xl',
	nameSize = 'text-lg md:text-xl',
	getPlayingId,
}: CarouselSectionProps<T>) => {
	if (items.length === 0) return null;

	return (
		<div className="w-full flex-1 flex flex-col justify-start">
			{/* Carousel with Navigation Buttons */}
			<div className="flex items-center justify-center gap-4 md:gap-6">
				<CarouselButton
					onClick={onPrev}
					direction="prev"
				/>

				{/* Carousel Container */}
				<div
					className="relative flex items-center justify-center overflow-visible rounded-3xl"
					style={{
						perspective: '1000px',
						width: '90%',
						maxWidth: '1800px',
						height: 'min(60vh, min(90vw, 550px))',
						backdropFilter: 'blur(10px) saturate(120%)',
						WebkitBackdropFilter: 'blur(10px) saturate(120%)',
					}}
				>
					{items.map((item, index) => {
						const imageUrl = item.image || fallbackImage || '';
						const itemPlayingId = getPlayingId ? getPlayingId(item) : item.id;
						const isPlaying = playingId === itemPlayingId;

						return (
							<CarouselCard
								key={index}
								onClick={() => onItemClick(index, item)}
								index={index}
								currentIndex={currentIndex}
								total={items.length}
								visibleRange={visibleRange}
								frontImage={
									<CardImage
										src={imageUrl}
										alt={item.nameKo}
									/>
								}
								backImage={
									<CardImage
										src={imageUrl}
										alt={item.nameKo}
										overlay
									/>
								}
							>
								<CardContent
									data={item}
									isPlaying={!!isPlaying}
									onPlayClick={(e) => {
										e.stopPropagation();
										onPlay(item.id as string | ThemeCategory);
									}}
									onPauseClick={(e) => {
										e?.stopPropagation();
										onPause();
									}}
									titleTag={titleTag}
									titleSize={titleSize}
									nameSize={nameSize}
								/>
							</CarouselCard>
						);
					})}
				</div>

				<CarouselButton
					onClick={onNext}
					direction="next"
				/>
			</div>

			{/* Indicator Dots - Centered */}
			<CarouselIndicators
				count={items.length}
				currentIndex={currentIndex}
				onSelect={onGoTo}
			/>

			{/* Back Button */}
			{onBack && (
				<motion.div
					className="flex items-center justify-center mb-4 mt-4 px-6 md:px-12"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<Button
						variant="ghost"
						size="md"
						onClick={onBack}
						className="btn-glass rounded-[10px] backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/30 dark:hover:bg-slate-800/40 hover:shadow-xl transition-all duration-300 font-medium"
						style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
					>
						테마 다시 선택하기
					</Button>
				</motion.div>
			)}
		</div>
	);
};
