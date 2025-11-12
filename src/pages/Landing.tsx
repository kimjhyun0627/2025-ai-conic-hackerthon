import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { getTimeGreeting } from '../utils/timeUtils';
import { MUSIC_THEMES } from '../constants/themes';
import { Button, ThemeToggle } from '../components/ui';
import CarouselCard from '../components/Carousel/CarouselCard';
import { CarouselButton } from '../components/Carousel/CarouselNavigation';
import { CarouselIndicators } from '../components/Carousel/CarouselIndicators';
import { TransitionOverlay } from '../components/TransitionOverlay';
import { CardImage } from '../components/Carousel/CardImage';
import { usePlayerStore } from '../store/playerStore';
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
	const selectedTheme = MUSIC_THEMES.find((theme) => theme.category === selectedCategory);
	const genreCarousel = useCarousel(selectedTheme?.genres || []);

	const greeting = getTimeGreeting();

	// 반응형 텍스트 크기 계산
	const getHeadingSize = () => {
		if (windowWidth >= 1536) return '76px'; // 2xl
		if (windowWidth >= 1280) return '64px'; // xl
		if (windowWidth >= 1024) return '56px'; // lg
		if (windowWidth >= 640) return '48px'; // sm, md
		return '48px'; // 기본 (모바일)
	};

	const getSubtitleSize = () => {
		if (windowWidth >= 1536) return '28px'; // 2xl
		if (windowWidth >= 1280) return '20px'; // xl
		if (windowWidth >= 1024) return '16px'; // lg
		if (windowWidth >= 640) return '14px'; // sm, md
		return '14px'; // 기본 (모바일)
	};

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
				<div className="max-w-6xl w-full mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col">
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
								style={{ fontSize: getHeadingSize() }}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
							>
								{selectedCategory ? `${selectedTheme?.categoryNameKo} 테마를 선택하셨어요` : greeting}
							</motion.h1>
						</AnimatePresence>
						<AnimatePresence mode="wait">
							<motion.p
								key="subtitle-theme"
								className="sm:block font-medium text-slate-700 dark:text-slate-300"
								style={{ fontSize: getSubtitleSize() }}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ delay: 0.2, duration: 0.6 }}
							>
								{!selectedCategory ? '마음에 드는 테마를 선택해보세요' : '원하는 장르를 선택해주세요'}
							</motion.p>
						</AnimatePresence>
					</motion.div>

					<AnimatePresence mode="wait">
						{!selectedCategory ? (
							/* Category Selection - Carousel */
							<motion.div
								key="categories"
								className="w-full flex-1 flex flex-col justify-start"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								{/* Carousel with Navigation Buttons */}
								<div className="flex items-center justify-center gap-4 md:gap-6">
									<CarouselButton
										onClick={categoryCarousel.prev}
										direction="prev"
									/>

									{/* Carousel Container */}
									<div
										className="relative flex items-center justify-center overflow-hidden rounded-3xl"
										style={{
											perspective: '1000px',
											width: '80%',
											maxWidth: '1200px',
											height: 'min(50vh, min(90vw, 450px))',
											backdropFilter: 'blur(10px) saturate(120%)',
											WebkitBackdropFilter: 'blur(10px) saturate(120%)',
										}}
									>
										{MUSIC_THEMES.map((theme, index) => (
											<CarouselCard
												key={index}
												onClick={() => handleCategoryClick(index)}
												index={index}
												currentIndex={categoryCarousel.currentIndex}
												total={MUSIC_THEMES.length}
												visibleRange={visibleRange}
												frontImage={
													<CardImage
														src={theme.image || ''}
														alt={theme.categoryNameKo}
													/>
												}
												backImage={
													<CardImage
														src={theme.image || ''}
														alt={theme.categoryNameKo}
														overlay
													/>
												}
											>
												<AnimatePresence mode="wait">
													{playingCategory === theme.category ? (
														/* 재생 중: 레코드판 표시 */
														<motion.div
															key="record-player"
															className="w-full h-full flex items-center justify-center"
															initial={{ opacity: 0, scale: 0.8 }}
															animate={{ opacity: 1, scale: 1 }}
															exit={{ opacity: 0, scale: 0.8 }}
															transition={{ duration: 0.5, ease: 'easeInOut' }}
															style={{
																position: 'relative',
																zIndex: 10000,
															}}
														>
															<motion.div
																onClick={(e) => {
																	e.stopPropagation();
																	setPlayingCategory(null);
																}}
																className="relative rounded-full overflow-visible cursor-pointer"
																style={{
																	width: 'min(280px, 80vw)',
																	height: 'min(280px, 80vw)',
																	minWidth: '200px',
																	minHeight: '200px',
																	aspectRatio: '1 / 1',
																	position: 'relative',
																	zIndex: 10001,
																	isolation: 'isolate',
																	padding: '6px',
																	background: `conic-gradient(from 0deg, rgba(255, 255, 255, 0.25) 0deg, rgba(255, 255, 255, 0.15) 60deg, rgba(0, 0, 0, 0.4) 120deg, rgba(0, 0, 0, 0.5) 180deg, rgba(0, 0, 0, 0.4) 240deg, rgba(255, 255, 255, 0.15) 300deg, rgba(255, 255, 255, 0.25) 360deg)`,
																	borderRadius: '50%',
																}}
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
															>
																<div
																	className="relative rounded-full overflow-hidden w-full h-full"
																	style={{
																		width: '100%',
																		height: '100%',
																		position: 'relative',
																	}}
																>
																	{/* 배경 이미지 - 회전 */}
																	<motion.div
																		className="absolute inset-0 rounded-full overflow-hidden"
																		animate={{
																			rotate: 360,
																		}}
																		transition={{
																			duration: 3,
																			repeat: Infinity,
																			ease: 'linear',
																		}}
																		style={{
																			transformOrigin: 'center center',
																			backgroundImage: `url(${theme.image || ''})`,
																			backgroundSize: 'cover',
																			backgroundPosition: 'center center',
																			backgroundRepeat: 'no-repeat',
																			zIndex: 1002,
																			position: 'absolute',
																			top: 0,
																			left: 0,
																			right: 0,
																			bottom: 0,
																		}}
																	/>
																	{/* 레코드판 패턴 (원형 그루브) - 회전 */}
																	<motion.div
																		className="absolute inset-0 rounded-full pointer-events-none"
																		animate={{
																			rotate: 360,
																		}}
																		transition={{
																			duration: 3,
																			repeat: Infinity,
																			ease: 'linear',
																		}}
																		style={{
																			transformOrigin: 'center center',
																			background: `
																				radial-gradient(
																					circle at center,
																					transparent 20%,
																					rgba(0, 0, 0, 0.3) 22%,
																					transparent 24%,
																					transparent 28%,
																					rgba(0, 0, 0, 0.25) 30%,
																					transparent 32%,
																					transparent 36%,
																					rgba(0, 0, 0, 0.25) 38%,
																					transparent 40%,
																					transparent 44%,
																					rgba(0, 0, 0, 0.25) 46%,
																					transparent 48%,
																					transparent 52%,
																					rgba(0, 0, 0, 0.25) 54%,
																					transparent 56%,
																					transparent 60%,
																					rgba(0, 0, 0, 0.25) 62%,
																					transparent 64%,
																					transparent 68%,
																					rgba(0, 0, 0, 0.25) 70%,
																					transparent 72%,
																					transparent 76%,
																					rgba(0, 0, 0, 0.25) 78%,
																					transparent 80%,
																					transparent 84%,
																					rgba(0, 0, 0, 0.25) 86%,
																					transparent 88%
																				),
																				repeating-conic-gradient(
																					from 0deg at center,
																					rgba(255, 255, 255, 0.08) 0deg,
																					rgba(255, 255, 255, 0.12) 1deg,
																					rgba(0, 0, 0, 0.15) 2deg,
																					rgba(0, 0, 0, 0.15) 3deg,
																					rgba(255, 255, 255, 0.08) 4deg,
																					rgba(255, 255, 255, 0.12) 5deg,
																					rgba(0, 0, 0, 0.15) 6deg,
																					rgba(0, 0, 0, 0.15) 7deg,
																					rgba(255, 255, 255, 0.08) 8deg
																				)
																			`,
																			maskImage: 'radial-gradient(circle, transparent 20%, black 22%, black 88%, transparent 90%)',
																			WebkitMaskImage: 'radial-gradient(circle, transparent 20%, black 22%, black 88%, transparent 90%)',
																			zIndex: 1003,
																			position: 'absolute',
																			top: 0,
																			left: 0,
																			right: 0,
																			bottom: 0,
																		}}
																	/>
																	{/* 중앙 흰색 원 (레코드판 라벨) */}
																	<div
																		className="absolute rounded-full pointer-events-none"
																		style={{
																			width: '28%',
																			height: '28%',
																			top: '50%',
																			left: '50%',
																			transform: 'translate(-50%, -50%)',
																			background: 'rgba(255, 255, 255, 0.95)',
																			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
																			zIndex: 1004,
																			position: 'absolute',
																		}}
																	/>
																	{/* 중앙 스핀들 홀 */}
																	<div
																		className="absolute rounded-full pointer-events-none"
																		style={{
																			width: '10%',
																			height: '10%',
																			top: '50%',
																			left: '50%',
																			transform: 'translate(-50%, -50%)',
																			background: 'rgba(0, 0, 0, 0.95)',
																			boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(255, 255, 255, 0.1)',
																			zIndex: 1005,
																			position: 'absolute',
																		}}
																	/>
																	{/* Pause 버튼 */}
																	<div
																		className="absolute inset-0 flex items-center justify-center pointer-events-none"
																		style={{ zIndex: 1006, position: 'absolute' }}
																	>
																		<Pause
																			className="w-16 h-16 md:w-20 md:h-20 text-slate-900 dark:text-white drop-shadow-2xl"
																			fill="currentColor"
																		/>
																	</div>
																</div>
															</motion.div>
														</motion.div>
													) : (
														/* 재생 중이 아닐 때: 기존 레이아웃 */
														<motion.div
															key="default-layout"
															className="text-center w-full"
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
															exit={{ opacity: 0 }}
															transition={{ duration: 0.3 }}
														>
															<h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white mb-4 drop-shadow-lg">{theme.categoryNameKo}</h2>
															<motion.button
																onClick={(e) => {
																	e.stopPropagation();
																	setPlayingCategory(theme.category);
																}}
																className="play-button relative rounded-full flex items-center justify-center mx-auto cursor-pointer group mb-3"
																style={{
																	width: '65px',
																	height: '65px',
																	minWidth: '65px',
																	minHeight: '65px',
																	aspectRatio: '1 / 1',
																	border: 'none',
																	zIndex: 1001,
																	position: 'relative',
																	isolation: 'isolate',
																}}
																whileHover={{
																	scale: 1.08,
																}}
																whileTap={{ scale: 0.92 }}
																onHoverStart={(e) => {
																	const target = e.currentTarget as HTMLButtonElement;
																	if (target) {
																		target.classList.add('is-hovered');
																	}
																}}
																onHoverEnd={(e) => {
																	const target = e.currentTarget as HTMLButtonElement;
																	if (target) {
																		target.classList.remove('is-hovered');
																	}
																}}
																transition={{
																	duration: 0.2,
																	ease: 'easeOut',
																}}
															>
																{/* 그라데이션 오버레이 */}
																<div className="absolute inset-0 rounded-full pointer-events-none play-button-overlay" />
																{/* 테두리 글로우 효과 */}
																<div className="play-button-glow" />
																{/* 재생 아이콘 */}
																<div className="absolute inset-0 flex items-center justify-center pointer-events-none play-icon">
																	<Play
																		className="w-7 h-7 md:w-8 md:h-8 drop-shadow-lg"
																		fill="currentColor"
																		style={{ marginLeft: '3px' }}
																	/>
																</div>
															</motion.button>
															<p
																className="text-lg md:text-xl font-medium text-slate-800 dark:text-white/90 drop-shadow-md uppercase mb-1"
																style={{ marginTop: 0, marginBottom: '2px' }}
															>
																{theme.categoryName}
															</p>
															{theme.description && (
																<p
																	className="text-sm md:text-base text-slate-700 dark:text-white/80 drop-shadow-sm"
																	style={{ marginTop: 0 }}
																>
																	{theme.description}
																</p>
															)}
														</motion.div>
													)}
												</AnimatePresence>
											</CarouselCard>
										))}
									</div>

									<CarouselButton
										onClick={categoryCarousel.next}
										direction="next"
									/>
								</div>

								{/* Indicator Dots - Centered */}
								<CarouselIndicators
									count={MUSIC_THEMES.length}
									currentIndex={categoryCarousel.currentIndex}
									onSelect={categoryCarousel.goTo}
								/>
							</motion.div>
						) : (
							/* Genre Selection - Carousel */
							<motion.div
								key="genres"
								className="w-full flex-1 flex flex-col justify-start"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.4 }}
							>
								{/* Carousel with Navigation Buttons */}
								<div className="flex items-center justify-center gap-4 md:gap-6">
									<CarouselButton
										onClick={genreCarousel.prev}
										direction="prev"
									/>

									{/* Carousel Container */}
									<div
										className="relative flex items-center justify-center overflow-hidden rounded-3xl"
										style={{
											perspective: '1000px',
											width: '80%',
											maxWidth: '1200px',
											height: 'min(50vh, min(90vw, 450px))',
											backdropFilter: 'blur(10px) saturate(120%)',
											WebkitBackdropFilter: 'blur(10px) saturate(120%)',
										}}
									>
										{selectedTheme?.genres.map((genre, index) => (
											<CarouselCard
												key={index}
												onClick={() => handleGenreClick(index, genre)}
												index={index}
												currentIndex={genreCarousel.currentIndex}
												total={selectedTheme.genres.length}
												visibleRange={genreVisibleRange}
												frontImage={
													<CardImage
														src={genre.image || selectedTheme?.image || ''}
														alt={genre.nameKo}
													/>
												}
												backImage={
													<CardImage
														src={genre.image || selectedTheme?.image || ''}
														alt={genre.nameKo}
														overlay
													/>
												}
											>
												<AnimatePresence mode="wait">
													{playingGenre === genre.id ? (
														/* 재생 중: 레코드판 표시 */
														<motion.div
															key="record-player"
															className="w-full h-full flex items-center justify-center"
															initial={{ opacity: 0, scale: 0.8 }}
															animate={{ opacity: 1, scale: 1 }}
															exit={{ opacity: 0, scale: 0.8 }}
															transition={{ duration: 0.5, ease: 'easeInOut' }}
															style={{
																position: 'relative',
																zIndex: 10000,
															}}
														>
															<motion.div
																onClick={(e) => {
																	e.stopPropagation();
																	setPlayingGenre(null);
																}}
																className="relative rounded-full overflow-visible cursor-pointer"
																style={{
																	width: 'min(280px, 80vw)',
																	height: 'min(280px, 80vw)',
																	minWidth: '200px',
																	minHeight: '200px',
																	aspectRatio: '1 / 1',
																	position: 'relative',
																	zIndex: 10001,
																	isolation: 'isolate',
																	padding: '6px',
																	background: `conic-gradient(from 0deg, rgba(255, 255, 255, 0.25) 0deg, rgba(255, 255, 255, 0.15) 60deg, rgba(0, 0, 0, 0.4) 120deg, rgba(0, 0, 0, 0.5) 180deg, rgba(0, 0, 0, 0.4) 240deg, rgba(255, 255, 255, 0.15) 300deg, rgba(255, 255, 255, 0.25) 360deg)`,
																	borderRadius: '50%',
																}}
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
															>
																<div
																	className="relative rounded-full overflow-hidden w-full h-full"
																	style={{
																		width: '100%',
																		height: '100%',
																		position: 'relative',
																	}}
																>
																	{/* 배경 이미지 - 회전 */}
																	<motion.div
																		className="absolute inset-0 rounded-full overflow-hidden"
																		animate={{
																			rotate: 360,
																		}}
																		transition={{
																			duration: 3,
																			repeat: Infinity,
																			ease: 'linear',
																		}}
																		style={{
																			transformOrigin: 'center center',
																			backgroundImage: `url(${genre.image || selectedTheme?.image || ''})`,
																			backgroundSize: 'cover',
																			backgroundPosition: 'center center',
																			backgroundRepeat: 'no-repeat',
																			zIndex: 1002,
																			position: 'absolute',
																			top: 0,
																			left: 0,
																			right: 0,
																			bottom: 0,
																		}}
																	/>
																	{/* 레코드판 패턴 (원형 그루브) - 회전 */}
																	<motion.div
																		className="absolute inset-0 rounded-full pointer-events-none"
																		animate={{
																			rotate: 360,
																		}}
																		transition={{
																			duration: 3,
																			repeat: Infinity,
																			ease: 'linear',
																		}}
																		style={{
																			transformOrigin: 'center center',
																			background: `
																				radial-gradient(
																					circle at center,
																					transparent 20%,
																					rgba(0, 0, 0, 0.3) 22%,
																					transparent 24%,
																					transparent 28%,
																					rgba(0, 0, 0, 0.25) 30%,
																					transparent 32%,
																					transparent 36%,
																					rgba(0, 0, 0, 0.25) 38%,
																					transparent 40%,
																					transparent 44%,
																					rgba(0, 0, 0, 0.25) 46%,
																					transparent 48%,
																					transparent 52%,
																					rgba(0, 0, 0, 0.25) 54%,
																					transparent 56%,
																					transparent 60%,
																					rgba(0, 0, 0, 0.25) 62%,
																					transparent 64%,
																					transparent 68%,
																					rgba(0, 0, 0, 0.25) 70%,
																					transparent 72%,
																					transparent 76%,
																					rgba(0, 0, 0, 0.25) 78%,
																					transparent 80%,
																					transparent 84%,
																					rgba(0, 0, 0, 0.25) 86%,
																					transparent 88%
																				),
																				repeating-conic-gradient(
																					from 0deg at center,
																					rgba(255, 255, 255, 0.08) 0deg,
																					rgba(255, 255, 255, 0.12) 1deg,
																					rgba(0, 0, 0, 0.15) 2deg,
																					rgba(0, 0, 0, 0.15) 3deg,
																					rgba(255, 255, 255, 0.08) 4deg,
																					rgba(255, 255, 255, 0.12) 5deg,
																					rgba(0, 0, 0, 0.15) 6deg,
																					rgba(0, 0, 0, 0.15) 7deg,
																					rgba(255, 255, 255, 0.08) 8deg
																				)
																			`,
																			maskImage: 'radial-gradient(circle, transparent 20%, black 22%, black 88%, transparent 90%)',
																			WebkitMaskImage: 'radial-gradient(circle, transparent 20%, black 22%, black 88%, transparent 90%)',
																			zIndex: 1003,
																			position: 'absolute',
																			top: 0,
																			left: 0,
																			right: 0,
																			bottom: 0,
																		}}
																	/>
																	{/* 중앙 흰색 원 (레코드판 라벨) */}
																	<div
																		className="absolute rounded-full pointer-events-none"
																		style={{
																			width: '28%',
																			height: '28%',
																			top: '50%',
																			left: '50%',
																			transform: 'translate(-50%, -50%)',
																			background: 'rgba(255, 255, 255, 0.95)',
																			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
																			zIndex: 1004,
																			position: 'absolute',
																		}}
																	/>
																	{/* 중앙 스핀들 홀 */}
																	<div
																		className="absolute rounded-full pointer-events-none"
																		style={{
																			width: '10%',
																			height: '10%',
																			top: '50%',
																			left: '50%',
																			transform: 'translate(-50%, -50%)',
																			background: 'rgba(0, 0, 0, 0.95)',
																			boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(255, 255, 255, 0.1)',
																			zIndex: 1005,
																			position: 'absolute',
																		}}
																	/>
																	{/* Pause 버튼 */}
																	<div
																		className="absolute inset-0 flex items-center justify-center pointer-events-none"
																		style={{ zIndex: 1006, position: 'absolute' }}
																	>
																		<Pause
																			className="w-16 h-16 md:w-20 md:h-20 text-slate-900 dark:text-white drop-shadow-2xl"
																			fill="currentColor"
																		/>
																	</div>
																</div>
															</motion.div>
														</motion.div>
													) : (
														/* 재생 중이 아닐 때: 기존 레이아웃 */
														<motion.div
															key="default-layout"
															className="text-center w-full"
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
															exit={{ opacity: 0 }}
															transition={{ duration: 0.3 }}
														>
															<h3 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white drop-shadow-lg mb-4">{genre.nameKo}</h3>
															<motion.button
																onClick={(e) => {
																	e.stopPropagation();
																	setPlayingGenre(genre.id);
																}}
																className="play-button relative rounded-full flex items-center justify-center mx-auto cursor-pointer group mb-3"
																style={{
																	width: '65px',
																	height: '65px',
																	minWidth: '65px',
																	minHeight: '65px',
																	aspectRatio: '1 / 1',
																	border: 'none',
																	zIndex: 1001,
																	position: 'relative',
																	isolation: 'isolate',
																}}
																whileHover={{
																	scale: 1.08,
																}}
																whileTap={{ scale: 0.92 }}
																onHoverStart={(e) => {
																	const target = e.currentTarget as HTMLButtonElement;
																	if (target) {
																		target.classList.add('is-hovered');
																	}
																}}
																onHoverEnd={(e) => {
																	const target = e.currentTarget as HTMLButtonElement;
																	if (target) {
																		target.classList.remove('is-hovered');
																	}
																}}
																transition={{
																	duration: 0.2,
																	ease: 'easeOut',
																}}
															>
																{/* 그라데이션 오버레이 */}
																<div className="absolute inset-0 rounded-full pointer-events-none play-button-overlay" />
																{/* 테두리 글로우 효과 */}
																<div className="play-button-glow" />
																{/* 재생 아이콘 */}
																<div className="absolute inset-0 flex items-center justify-center pointer-events-none play-icon">
																	<Play
																		className="w-7 h-7 md:w-8 md:h-8 drop-shadow-lg"
																		fill="currentColor"
																		style={{ marginLeft: '3px' }}
																	/>
																</div>
															</motion.button>
															<p className="text-base md:text-lg font-semibold text-slate-800 dark:text-white/90 drop-shadow-md uppercase mb-1">{genre.name}</p>
															{genre.description && (
																<p className="text-sm md:text-base text-slate-700 dark:text-white/80 leading-relaxed px-2 drop-shadow-sm">{genre.description}</p>
															)}
														</motion.div>
													)}
												</AnimatePresence>
											</CarouselCard>
										))}
									</div>

									<CarouselButton
										onClick={genreCarousel.next}
										direction="next"
									/>
								</div>

								{/* Indicator Dots - Centered */}
								{selectedTheme && (
									<CarouselIndicators
										count={selectedTheme.genres.length}
										currentIndex={genreCarousel.currentIndex}
										onSelect={genreCarousel.goTo}
									/>
								)}
								<motion.div
									className="flex items-center justify-center mb-8 px-6 md:px-12"
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
								>
									<Button
										variant="ghost"
										size="md"
										onClick={handleBack}
										className="btn-glass rounded-[10px] backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/30 dark:hover:bg-slate-800/40 hover:shadow-xl transition-all duration-300 font-medium"
										style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
									>
										테마 다시 선택하기
									</Button>
								</motion.div>
							</motion.div>
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
					<p className="text-sm text-slate-500 dark:text-slate-400 pointer-events-auto">AI가 생성하는 나만의 음악 경험, SERVICENAME</p>
				</motion.div>
			</div>
		</>
	);
};

export default Landing;
