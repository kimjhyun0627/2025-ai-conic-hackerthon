import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Home, Maximize, Minimize } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { ThemeToggle, Slider, Button } from '../components/ui';
import { PARAM_RANGES } from '../constants/themes';
import { formatTime } from '../utils/timeUtils';

const Player = () => {
	const navigate = useNavigate();
	const [isFullscreen, setIsFullscreen] = useState(false);

	const { selectedGenre, isPlaying, volume, currentTime, duration, audioParams, setIsPlaying, setVolume, setCurrentTime, setAudioParams } = usePlayerStore();

	// 장르가 선택되지 않았으면 랜딩 페이지로 리다이렉트
	useEffect(() => {
		if (!selectedGenre) {
			navigate('/');
		}
	}, [selectedGenre, navigate]);

	// 전체화면 상태 감지
	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
	}, []);

	if (!selectedGenre) {
		return null;
	}

	const handlePlayPause = () => {
		setIsPlaying(!isPlaying);
	};

	const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrentTime(Number(e.target.value));
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setVolume(Number(e.target.value));
	};

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
			setIsFullscreen(true);
		} else {
			document.exitFullscreen();
			setIsFullscreen(false);
		}
	};

	const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<>
			{/* Theme Toggle - Fixed Top Right */}
			<div
				style={{
					position: 'fixed',
					top: '1.5rem',
					right: '1.5rem',
					zIndex: 9999,
				}}
			>
				<ThemeToggle />
			</div>

			<div className="min-h-screen flex flex-col">
				{/* Top Bar */}
				<div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate('/')}
						className="btn-glass !rounded-2xl"
					>
						<Home className="w-5 h-5 mr-2" />
						홈으로
					</Button>

					<div className="flex items-center gap-3">
						<button
							onClick={toggleFullscreen}
							className="p-3 rounded-2xl btn-glass hover:glow-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
							aria-label={isFullscreen ? '전체화면 해제' : '전체화면'}
						>
							{isFullscreen ? <Minimize className="w-5 h-5 text-slate-700 dark:text-slate-300" /> : <Maximize className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
						</button>
					</div>
				</div>

				{/* Visual Area */}
				<div className="flex-1 flex flex-col items-center justify-center p-8 pt-24 relative">
					{/* Genre Display */}
					<div className="text-center space-y-4 mb-12 animate-fade-in">
						<h1 className="text-6xl md:text-7xl font-semibold text-gradient drop-shadow-lg">{selectedGenre.nameKo}</h1>
						<p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-400 font-light">{selectedGenre.name}</p>
						{selectedGenre.description && <p className="text-base text-slate-500 dark:text-slate-500 max-w-md mx-auto">{selectedGenre.description}</p>}
					</div>

					{/* Visualizer */}
					<div className="w-full max-w-3xl h-72 md:h-96 glass-card rounded-[2rem] flex items-center justify-center shadow-2xl animate-slide-up">
						<div className="text-center space-y-6">
							<div className="relative">
								<div className="text-8xl animate-pulse-slow">🎵</div>
								{isPlaying && (
									<div className="absolute inset-0 animate-ping opacity-20">
										<div className="text-8xl">🎵</div>
									</div>
								)}
							</div>
							<p className="text-xl font-medium text-slate-600 dark:text-slate-400">{isPlaying ? '재생 중...' : '일시정지'}</p>
						</div>
					</div>
				</div>

				{/* Control Area */}
				<div className="glass-effect border-t border-slate-200 dark:border-slate-700 p-6 md:p-8">
					<div className="max-w-6xl mx-auto space-y-8">
						{/* Track Info */}
						<div className="text-center">
							<p className="text-base font-semibold text-slate-700 dark:text-slate-300">
								{selectedGenre.nameKo} <span className="text-slate-400 dark:text-slate-600">•</span> Track 1
							</p>
						</div>

						{/* Progress Bar */}
						<div className="space-y-2">
							<div className="flex items-center gap-4">
								<span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">{formatTime(currentTime)}</span>
								<div className="flex-1 relative">
									<input
										type="range"
										min={0}
										max={duration || 100}
										value={currentTime}
										onChange={handleProgressChange}
										className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
									/>
									<div
										className="absolute top-0 left-0 h-2 bg-primary-600 rounded-lg pointer-events-none"
										style={{ width: `${progressPercentage}%` }}
									/>
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-400 w-12">{formatTime(duration)}</span>
							</div>
						</div>

						{/* AI Parameters */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Slider
								label="에너지"
								value={audioParams.energy}
								min={PARAM_RANGES.energy.min}
								max={PARAM_RANGES.energy.max}
								step={PARAM_RANGES.energy.step}
								onChange={(e) => setAudioParams({ energy: Number(e.target.value) })}
							/>
							<Slider
								label="베이스"
								value={audioParams.bass}
								min={PARAM_RANGES.bass.min}
								max={PARAM_RANGES.bass.max}
								step={PARAM_RANGES.bass.step}
								onChange={(e) => setAudioParams({ bass: Number(e.target.value) })}
							/>
							<Slider
								label="템포"
								value={audioParams.tempo}
								min={PARAM_RANGES.tempo.min}
								max={PARAM_RANGES.tempo.max}
								step={PARAM_RANGES.tempo.step}
								unit=" BPM"
								onChange={(e) => setAudioParams({ tempo: Number(e.target.value) })}
							/>
						</div>

						{/* Playback Controls */}
						<div className="flex items-center justify-center gap-6">
							{/* Play/Pause */}
							<button
								onClick={handlePlayPause}
								className="p-5 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 transition-all duration-200 glow-primary hover:scale-105 shadow-2xl"
								aria-label={isPlaying ? '일시정지' : '재생'}
							>
								{isPlaying ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white ml-1" />}
							</button>

							{/* Volume Control */}
							<div className="hidden md:flex items-center gap-3 ml-6 btn-glass px-4 py-2 rounded-full">
								<button
									className="p-1 hover:scale-110 transition-transform"
									aria-label="음소거"
								>
									{volume === 0 ? <VolumeX className="w-5 h-5 text-slate-700 dark:text-slate-300" /> : <Volume2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
								</button>
								<input
									type="range"
									min={0}
									max={100}
									value={volume}
									onChange={handleVolumeChange}
									className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
								/>
								<span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-8">{volume}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Player;
