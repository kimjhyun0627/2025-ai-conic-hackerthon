import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { ConfirmModal, Toast } from '@/shared/components/ui';
import { PlayerTopBar, PlayerGenreInfo, PlayerCenterImage, PlayerControls, ParameterPanel, GradientOverlay, PlayerAudioEngine } from '@/features/player/components';
import { usePlayerParams, useGenreChangeAnimation, usePlayerExit } from '@/features/player/hooks';
import { useThemeColors } from '@/shared/hooks';
import { PLAYER_CONSTANTS } from '@/features/player/constants';
import { fetchTrackForGenre } from '@/shared/api';

const Player = () => {
	const navigate = useNavigate();
	const [isExpanded, setIsExpanded] = useState(false);
	const [isControlsVisible, setIsControlsVisible] = useState(true);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showNextLoadingToast, setShowNextLoadingToast] = useState(false);
	const [showNextReadyToast, setShowNextReadyToast] = useState(false);

	const { selectedGenre, isPlaying, queue, moveToNextTrack, moveToPrevTrack, setNextTrack, resetQueue } = usePlayerStore();
	const { selectedTheme, themeBaseParams, themeAdditionalParams, activeCommonParamsList, availableCommonParams, getParamValue, setParamValue, addCommonParam, removeCommonParam, removeThemeParam } =
		usePlayerParams();
	const colors = useThemeColors();

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

	// 장르(테마) 변경 시 처리
	// 주의: PlayerTopBar에서 resetQueue를 먼저 호출하므로, 여기서는 중복 호출을 방지하기 위해 주석 처리
	// const prevGenreRef = useRef<{ id: string; category: string } | null>(null);
	// useEffect(() => {
	// 	if (selectedGenre && prevGenreRef.current !== null) {
	// 		const prevGenre = prevGenreRef.current;
	// 		// 장르가 변경된 경우 (같은 카테고리든 다른 카테고리든) queue 초기화
	// 		if (prevGenre.id !== selectedGenre.id) {
	// 			resetQueue();
	// 		}
	// 	}
	// 	if (selectedGenre) {
	// 		prevGenreRef.current = { id: selectedGenre.id, category: selectedGenre.category };
	// 	}
	// }, [selectedGenre, resetQueue]);

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
		moveToPrevTrack();
	};

	const handleNext = () => {
		// nextTrack이 있으면 바로 이동
		if (queue.next) {
			moveToNextTrack();
			return;
		}

		// tracks에 다음 트랙이 있으면 이동
		if (queue.currentIndex >= 0 && queue.currentIndex < queue.tracks.length - 1) {
			moveToNextTrack();
			return;
		}

		// nextTrack도 없고 tracks에도 다음 트랙이 없으면 새 트랙 가져오기 시작
		if (!selectedGenre) {
			return;
		}

		// 로딩 토스트 표시
		setShowNextLoadingToast(true);

		// 비동기로 트랙 가져오기 시작 (await 없이 즉시 실행)
		fetchTrackForGenre(selectedGenre)
			.then((track) => {
				setNextTrack(track);
				setShowNextLoadingToast(false);
				setShowNextReadyToast(true);
				moveToNextTrack();
			})
			.catch((error) => {
				console.error('다음 트랙 가져오기 실패:', error);
				setShowNextLoadingToast(false);
			});
	};

	return (
		<>
			<PlayerAudioEngine />
			<div className="min-h-screen flex flex-col relative overflow-hidden">
				{/* Top Bar */}
				<PlayerTopBar
					onHomeClick={handleHomeClick}
					isVisible={isControlsVisible}
				/>

				{/* Genre Info */}
				<PlayerGenreInfo
					genre={selectedGenre}
					theme={selectedTheme}
					isVisible={isControlsVisible}
				/>

				{/* Center Image */}
				<PlayerCenterImage
					genre={selectedGenre}
					isPlaying={isPlaying}
				/>

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
							<PlayerControls
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

			{/* Next Track Loading Toast */}
			{showNextLoadingToast && (
				<Toast
					message="다음 노래를 준비 중이에요!"
					type="info"
					duration={null}
					onClose={() => setShowNextLoadingToast(false)}
				/>
			)}

			{/* Next Track Ready Toast */}
			{showNextReadyToast && (
				<Toast
					message="다음 노래가 준비되었어요"
					type="success"
					duration={3000}
					onClose={() => setShowNextReadyToast(false)}
				/>
			)}
		</>
	);
};

export default Player;
