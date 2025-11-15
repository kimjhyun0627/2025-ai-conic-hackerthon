import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { ConfirmModal } from '../components/UI';
import { PlayerTopBar, PlayerGenreInfo, PlayerCenterImage, PlayerControls, ParameterPanel } from '../components/Player';
import { usePlayerParams } from '../hooks/usePlayerParams';
import { PLAYER_ANIMATIONS } from '../constants/playerConstants';

const Player = () => {
	const navigate = useNavigate();
	const [isExpanded, setIsExpanded] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const { selectedGenre, isPlaying } = usePlayerStore();
	const { selectedTheme, themeBaseParams, themeAdditionalParams, activeCommonParamsList, availableCommonParams, getParamValue, setParamValue, addCommonParam, removeCommonParam, removeThemeParam } =
		usePlayerParams();

	// 장르가 선택되지 않았으면 랜딩 페이지로 리다이렉트
	useEffect(() => {
		if (!selectedGenre) {
			navigate('/');
		}
	}, [selectedGenre, navigate]);

	if (!selectedGenre) {
		return null;
	}

	const handleHomeClick = () => {
		setShowConfirmModal(true);
	};

	const handleConfirmHome = () => {
		setShowConfirmModal(false);
		navigate('/');
	};

	const handleCancelHome = () => {
		setShowConfirmModal(false);
	};

	const handlePrev = () => {
		// TODO: 이전 트랙으로 이동
	};

	const handleNext = () => {
		// TODO: 다음 트랙으로 이동
	};

	return (
		<>
			<div className="min-h-screen flex flex-col relative overflow-hidden">
				{/* Top Bar */}
				<PlayerTopBar onHomeClick={handleHomeClick} />

				{/* Genre Info */}
				<PlayerGenreInfo
					genre={selectedGenre}
					theme={selectedTheme}
				/>

				{/* Center Image */}
				<PlayerCenterImage
					genre={selectedGenre}
					isPlaying={isPlaying}
				/>

				{/* Bottom - Player Board */}
				<div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center">
					<motion.div
						{...PLAYER_ANIMATIONS.playerBoard}
						className="w-full max-w-[960px]"
					>
						{/* Expandable Detail Controls */}
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

						{/* Main Player Controls */}
						<PlayerControls
							genre={selectedGenre}
							isExpanded={isExpanded}
							onToggleExpand={() => setIsExpanded(!isExpanded)}
							onPrev={handlePrev}
							onNext={handleNext}
						/>
					</motion.div>
				</div>
			</div>

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
