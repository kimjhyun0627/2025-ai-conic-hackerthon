import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimeGreeting } from '../utils/timeUtils';
import { getResponsiveTextSize, getResponsiveNavTextSize } from '../utils/responsiveUtils';
import { MUSIC_THEMES } from '../constants/themes';
import { ThemeToggle } from '../components/UI/index';
import { TransitionOverlay } from '../components/common';
import { CategorySection, GenreSection } from '../components/Landing';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { useVisibleRange } from '../hooks/useVisibleRange';
import { useCarousel } from '../hooks/useCarousel';
import type { MusicGenre, ThemeCategory } from '../types';

const Landing = () => {
	const navigate = useNavigate();
	const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | null>(null);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [playingCategory, setPlayingCategory] = useState<ThemeCategory | null>(null);
	const [playingGenre, setPlayingGenre] = useState<string | null>(null);
	const setSelectedGenre = usePlayerStore((state) => state.setSelectedGenre);

	const windowWidth = useWindowWidth();
	const visibleRange = useVisibleRange(windowWidth, 2);
	const genreVisibleRange = useVisibleRange(windowWidth, 1);

	const categoryCarousel = useCarousel(MUSIC_THEMES);
	const selectedTheme = MUSIC_THEMES.find((musicTheme) => musicTheme.category === selectedCategory);
	const genreCarousel = useCarousel(selectedTheme?.genres || []);

	const theme = useThemeStore((state) => state.theme);
	const greeting = getTimeGreeting();
	const headingSize = getResponsiveTextSize(windowWidth, 'heading');
	const subtitleSize = getResponsiveTextSize(windowWidth, 'subtitle');
	const captionSize = getResponsiveTextSize(windowWidth, 'caption');
	const navTextSize = getResponsiveNavTextSize(windowWidth);

	// 다크 모드에 따른 색상 설정
	const subtitleColor = theme === 'dark' ? '#cbd5e1' : '#334155'; // slate-300 : slate-700
	const captionColor = theme === 'dark' ? '#94a3b8' : '#475569'; // slate-400 : slate-600

	const handleGenreSelect = useCallback(
		async (genre: MusicGenre) => {
			setIsTransitioning(true);
			setSelectedGenre(genre);

			// 부드러운 전환을 위한 짧은 딜레이
			await new Promise((resolve) => setTimeout(resolve, 600));
			navigate('/player');
		},
		[navigate, setSelectedGenre]
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
				handleGenreSelect(genre);
			} else {
				genreCarousel.goTo(index);
			}
		},
		[genreCarousel, handleGenreSelect]
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
				<TransitionOverlay isVisible={isTransitioning} />

				{/* Main Content */}
				<div className={`max-w-6xl w-full mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col ${selectedCategory ? 'pb-16 md:pb-24 lg:pb-32 xl:pb-40' : ''}`}>
					{/* Greeting Section */}
					<motion.div
						className="text-center space-y-2 md:space-y-3"
						style={{ paddingTop: 'clamp(12vh, 18vh, 25vh)' }}
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
							/>
						)}
					</AnimatePresence>
				</div>

				{/* Footer */}
				<motion.div
					className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center w-full z-10 pointer-events-none"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
				>
					<p
						className="text-slate-500 dark:text-slate-400 pointer-events-auto"
						style={{ fontSize: navTextSize }}
					>
						AI가 생성하는 나만의 음악 경험, MOODWAVE
					</p>
				</motion.div>
			</div>
		</>
	);
};

export default Landing;
