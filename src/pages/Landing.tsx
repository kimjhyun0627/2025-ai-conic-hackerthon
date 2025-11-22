import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimeGreeting, getResponsiveTextSize, getResponsiveNavTextSize } from '@/shared/utils';
import { MUSIC_THEMES } from '@/shared/constants';
import { ThemeToggle } from '@/shared/components/ui';
import { TransitionOverlay } from '@/shared/components/common';
import { CategorySection, GenreSection } from '@/features/landing/components';
import { GradientOverlay } from '@/features/player/components';
import { useThemeStore } from '@/store/themeStore';
import { useWindowWidth, useWindowSize } from '@/shared/hooks';
import { useVisibleRange, useCarousel, useGenreSelection } from '@/features/landing/hooks';
import type { MusicGenre, ThemeCategory } from '@/shared/types';

const Landing = () => {
	const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | null>(null);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [playingCategory, setPlayingCategory] = useState<ThemeCategory | null>(null);
	const [playingGenre, setPlayingGenre] = useState<string | null>(null);

	const windowWidth = useWindowWidth();
	const { height } = useWindowSize();
	const visibleRange = useVisibleRange(windowWidth, 2);
	const genreVisibleRange = useVisibleRange(windowWidth, 1);
	const indicatorRef = useRef<HTMLDivElement | null>(null);
	const backButtonRef = useRef<HTMLDivElement | null>(null);
	const [indicatorBottom, setIndicatorBottom] = useState<number | null>(null);
	const [backButtonBottom, setBackButtonBottom] = useState<number | null>(null);

	// 장르 선택 및 음악 생성 훅
	const { handleGenreSelect, handleCancelApiCall } = useGenreSelection();

	// 상단 텍스트 블록 paddingTop 계산 (선형 보간)
	// 화면 높이 400px → 48px (12vh), 화면 높이 1200px → 300px (25vh)
	const minHeight = 400;
	const maxHeight = 1600;
	const minPaddingTop = 18; // 12vh at 400px
	const maxPaddingTop = 200; // 25vh at 1200px

	const textBlockPaddingTop = useMemo(() => {
		if (!height) return minPaddingTop;
		if (height <= minHeight) return minPaddingTop;
		if (height >= maxHeight) return maxPaddingTop;
		// 선형 보간
		const ratio = (height - minHeight) / (maxHeight - minHeight);
		return Math.round(minPaddingTop + (maxPaddingTop - minPaddingTop) * ratio);
	}, [height]);

	const categoryCarousel = useCarousel(MUSIC_THEMES, { randomInitialIndex: true });
	const selectedTheme = MUSIC_THEMES.find((musicTheme) => musicTheme.category === selectedCategory);
	const genreCarousel = useCarousel(selectedTheme?.genres || [], { randomInitialIndex: true });

	// 인디케이터 위치 업데이트 함수
	const updateIndicatorPosition = useCallback(() => {
		if (!indicatorRef.current) {
			setIndicatorBottom(null);
			return;
		}

		const rect = indicatorRef.current.getBoundingClientRect();
		// 인디케이터의 하단이 뷰포트 하단에서 얼마나 떨어져 있는지 계산
		// rect.bottom은 뷰포트 기준 하단 위치이므로, window.innerHeight - rect.bottom이 뷰포트 하단에서의 거리
		// 음수면 인디케이터가 뷰포트 밖에 있음
		const distanceFromViewportBottom = window.innerHeight - rect.bottom;
		setIndicatorBottom(distanceFromViewportBottom);
	}, []);

	// "테마 다시 선택하기" 버튼 위치 업데이트 함수
	const updateBackButtonPosition = useCallback(() => {
		if (!backButtonRef.current) {
			setBackButtonBottom(null);
			return;
		}

		const rect = backButtonRef.current.getBoundingClientRect();
		// 버튼의 하단이 뷰포트 하단에서 얼마나 떨어져 있는지 계산
		const distanceFromViewportBottom = window.innerHeight - rect.bottom;
		setBackButtonBottom(distanceFromViewportBottom);
	}, []);

	// 인디케이터 ref 콜백
	const handleIndicatorRef = useCallback(
		(ref: HTMLDivElement | null) => {
			indicatorRef.current = ref;
			updateIndicatorPosition();
		},
		[updateIndicatorPosition]
	);

	// "테마 다시 선택하기" 버튼 ref 콜백
	const handleBackButtonRef = useCallback(
		(ref: HTMLDivElement | null) => {
			backButtonRef.current = ref;
			updateBackButtonPosition();
		},
		[updateBackButtonPosition]
	);

	// 인디케이터 위치 업데이트 (리사이즈 및 스크롤 시)
	useEffect(() => {
		const updatePositions = () => {
			updateIndicatorPosition();
			updateBackButtonPosition();
		};

		updatePositions();
		window.addEventListener('resize', updatePositions);
		window.addEventListener('scroll', updatePositions);

		return () => {
			window.removeEventListener('resize', updatePositions);
			window.removeEventListener('scroll', updatePositions);
		};
	}, [updateIndicatorPosition, updateBackButtonPosition, selectedCategory, categoryCarousel.currentIndex, genreCarousel.currentIndex]);

	// Footer 위치 계산: "테마 다시 선택하기" 버튼이 있으면 버튼 아래, 인디케이터가 화면 하단에 보일 때는 인디케이터 아래, 그 외에는 화면 하단 고정
	const shouldFollowBackButton = useMemo(() => {
		if (!selectedCategory || backButtonBottom === null) {
			return false;
		}
		// 버튼이 화면 하단 근처에 있거나 그 아래로 내려갔을 때
		const threshold = 50; // 50px 이내면 버튼을 따라감
		return backButtonBottom <= threshold;
	}, [selectedCategory, backButtonBottom]);

	const shouldFollowIndicator = useMemo(() => {
		if (shouldFollowBackButton || indicatorBottom === null) {
			return false;
		}

		// 인디케이터가 화면 하단 근처에 있거나 그 아래로 내려갔을 때
		// footer는 인디케이터 아래 12px에 배치되어 스크롤과 함께 움직임
		// 인디케이터가 화면 위쪽에 있으면 (indicatorBottom이 큰 양수) footer는 화면 하단에 고정
		// 인디케이터가 화면 하단에 보이기 시작하는 순간부터 footer를 따라가게 함
		// footer 높이 + 간격(12px)을 고려하여 약 50px 이내면 인디케이터를 따라감
		const threshold = 50; // 50px 이내면 인디케이터를 따라감
		return indicatorBottom <= threshold;
	}, [shouldFollowBackButton, indicatorBottom]);

	const theme = useThemeStore((state) => state.theme);
	const isDark = theme === 'dark';
	const greeting = getTimeGreeting();
	const headingSize = getResponsiveTextSize(windowWidth, 'heading');
	const subtitleSize = getResponsiveTextSize(windowWidth, 'subtitle');
	const captionSize = getResponsiveTextSize(windowWidth, 'caption');
	const navTextSize = getResponsiveNavTextSize(windowWidth);

	// 다크 모드에 따른 색상 설정
	const subtitleColor = isDark ? '#cbd5e1' : '#334155'; // slate-300 : slate-700
	const captionColor = isDark ? '#94a3b8' : '#475569'; // slate-400 : slate-600

	// handleGenreSelect는 useGenreSelection 훅에서 가져옴
	const onGenreSelect = useCallback(
		(genre: MusicGenre) => {
			handleGenreSelect(genre, setIsTransitioning);
		},
		[handleGenreSelect]
	);

	const handleCategorySelect = useCallback(() => {
		const category = MUSIC_THEMES[categoryCarousel.currentIndex].category;
		setSelectedCategory(category);
		setPlayingGenre(null);
		genreCarousel.goTo(0);
		// 세부 장르 선택 페이지로 진입할 때 히스토리 상태 추가
		window.history.pushState({ genreSelection: true, category }, '', window.location.href);
	}, [categoryCarousel, genreCarousel]);

	const handleCategoryClick = useCallback(
		(index: number) => {
			if (index === categoryCarousel.currentIndex) {
				handleCategorySelect();
			} else {
				categoryCarousel.goTo(index);
			}
		},
		[categoryCarousel, handleCategorySelect]
	);

	const handleGenreClick = useCallback(
		(index: number, genre: MusicGenre) => {
			if (index === genreCarousel.currentIndex) {
				onGenreSelect(genre);
			} else {
				genreCarousel.goTo(index);
			}
		},
		[genreCarousel, onGenreSelect]
	);

	const handleBack = useCallback(() => {
		setSelectedCategory(null);
		setPlayingGenre(null);
		genreCarousel.goTo(0);
	}, [genreCarousel]);

	// 브라우저 뒤로가기 인터셉트
	useEffect(() => {
		const handlePopState = (event: PopStateEvent) => {
			// 세부 장르 선택 페이지에 있을 때 뒤로가기를 누르면
			if (selectedCategory) {
				// 히스토리 상태를 확인하여 처음 화면으로 돌아가기
				// event.state가 null이거나 genreSelection이 없으면 처음 화면으로 돌아감
				if (!event.state || !event.state.genreSelection) {
					handleBack();
				}
			}
		};

		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, [selectedCategory, handleBack]);

	return (
		<>
			<GradientOverlay
				isVisible={isTransitioning}
				type="genreChange"
				zIndex={140}
			/>
			{/* Theme Toggle - Fixed Top Right */}
			<motion.div
				style={{
					position: 'fixed',
					top: '1.5rem',
					right: '1.5rem',
					zIndex: 9999,
				}}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
			>
				<ThemeToggle />
			</motion.div>

			<div className="h-screen p-6 relative overflow-x-hidden">
				{/* Transition Overlay */}
				<TransitionOverlay
					isVisible={isTransitioning}
					onCancel={handleCancelApiCall}
				/>

				{/* Main Content */}
				<div className={`max-w-6xl w-full mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col ${selectedCategory ? 'pb-16 md:pb-24 lg:pb-32 xl:pb-40' : ''}`}>
					{/* Greeting Section */}
					<motion.div
						className="text-center space-y-2 md:space-y-3"
						style={{ paddingTop: `${textBlockPaddingTop}px` }}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<AnimatePresence mode="wait">
							<motion.h1
								key={selectedCategory ? 'selected' : 'greeting'}
								className="font-semibold text-center text-gradient"
								style={{ fontSize: headingSize }}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
							>
								{selectedCategory ? `${selectedTheme?.categoryNameKo} 테마를 선택하셨어요` : greeting}
							</motion.h1>
						</AnimatePresence>
						<AnimatePresence>
							<motion.p
								key="subtitle-main"
								className="sm:block font-medium"
								style={{
									fontSize: subtitleSize,
									color: subtitleColor,
								}}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ delay: 0.2, duration: 0.6 }}
							>
								{!selectedCategory ? '마음에 드는 테마를 선택해보세요' : '마음에 드는 장르를 선택해보세요'}
							</motion.p>
							<motion.p
								key="subtitle-caption"
								className="sm:block font-medium"
								style={{
									fontSize: captionSize,
									color: captionColor,
								}}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ delay: 0.2, duration: 0.6 }}
							>
								재생 버튼을 눌러 어떤 음악이 나올지 확인해보세요
							</motion.p>
						</AnimatePresence>
					</motion.div>

					<AnimatePresence
						mode="wait"
						initial={false}
					>
						{!selectedCategory ? (
							<CategorySection
								key="category-section"
								visibleRange={visibleRange}
								currentIndex={categoryCarousel.currentIndex}
								playingCategory={playingCategory}
								onCategoryClick={handleCategoryClick}
								onPrev={categoryCarousel.prev}
								onNext={categoryCarousel.next}
								onGoTo={categoryCarousel.goTo}
								onPlayCategory={setPlayingCategory}
								onPauseCategory={() => setPlayingCategory(null)}
								onIndicatorRef={handleIndicatorRef}
							/>
						) : (
							<GenreSection
								key="genre-section"
								selectedTheme={selectedTheme || null}
								visibleRange={genreVisibleRange}
								currentIndex={genreCarousel.currentIndex}
								playingGenre={playingGenre}
								onGenreClick={handleGenreClick}
								onPrev={genreCarousel.prev}
								onNext={genreCarousel.next}
								onGoTo={genreCarousel.goTo}
								onBack={handleBack}
								onPlayGenre={setPlayingGenre}
								onPauseGenre={() => setPlayingGenre(null)}
								onIndicatorRef={handleIndicatorRef}
								onBackButtonRef={handleBackButtonRef}
							/>
						)}
					</AnimatePresence>

					{/* Footer - "테마 다시 선택하기" 버튼 아래에 배치 (스크롤과 함께 움직임) */}
					{shouldFollowBackButton && (
						<motion.div
							className="text-center w-full pointer-events-none"
							style={{ marginTop: '12px' }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.8 }}
						>
							<p
								className="pointer-events-auto"
								style={{
									fontSize: navTextSize,
									color: isDark ? 'rgba(255, 200, 120, 0.7)' : 'rgba(139, 38, 53, 0.7)', // 웜톤 색상
								}}
							>
								AI가 생성하는 나만의 음악 경험, MOODWAVE
							</p>
						</motion.div>
					)}
					{/* Footer - 인디케이터 아래에 배치 (스크롤과 함께 움직임) */}
					{shouldFollowIndicator && !shouldFollowBackButton && (
						<motion.div
							className="text-center w-full pointer-events-none"
							style={{ marginTop: '12px' }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.8 }}
						>
							<p
								className="pointer-events-auto"
								style={{
									fontSize: navTextSize,
									color: isDark ? 'rgba(255, 200, 120, 0.7)' : 'rgba(139, 38, 53, 0.7)', // 웜톤 색상
								}}
							>
								AI가 생성하는 나만의 음악 경험, MOODWAVE
							</p>
						</motion.div>
					)}
				</div>

				{/* Footer - 화면 하단에 고정 (화면이 클 때) */}
				{!shouldFollowIndicator && !shouldFollowBackButton && (
					<motion.div
						className="fixed left-1/2 transform -translate-x-1/2 text-center w-full z-10 pointer-events-none"
						style={{ bottom: '12px' }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8 }}
					>
						<p
							className="pointer-events-auto"
							style={{
								fontSize: navTextSize,
								color: isDark ? 'rgba(251, 146, 60, 0.7)' : 'rgba(139, 38, 53, 0.7)', // 웜톤 색상
							}}
						>
							AI가 생성하는 나만의 음악 경험, MOODWAVE
						</p>
					</motion.div>
				)}
			</div>
		</>
	);
};

export default Landing;
