import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Maximize, Minimize, Music, ChevronDown } from 'lucide-react';
import { Button, ThemeToggle } from '@/shared/components/ui';
import { useFullscreen, useThemeColors } from '@/shared/hooks';
import { PLAYER_CONSTANTS } from '../../constants';
import { useThemeStore } from '@/store/themeStore';
import { usePlayerStore } from '@/store/playerStore';
import { usePlayerParams, useGenreTrack } from '../../hooks';
import { VisualizationModeDropdown } from './VisualizationModeDropdown';
import { DEFAULT_VISUALIZATION_MODE } from '../../constants/visualizationModes';
import type { MusicGenre } from '@/shared/types';
import type { VisualizationMode } from '../../types/visualization';

interface TopBarProps {
	onHomeClick: () => void;
	isVisible?: boolean;
	visualizationMode?: VisualizationMode;
	onVisualizationModeChange?: (mode: VisualizationMode) => void;
}

export const TopBar = ({ onHomeClick, isVisible = true, visualizationMode = DEFAULT_VISUALIZATION_MODE, onVisualizationModeChange }: TopBarProps) => {
	const { isFullscreen, toggleFullscreen } = useFullscreen();
	const theme = useThemeStore((state) => state.theme);
	const selectedGenre = usePlayerStore((state) => state.selectedGenre);
	const { selectedTheme } = usePlayerParams();
	const colors = useThemeColors();
	const { handleGenreSelect } = useGenreTrack();
	const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
	const [isVisualizationDropdownOpen, setIsVisualizationDropdownOpen] = useState(false);
	const [hoveredGenreId, setHoveredGenreId] = useState<string | null>(null);
	const [isFullscreenHovered, setIsFullscreenHovered] = useState(false);
	const [isGenreButtonHovered, setIsGenreButtonHovered] = useState(false);
	const [isHomeButtonHovered, setIsHomeButtonHovered] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// 현재 카테고리의 장르 목록 가져오기
	const currentGenres = selectedTheme?.genres || [];

	// 장르 드롭다운 외부 클릭 시 닫기 (비주얼 모드 드롭다운은 자체적으로 처리)
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

	const onGenreSelect = async (genre: MusicGenre) => {
		// 같은 장르를 재선택한 경우 아무 액션도 하지 않음
		if (selectedGenre?.id === genre.id) {
			setIsGenreDropdownOpen(false);
			return;
		}

		// 드롭다운 닫기
		setIsGenreDropdownOpen(false);

		// 장르 선택 처리 (useGenreTrack 훅에서 처리)
		await handleGenreSelect(genre);
	};

	return (
		<>
			<div className="absolute top-6 right-6 z-10000 flex items-center gap-3">
				<AnimatePresence>
					{isVisible && (
						<>
							{/* 시각화 모드 선택 드롭다운 */}
							{onVisualizationModeChange && (
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
									<VisualizationModeDropdown
										visualizationMode={visualizationMode}
										onVisualizationModeChange={onVisualizationModeChange}
										isOpen={isVisualizationDropdownOpen}
										onOpenChange={setIsVisualizationDropdownOpen}
										onCloseOtherDropdown={() => setIsGenreDropdownOpen(false)}
									/>
								</motion.div>
							)}

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
											...PLAYER_CONSTANTS.ANIMATIONS.topBarDelayed.transition,
										},
									},
								}}
								className="relative"
								ref={dropdownRef}
							>
								<div
									onMouseEnter={() => setIsGenreButtonHovered(true)}
									onMouseLeave={() => setIsGenreButtonHovered(false)}
								>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setIsVisualizationDropdownOpen(false); // 비주얼 모드 드롭다운 닫기
											setIsGenreDropdownOpen(!isGenreDropdownOpen); // 장르 드롭다운 토글
										}}
										className="btn-glass rounded-2xl backdrop-blur-md border shadow-lg hover:shadow-xl transition-all duration-300 h-11 px-4 py-0 flex items-center"
										style={{
											background: colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)',
											borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
											color: isGenreButtonHovered || isGenreDropdownOpen ? '#fb7185' : colors.isDark ? '#f1f5f9' : '#0f172a',
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.7)';
											e.currentTarget.style.color = '#fb7185';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)';
											e.currentTarget.style.color = colors.isDark ? '#f1f5f9' : '#0f172a';
										}}
									>
										<Music
											className="w-5 h-5 mr-2"
											style={{
												color: isGenreButtonHovered || isGenreDropdownOpen ? '#fb7185' : undefined,
											}}
										/>
										<span
											style={{
												color: isGenreButtonHovered || isGenreDropdownOpen ? '#fb7185' : colors.isDark ? '#f1f5f9' : '#0f172a',
											}}
										>
											{selectedGenre?.nameKo || '장르 선택'}
										</span>
										<ChevronDown
											className={`w-4 h-4 ml-2 transition-transform duration-200 ${isGenreDropdownOpen ? 'rotate-180' : ''}`}
											style={{
												color: isGenreButtonHovered || isGenreDropdownOpen ? '#fb7185' : undefined,
											}}
										/>
									</Button>
								</div>

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
												zIndex: 110000, // 파라미터 패널(z-100)보다 위에 표시
											}}
										>
											<div className="p-2">
												{currentGenres.map((genre) => (
													<motion.button
														key={genre.id}
														onClick={() => onGenreSelect(genre)}
														onMouseEnter={() => setHoveredGenreId(genre.id)}
														onMouseLeave={() => setHoveredGenreId(null)}
														className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 last:mb-0 transition-all ${selectedGenre?.id === genre.id ? 'bg-primary-500/20 border-2' : 'hover:bg-white/10 dark:hover:bg-white/5 border-2 border-transparent'}`}
														style={
															selectedGenre?.id === genre.id
																? { borderColor: 'rgba(251, 113, 133, 0.5)' } // primary-500/50
																: undefined
														}
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
																style={{
																	color:
																		hoveredGenreId === genre.id || selectedGenre?.id === genre.id
																			? '#fb7185' // primary-500 (호버 시 또는 선택된 장르 프라이머리 컬러)
																			: theme === 'dark'
																				? '#f1f5f9'
																				: '#0f172a',
																}}
															>
																{genre.nameKo}
															</div>
															{genre.description && (
																<div
																	className="text-sm line-clamp-2"
																	style={{
																		color:
																			hoveredGenreId === genre.id || selectedGenre?.id === genre.id
																				? 'rgba(251, 113, 133, 0.8)' // primary-500 with opacity
																				: colors.textSecondaryColor,
																	}}
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
											...PLAYER_CONSTANTS.ANIMATIONS.topBarDelayed.transition,
										},
									},
								}}
							>
								<div
									onMouseEnter={() => setIsHomeButtonHovered(true)}
									onMouseLeave={() => setIsHomeButtonHovered(false)}
								>
									<Button
										variant="ghost"
										size="sm"
										onClick={onHomeClick}
										className="btn-glass rounded-2xl backdrop-blur-md border shadow-lg hover:shadow-xl transition-all duration-300 h-11 px-4 py-0 flex items-center"
										style={{
											background: colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)',
											borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
											color: isHomeButtonHovered ? '#fb7185' : colors.isDark ? '#f1f5f9' : '#0f172a',
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.7)';
											e.currentTarget.style.color = '#fb7185';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)';
											e.currentTarget.style.color = colors.isDark ? '#f1f5f9' : '#0f172a';
										}}
									>
										<Home
											className="w-5 h-5 mr-2"
											style={{ color: isHomeButtonHovered ? '#fb7185' : undefined }}
										/>
										<span
											style={{
												color: isHomeButtonHovered ? '#fb7185' : colors.isDark ? '#f1f5f9' : '#0f172a',
											}}
										>
											홈으로
										</span>
									</Button>
								</div>
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
								<div
									className="h-11 rounded-2xl backdrop-blur-md border shadow-lg hover:shadow-xl transition-all duration-300"
									style={{
										background: colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)',
										borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.7)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)';
									}}
								>
									<ThemeToggle />
								</div>
							</motion.div>
						</>
					)}
				</AnimatePresence>

				{/* 전체화면 버튼 */}
				<motion.div {...PLAYER_CONSTANTS.ANIMATIONS.topBar}>
					<button
						onClick={toggleFullscreen}
						onMouseEnter={(e) => {
							setIsFullscreenHovered(true);
							e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.7)';
						}}
						onMouseLeave={(e) => {
							setIsFullscreenHovered(false);
							e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)';
						}}
						className="p-3 rounded-2xl btn-glass hover:glow-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 backdrop-blur-md border shadow-lg"
						style={{
							background: colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)',
							borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
						}}
						aria-label={isFullscreen ? '전체화면 해제' : '전체화면'}
					>
						{isFullscreen ? (
							<Minimize
								className="w-5 h-5 dark:text-slate-300"
								style={{ color: isFullscreenHovered ? '#fb7185' : theme === 'dark' ? undefined : '#0f172a' }}
							/>
						) : (
							<Maximize
								className="w-5 h-5 dark:text-slate-300"
								style={{ color: isFullscreenHovered ? '#fb7185' : theme === 'dark' ? undefined : '#0f172a' }}
							/>
						)}
					</button>
				</motion.div>
			</div>
		</>
	);
};
