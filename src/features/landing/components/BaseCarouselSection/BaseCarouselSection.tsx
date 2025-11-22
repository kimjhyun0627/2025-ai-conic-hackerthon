import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { CarouselButton, CarouselIndicators, CarouselCard, CardImage } from '../Carousel';
import { CardContent } from '../CardContent';
import { Button } from '@/shared/components/ui';
import type { ThemeCategory } from '@/shared/types';
import { useWindowWidth } from '@/shared/hooks';
import { calculateButtonOffset } from '../../utils/carouselUtils';

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
	onIndicatorRef?: (ref: HTMLDivElement | null) => void;
	onBackButtonRef?: (ref: HTMLDivElement | null) => void;
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
	onIndicatorRef,
	onBackButtonRef,
}: CarouselSectionProps<T>) => {
	const windowWidth = useWindowWidth();
	const effectiveRange = Math.max(0, visibleRange);
	const hasItems = items.length > 0;

	const buttonOffsetPx = useMemo(() => calculateButtonOffset(windowWidth, effectiveRange), [effectiveRange, windowWidth]);

	const buttonOffsetValue = `${Math.round(buttonOffsetPx)}px`;

	const baseButtonWrapperStyle: CSSProperties = {
		position: 'absolute',
		top: '50%',
		transform: 'translate(-50%, -50%)',
		zIndex: 40,
		transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
	};

	const prevButtonWrapperStyle: CSSProperties = {
		...baseButtonWrapperStyle,
		left: `calc(50% - ${buttonOffsetValue})`,
	};

	const nextButtonWrapperStyle: CSSProperties = {
		...baseButtonWrapperStyle,
		left: `calc(50% + ${buttonOffsetValue})`,
	};

	if (!hasItems) return null;

	return (
		<div className="w-full flex-1 flex flex-col justify-start">
			{/* Carousel with Navigation Buttons */}
			<div className="relative flex items-center justify-center w-full">
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
										// itemPlayingId는 이미 getPlayingId를 통해 올바른 타입으로 변환됨
										onPlay(itemPlayingId);
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

				<div style={prevButtonWrapperStyle}>
					<CarouselButton
						onClick={onPrev}
						direction="prev"
					/>
				</div>

				<div style={nextButtonWrapperStyle}>
					<CarouselButton
						onClick={onNext}
						direction="next"
					/>
				</div>
			</div>

			{/* Indicator Dots - Centered */}
			<div ref={onIndicatorRef}>
				<CarouselIndicators
					count={items.length}
					currentIndex={currentIndex}
					onSelect={onGoTo}
					labels={items.map((item) => item.nameKo)}
				/>
			</div>

			{/* Back Button */}
			{onBack && (
				<motion.div
					ref={onBackButtonRef}
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
