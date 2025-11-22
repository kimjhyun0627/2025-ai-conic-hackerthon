import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { ConfirmModal, useToast } from '@/shared/components/ui';
import { TopBar, GenreInfo, SyncGlowIntensity, SyncGlowWave, SyncGlowParticle, SyncGlowOscilloscope, ControlerPanel, ParameterPanel, GradientOverlay, AudioEngine } from '@/features/player/components';
import { usePlayerParams, useGenreChangeAnimation, usePlayerExit, usePlayerTrack, useTrackFetcher } from '@/features/player/hooks';
import { isCancelError } from '@/shared/utils';
import { useThemeColors } from '@/shared/hooks';
import { PLAYER_CONSTANTS } from '@/features/player/constants';

const Player = () => {
	const navigate = useNavigate();
	const [isExpanded, setIsExpanded] = useState(false);
	const [isControlsVisible, setIsControlsVisible] = useState(true);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [visualizationMode, setVisualizationMode] = useState<'box' | 'wave' | 'particle' | 'oscilloscope'>('box');

	const { selectedGenre, isPlaying, moveToPrevTrack, setNextTrack, resetQueue, queue } = usePlayerStore();
	const { selectedTheme, themeBaseParams, themeAdditionalParams, activeCommonParamsList, availableCommonParams, getParamValue, setParamValue, addCommonParam, removeCommonParam, removeThemeParam } =
		usePlayerParams();
	const colors = useThemeColors();
	const { showWarning, showInfo, showSuccess, removeToast } = useToast();
	const { handleNextTrack } = usePlayerTrack();
	const { fetchTrack } = useTrackFetcher();

	// 장르 변경 감지 및 애니메이션
	const isGenreChanging = useGenreChangeAnimation(selectedGenre);

	// 나가기 애니메이션 및 네비게이션
	const { isLeaving, startExit } = usePlayerExit();

	// 장르가 선택되지 않았으면 랜딩 페이지로 리다이렉트
	useEffect(() => {
		if (!selectedGenre) {
			navigate('/');
		}
	}, [selectedGenre, navigate]);

	// Player 페이지에서 나갈 때 queue 초기화
	useEffect(() => {
		if (isLeaving) {
			resetQueue();
		}
	}, [isLeaving, resetQueue]);

	if (!selectedGenre) {
		return null;
	}

	const handleHomeClick = () => {
		setShowConfirmModal(true);
	};

	const handleConfirmHome = () => {
		setShowConfirmModal(false);
		startExit();
	};

	const handleCancelHome = () => {
		setShowConfirmModal(false);
	};

	const handlePrev = () => {
		// 첫 번째 트랙이면 경고 토스트 표시
		if (queue.currentIndex <= 0) {
			showWarning('첫 번째 트랙이에요!', 3000);
			return;
		}
		moveToPrevTrack();
	};

	const handleNext = () => {
		handleNextTrack();
	};

	// 적용하기 버튼: API 호출하여 큐에만 추가 (재생하지 않음)
	const handleApply = async () => {
		if (!selectedGenre) {
			return;
		}

		// 로딩 토스트 표시
		const loadingToastId = showInfo('새로운 트랙을 준비 중이에요!', null);

		try {
			const track = await fetchTrack(selectedGenre);

			// 준비 완료 토스트 표시
			removeToast(loadingToastId);
			showSuccess('다음 트랙이 준비되었어요!', 3000);

			// 큐에만 추가하고 재생하지 않음
			setNextTrack(track);
		} catch (error) {
			// 취소된 요청은 정상적인 취소이므로 무시
			if (isCancelError(error)) {
				return;
			}

			console.error('[Player] 트랙 가져오기 실패:', error);
			removeToast(loadingToastId);
		}
	};

	return (
		<>
			<AudioEngine />
			<div className="min-h-screen flex flex-col relative overflow-hidden">
				{/* Top Bar */}
				<TopBar
					onHomeClick={handleHomeClick}
					isVisible={isControlsVisible}
					visualizationMode={visualizationMode}
					onVisualizationModeChange={setVisualizationMode}
				/>

				{/* Genre Info */}
				<GenreInfo
					genre={selectedGenre}
					theme={selectedTheme}
					isVisible={isControlsVisible}
				/>

				{/* Center Image - 모드에 따라 다른 컴포넌트 렌더링 */}
				{visualizationMode === 'box' ? (
					<SyncGlowIntensity
						genre={selectedGenre}
						isPlaying={isPlaying}
					/>
				) : visualizationMode === 'wave' ? (
					<SyncGlowWave
						genre={selectedGenre}
						isPlaying={isPlaying}
					/>
				) : visualizationMode === 'particle' ? (
					<SyncGlowParticle
						genre={selectedGenre}
						isPlaying={isPlaying}
					/>
				) : (
					<SyncGlowOscilloscope
						genre={selectedGenre}
						isPlaying={isPlaying}
					/>
				)}

				{/* Bottom - Player Board */}
				<div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center">
					<div
						className="relative w-full max-w-[720px]"
						style={{ overflow: isExpanded ? 'visible' : undefined }}
					>
						{/* Main Player Controls */}
						<motion.div
							layout
							initial="hidden"
							animate={isControlsVisible ? 'visible' : 'hidden'}
							variants={PLAYER_CONSTANTS.ANIMATIONS.playerControls}
							transition={{
								layout: {
									duration: 0.6,
									ease: [0.4, 0, 0.2, 1],
								},
								default: {
									duration: 0.6,
									ease: [0.4, 0, 0.2, 1],
								},
							}}
							style={{
								background: colors.glassBackground,
								borderColor: colors.glassBorder,
							}}
							className="w-full rounded-2xl backdrop-blur-xl border shadow-2xl relative z-10 mt-4"
						>
							<ControlerPanel
								genre={selectedGenre}
								isExpanded={isExpanded}
								isVisible={isControlsVisible}
								onToggleExpand={() => setIsExpanded(!isExpanded)}
								onToggleVisibility={() => setIsControlsVisible(!isControlsVisible)}
								onPrev={handlePrev}
								onNext={handleNext}
							/>
						</motion.div>

						{/* Expandable Detail Controls - Behind the controller */}
						{isControlsVisible && (
							<ParameterPanel
								isExpanded={isExpanded}
								themeBaseParams={themeBaseParams}
								themeAdditionalParams={themeAdditionalParams}
								activeCommonParams={activeCommonParamsList}
								availableCommonParams={availableCommonParams}
								getParamValue={getParamValue}
								setParamValue={setParamValue}
								onRemoveThemeParam={removeThemeParam}
								onRemoveCommonParam={removeCommonParam}
								onAddCommonParam={addCommonParam}
								onApply={handleApply}
							/>
						)}
					</div>
				</div>

				{/* 컨트롤러 패널 열기 버튼 - 오른쪽 아래 고정 */}
				<AnimatePresence>
					{!isControlsVisible && (
						<motion.button
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							transition={{
								opacity: {
									duration: 0.25,
									ease: [0.4, 0, 0.2, 1],
								},
								y: {
									type: 'spring',
									stiffness: 300,
									damping: 25,
								},
							}}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsControlsVisible(true)}
							className={PLAYER_CONSTANTS.STYLES.glassButton.controlButton}
							style={{
								background: colors.glassButtonBg,
								borderColor: colors.glassBorder,
								position: 'fixed',
								bottom: '1.5rem',
								right: '1.5rem',
								zIndex: 60,
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = colors.glassButtonBgHover;
								e.currentTarget.querySelector('svg')?.setAttribute('style', `color: #fb7185`);
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = colors.glassButtonBg;
								e.currentTarget.querySelector('svg')?.setAttribute('style', `color: ${colors.iconColor}`);
							}}
							aria-label="컨트롤러 보이기"
						>
							<ChevronUp
								className="w-6 h-6 md:w-7 md:h-7"
								style={{ color: colors.iconColor }}
							/>
						</motion.button>
					)}
				</AnimatePresence>
			</div>

			{/* 장르 변경 애니메이션 */}
			<GradientOverlay
				isVisible={isGenreChanging}
				type="genreChange"
				zIndex={150}
			/>

			{/* 나가기 애니메이션 */}
			<GradientOverlay
				isVisible={isLeaving}
				type="exit"
				zIndex={200}
			/>

			{/* Confirm Modal */}
			<ConfirmModal
				isOpen={showConfirmModal}
				title="홈으로 돌아가기"
				message="정말 돌아가시겠어요?"
				confirmText="돌아가기"
				cancelText="취소"
				onConfirm={handleConfirmHome}
				onCancel={handleCancelHome}
			/>
		</>
	);
};

export default Player;
