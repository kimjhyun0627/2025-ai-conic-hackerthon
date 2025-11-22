import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Maximize, Minimize, Grid3x3, ChevronDown } from 'lucide-react';
import { Button, ThemeToggle, Toast } from '@/shared/components/ui';
import { useFullscreen, useThemeColors } from '@/shared/hooks';
import { PLAYER_CONSTANTS } from '../../constants';
import { useThemeStore } from '@/store/themeStore';
import { usePlayerStore } from '@/store/playerStore';
import { usePlayerParams } from '../../hooks';
import type { MusicGenre } from '@/shared/types';

interface PlayerTopBarProps {
	onHomeClick: () => void;
	isVisible?: boolean;
}

export const PlayerTopBar = ({ onHomeClick, isVisible = true }: PlayerTopBarProps) => {
	const { isFullscreen, toggleFullscreen } = useFullscreen();
	const theme = useThemeStore((state) => state.theme);
	const { selectedGenre } = usePlayerStore();
	const { selectedTheme } = usePlayerParams();
	const colors = useThemeColors();
	const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// 현재 카테고리의 장르 목록 가져오기
	const currentGenres = selectedTheme?.genres || [];

	// 드롭다운 외부 클릭 시 닫기
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsGenreDropdownOpen(false);
			}
		};

		if (isGenreDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isGenreDropdownOpen]);

	const handleGenreSelect = (genre: MusicGenre) => {
		// 같은 장르를 재선택한 경우 아무 액션도 하지 않음
		if (selectedGenre?.id === genre.id) {
			setIsGenreDropdownOpen(false);
			return;
		}

		// 다른 장르 선택 시 토스트 표시 후 3초 딜레이
		setShowToast(true);
		setIsGenreDropdownOpen(false);
		// 3초 딜레이 후 장르 변경
		setTimeout(() => {
			usePlayerStore.getState().setSelectedGenre(genre);
			setShowToast(false);
		}, 3000);
	};

	return (
		<>
			<div className="absolute top-6 right-6 z-10 flex items-center gap-3">
				<AnimatePresence>
					{isVisible && (
						<>
							{/* 장르 선택 드롭다운 */}
							<motion.div
								initial="hidden"
								animate="visible"
								exit="hidden"
								variants={{
									hidden: {
										opacity: 0,
										y: -20,
										transition: {
											opacity: {
												duration: 0.3,
												ease: [0.4, 0, 0.2, 1],
											},
											y: {
												duration: 0.3,
												ease: [0.4, 0, 0.2, 1],
											},
										},
									},
									visible: {
										opacity: 1,
										y: 0,
										transition: {
											...PLAYER_CONSTANTS.ANIMATIONS.topBar.transition,
										},
									},
								}}
								className="relative"
								ref={dropdownRef}
							>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
									className={PLAYER_CONSTANTS.STYLES.glassButton.homeButton}
								>
									<Grid3x3 className="w-5 h-5 mr-2" />
									장르 선택
									<ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
								</Button>

								{/* 드롭다운 메뉴 */}
								<AnimatePresence>
									{isGenreDropdownOpen && currentGenres.length > 0 && (
										<motion.div
											initial={{ opacity: 0, y: -10, scale: 0.95 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: -10, scale: 0.95 }}
											transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
											className="absolute top-full right-0 mt-2 w-80 max-h-[60vh] overflow-y-auto rounded-2xl shadow-2xl border backdrop-blur-xl"
											style={{
												background: colors.glassBackground,
												borderColor: colors.glassBorder,
											}}
										>
											<div className="p-2">
												{currentGenres.map((genre) => (
													<motion.button
														key={genre.id}
														onClick={() => handleGenreSelect(genre)}
														className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 last:mb-0 transition-all ${
															selectedGenre?.id === genre.id
																? 'bg-primary-500/20 border-2 border-primary-500/50'
																: 'hover:bg-white/10 dark:hover:bg-white/5 border-2 border-transparent'
														}`}
														whileHover={{ scale: 1.02 }}
														whileTap={{ scale: 0.98 }}
													>
														{/* 장르 이미지 */}
														<div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden">
															<img
																src={genre.image || selectedTheme?.image}
																alt={genre.nameKo}
																className="w-full h-full object-cover"
															/>
														</div>
														{/* 장르 정보 */}
														<div className="flex-1 text-left min-w-0">
															<div
																className="font-semibold text-base mb-1 truncate"
																style={{ color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
															>
																{genre.nameKo}
															</div>
															{genre.description && (
																<div
																	className="text-sm line-clamp-2"
																	style={{ color: colors.textSecondaryColor }}
																>
																	{genre.description}
																</div>
															)}
														</div>
													</motion.button>
												))}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
							<motion.div
								initial="hidden"
								animate="visible"
								exit="hidden"
								variants={{
									hidden: {
										opacity: 0,
										y: -20,
										transition: {
											opacity: {
												duration: 0.3,
												ease: [0.4, 0, 0.2, 1],
											},
											y: {
												duration: 0.3,
												ease: [0.4, 0, 0.2, 1],
											},
										},
									},
									visible: {
										opacity: 1,
										y: 0,
										transition: {
											...PLAYER_CONSTANTS.ANIMATIONS.topBar.transition,
										},
									},
								}}
							>
								<Button
									variant="ghost"
									size="sm"
									onClick={onHomeClick}
									className={PLAYER_CONSTANTS.STYLES.glassButton.homeButton}
								>
									<Home className="w-5 h-5 mr-2" />
									홈으로
								</Button>
							</motion.div>

							<motion.div
								initial="hidden"
								animate="visible"
								exit="hidden"
								variants={{
									hidden: {
										opacity: 0,
										y: -20,
										transition: {
											opacity: {
												duration: 0.3,
												ease: [0.4, 0, 0.2, 1],
											},
											y: {
												duration: 0.3,
												ease: [0.4, 0, 0.2, 1],
											},
										},
									},
									visible: {
										opacity: 1,
										y: 0,
										transition: {
											...PLAYER_CONSTANTS.ANIMATIONS.topBarDelayed.transition,
										},
									},
								}}
							>
								<ThemeToggle className="h-11 rounded-2xl backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/30 dark:hover:bg-slate-800/40 hover:shadow-xl transition-all duration-300" />
							</motion.div>
						</>
					)}
				</AnimatePresence>

				{/* 전체화면 버튼 */}
				<motion.div {...PLAYER_CONSTANTS.ANIMATIONS.topBar}>
					<button
						onClick={toggleFullscreen}
						className={PLAYER_CONSTANTS.STYLES.glassButton.base}
						aria-label={isFullscreen ? '전체화면 해제' : '전체화면'}
					>
						{isFullscreen ? (
							<Minimize
								className="w-5 h-5 dark:text-slate-300"
								style={{ color: theme === 'dark' ? undefined : '#0f172a' }}
							/>
						) : (
							<Maximize
								className="w-5 h-5 dark:text-slate-300"
								style={{ color: theme === 'dark' ? undefined : '#0f172a' }}
							/>
						)}
					</button>
				</motion.div>
			</div>

			{/* Toast 메시지 */}
			{showToast && (
				<Toast
					message="음악이 생성되면 세부 장르로 넘어가요!"
					type="info"
					duration={3000}
					onClose={() => setShowToast(false)}
				/>
			)}
		</>
	);
};
