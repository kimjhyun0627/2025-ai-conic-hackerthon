import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { CarouselButton, CarouselIndicators, CarouselCard, CardImage } from '../Carousel';
import { CardContent } from '../CardContent';
import { Button } from '@/shared/components/ui';
import type { ThemeCategory } from '@/shared/types';
import { useWindowWidth } from '@/shared/hooks';

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
	const windowWidth = useWindowWidth();
	const effectiveRange = Math.max(0, visibleRange);
	const hasItems = items.length > 0;

	const buttonOffsetPx = useMemo(() => {
		const safeWidth = windowWidth || 1280;
		const spacing = safeWidth >= 1280 ? 72 : safeWidth >= 1024 ? 56 : safeWidth >= 768 ? 40 : 28;

		const clampOffset = (value: number) => {
			if (!windowWidth) return value;
			const maxOffset = Math.max(windowWidth / 2 - 40, 120);
			return Math.min(value, maxOffset);
		};

		if (effectiveRange <= 0) {
			const activeWidth = Math.min(safeWidth * 0.9, 450);
			return clampOffset(activeWidth / 2 + spacing);
		}

		const inactiveBaseWidth = Math.min(safeWidth * 0.7, 380);

		if (effectiveRange === 1) {
			const baseOffset = 310;
			const sideScale = 0.7;
			const sideHalfWidth = (inactiveBaseWidth * sideScale) / 2;
			return clampOffset(baseOffset + sideHalfWidth + spacing);
		}

		const gap = safeWidth >= 768 ? 24 : 16;
		const buttonPadding = safeWidth >= 768 ? 12 : 8;
		const iconSize = safeWidth >= 768 ? 20 : 16;
		const buttonHalfSize = (buttonPadding * 2 + iconSize) / 2;
		const cardHalfWidth = inactiveBaseWidth / 2;
		const targetOffset = cardHalfWidth + gap + buttonHalfSize;
		const adjustedOffset = targetOffset * 0.85;
		const farSideHalfWidth = (inactiveBaseWidth * 0.6) / 2;

		return clampOffset(adjustedOffset * 2 + farSideHalfWidth + spacing);
	}, [effectiveRange, windowWidth]);

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
