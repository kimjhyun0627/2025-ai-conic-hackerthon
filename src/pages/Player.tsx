import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { ThemeToggle, Slider, Button, Loader } from '../components/ui';
import { PARAM_RANGES } from '../constants/themes';
import { formatTime } from '../utils/timeUtils';

const Player = () => {
  const navigate = useNavigate();
  const [isGenerating] = useState(false);

  const {
    selectedGenre,
    isPlaying,
    volume,
    currentTime,
    duration,
    audioParams,
    setIsPlaying,
    setVolume,
    setCurrentTime,
    setAudioParams,
  } = usePlayerStore();

  // 장르가 선택되지 않았으면 랜딩 페이지로 리다이렉트
  useEffect(() => {
    if (!selectedGenre) {
      navigate('/');
    }
  }, [selectedGenre, navigate]);

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

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Visual Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Genre Display */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-gradient">
            {selectedGenre.nameKo}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            {selectedGenre.name}
          </p>
        </div>

        {/* Visualizer Placeholder */}
        <div className="w-full max-w-2xl h-64 glass-effect rounded-3xl flex items-center justify-center">
          {isGenerating ? (
            <Loader size="lg" text="음악 생성 중..." />
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl animate-pulse-slow">🎵</div>
              <p className="text-slate-600 dark:text-slate-400">
                {isPlaying ? '재생 중...' : '일시정지'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Control Area */}
      <div className="glass-effect border-t border-slate-200 dark:border-slate-700 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Track Info */}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {selectedGenre.nameKo} / Track 1
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                {formatTime(currentTime)}
              </span>
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
              <span className="text-sm text-slate-600 dark:text-slate-400 w-12">
                {formatTime(duration)}
              </span>
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
              onChange={(e) =>
                setAudioParams({ energy: Number(e.target.value) })
              }
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
              onChange={(e) =>
                setAudioParams({ tempo: Number(e.target.value) })
              }
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Previous */}
            <button
              className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="이전 곡"
            >
              <svg
                className="w-6 h-6 text-slate-700 dark:text-slate-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="p-4 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors glow-primary"
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="다음 곡"
            >
              <svg
                className="w-6 h-6 text-slate-700 dark:text-slate-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-4">
              <button className="p-2" aria-label="음소거">
                <svg
                  className="w-5 h-5 text-slate-700 dark:text-slate-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>

            {/* Back to Home */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="ml-4"
            >
              홈으로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
