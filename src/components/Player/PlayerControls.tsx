import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, ChevronUp, ChevronDown } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useGlassButton } from '../../hooks/useGlassButton';
import { PLAYER_ANIMATIONS, PLAYER_STYLES } from '../../constants/playerConstants';
import { formatTime } from '../../utils/timeUtils';
import type { MusicGenre } from '../../types';

interface PlayerControlsProps {
	genre: MusicGenre;
	isExpanded: boolean;
	isVisible: boolean;
	onToggleExpand: () => void;
	onToggleVisibility: () => void;
	onPrev: () => void;
	onNext: () => void;
}

export const PlayerControls = ({ genre, isExpanded, isVisible, onToggleExpand, onToggleVisibility, onPrev, onNext }: PlayerControlsProps) => {
	const { isPlaying, volume, currentTime, duration, setIsPlaying, setVolume, setCurrentTime } = usePlayerStore();
	const colors = useThemeColors();
	const { buttonStyle, handleMouseEnter, handleMouseLeave } = useGlassButton();

	const handlePlayPause = () => {
		setIsPlaying(!isPlaying);
	};

	const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrentTime(Number(e.target.value));
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setVolume(Number(e.target.value));
	};

	const toggleMute = () => {
		setVolume(volume === 0 ? 50 : 0);
	};

	const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<div className="px-6 md:px-8 py-4 md:py-6 w-full">
			<div className="space-y-4">
				{/* Track Info */}
				<div className="text-center">
					<p
						className="text-sm md:text-base font-semibold"
						style={{ color: colors.textMutedColor }}
					>
						{genre.nameKo}{' '}
						<span
							className="mx-2"
							style={{ color: colors.textSecondaryColor }}
						>
							•
						</span>{' '}
						Track 1
					</p>
				</div>

				{/* Progress Bar */}
				<div className="flex items-center gap-3 md:gap-4">
					<span
						className="text-xs md:text-sm w-12 text-right font-mono"
						style={{ color: colors.textSecondaryColor }}
					>
						{formatTime(currentTime)}
					</span>
					<div className="flex-1 relative group">
						<input
							type="range"
							min={0}
							max={duration || 100}
							value={currentTime}
							onChange={handleProgressChange}
							className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb transition-all duration-200"
						/>
						<motion.div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								height: '0.5rem',
								background: 'linear-gradient(to right, #a855f7, #9333ea)',
								borderRadius: '0.5rem',
								pointerEvents: 'none',
								width: `${progressPercentage}%`,
							}}
							initial={{ width: 0 }}
							animate={{ width: `${progressPercentage}%` }}
							transition={{ duration: 0.1 }}
						/>
					</div>
					<span
						className="text-xs md:text-sm w-12 font-mono"
						style={{ color: colors.textSecondaryColor }}
					>
						{formatTime(duration)}
					</span>
				</div>

				{/* Playback Controls */}
				<div className="flex items-center gap-2 md:gap-4">
					{/* Left Side: Volume Control */}
					<div className="flex items-center gap-2 md:gap-3 shrink-0">
						<button
							onClick={toggleMute}
							className={PLAYER_STYLES.glassButton.controlButton}
							style={buttonStyle}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							aria-label="음소거"
						>
							{volume === 0 ? (
								<VolumeX
									className="w-4 h-4 md:w-5 md:h-5"
									style={{ color: colors.iconColor }}
								/>
							) : (
								<Volume2
									className="w-4 h-4 md:w-5 md:h-5"
									style={{ color: colors.iconColor }}
								/>
							)}
						</button>
						<div className="hidden md:flex items-center gap-2">
							<input
								type="range"
								min={0}
								max={100}
								value={volume}
								onChange={handleVolumeChange}
								className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
							/>
							<span
								className="text-xs font-medium w-8 text-right"
								style={{ color: colors.textSecondaryColor }}
							>
								{volume}
							</span>
						</div>
					</div>

					{/* Center: Playback Controls - 정 중앙 배치 */}
					<div className="flex-1 flex items-center justify-center gap-3 md:gap-4">
						<button
							onClick={onPrev}
							className={PLAYER_STYLES.glassButton.controlButton}
							style={buttonStyle}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							aria-label="이전 트랙"
						>
							<SkipBack
								className="w-5 h-5 md:w-6 md:h-6"
								style={{ color: colors.iconColor }}
							/>
						</button>

						<button
							onClick={handlePlayPause}
							className={PLAYER_STYLES.glassButton.playButton}
							style={{
								background: colors.playButtonGradient,
							}}
							aria-label={isPlaying ? '일시정지' : '재생'}
						>
							<motion.div
								style={{
									position: 'absolute',
									inset: 0,
									background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
								}}
								animate={isPlaying ? { x: ['-100%', '200%'] } : { x: '-100%' }}
								transition={PLAYER_ANIMATIONS.playButtonShine.transition}
							/>
							<AnimatePresence mode="wait">
								{isPlaying ? (
									<motion.div
										key="pause"
										{...PLAYER_ANIMATIONS.playButtonIcon}
									>
										<Pause className="w-6 h-6 md:w-8 md:h-8 text-white fill-white relative z-10" />
									</motion.div>
								) : (
									<motion.div
										key="play"
										{...PLAYER_ANIMATIONS.playButtonIcon}
									>
										<Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white ml-1 relative z-10" />
									</motion.div>
								)}
							</AnimatePresence>
						</button>

						<button
							onClick={onNext}
							className={PLAYER_STYLES.glassButton.controlButton}
							style={buttonStyle}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							aria-label="다음 트랙"
						>
							<SkipForward
								className="w-5 h-5 md:w-6 md:h-6"
								style={{ color: colors.iconColor }}
							/>
						</button>
					</div>

					{/* Right Side: Toggle Buttons */}
					<div
						className="flex items-center gap-2 shrink-0"
						style={{ width: 'fit-content' }}
					>
						<button
							onClick={onToggleExpand}
							className={PLAYER_STYLES.glassButton.controlButton}
							style={buttonStyle}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							aria-label={isExpanded ? '세부조정 닫기' : '세부조정 열기'}
						>
							<motion.div
								animate={{ rotate: isExpanded ? 180 : 0 }}
								transition={PLAYER_ANIMATIONS.expandButton.transition}
							>
								<ChevronUp
									className="w-5 h-5 md:w-6 md:h-6"
									style={{ color: colors.iconColor }}
								/>
							</motion.div>
						</button>
						<button
							onClick={onToggleVisibility}
							className={PLAYER_STYLES.glassButton.controlButton}
							style={buttonStyle}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							aria-label={isVisible ? '컨트롤러 숨기기' : '컨트롤러 보이기'}
						>
							<motion.div
								animate={{ rotate: isVisible ? 0 : 180 }}
								transition={PLAYER_ANIMATIONS.expandButton.transition}
							>
								<ChevronDown
									className="w-5 h-5 md:w-6 md:h-6"
									style={{ color: colors.iconColor }}
								/>
							</motion.div>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
