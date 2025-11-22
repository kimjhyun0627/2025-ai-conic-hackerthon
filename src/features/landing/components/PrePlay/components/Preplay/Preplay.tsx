import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import { PREPLAY_CONSTANTS, generatePreplayGradients } from '../../constants';
import { CAROUSEL_CONSTANTS } from '@/features/landing/constants';
import { useSampleAudio } from '../../hooks/useSampleAudio';
import { getSampleAudioUrl } from '../../constants/sampleAudio';
import type { ThemeCategory } from '@/shared/types';

interface PreplayProps {
	imageUrl: string;
	onPause: (e?: React.MouseEvent) => void;
	/** 카테고리 ID (테마 카테고리 또는 장르 ID) */
	categoryOrGenreId: string;
	/** 테마 카테고리 (장르인 경우 필수) */
	category?: ThemeCategory;
}

export const Preplay = ({ imageUrl, onPause, categoryOrGenreId, category }: PreplayProps) => {
	const gradients = generatePreplayGradients();
	const [isHovered, setIsHovered] = useState(false);
	const [isMovFinished, setIsMovFinished] = useState(false);

	// MOV 파일 URL (첫 재생용)
	const movUrl = getSampleAudioUrl(categoryOrGenreId, category, true);
	// MP3 파일 URL (MOV 종료 후 재생용)
	const mp3Url = getSampleAudioUrl(categoryOrGenreId, category, false);

	// 현재 재생할 오디오 URL (MOV가 끝나지 않았으면 MOV, 끝났으면 MP3)
	const currentAudioUrl = isMovFinished ? mp3Url : movUrl;

	// 샘플 오디오 재생 훅
	const { stop, audioRef } = useSampleAudio(currentAudioUrl, {
		volume: 0.5,
		loop: isMovFinished, // MOV는 반복 안 함, MP3는 반복
		fadeIn: true, // MOV와 MP3 모두 fade-in 효과 적용
		fadeInDuration: 2, // 2초 fade-in
		fadeOut: true, // MOV와 MP3 모두 fade-out 효과 적용
		fadeOutDuration: 2, // 2초 fade-out
		autoPlay: true, // 컴포넌트 마운트 시 자동 재생
	});

	// MOV 파일이 끝나면 MP3로 전환
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || isMovFinished || !movUrl) return;

		const handleEnded = () => {
			setIsMovFinished(true);
		};

		audio.addEventListener('ended', handleEnded);

		return () => {
			audio.removeEventListener('ended', handleEnded);
		};
	}, [audioRef, isMovFinished, movUrl]);

	// 컴포넌트 언마운트 시 정리
	useEffect(() => {
		return () => {
			stop();
		};
	}, [stop]);

	// 일시정지 핸들러
	const handlePause = (e?: React.MouseEvent) => {
		stop();
		onPause(e);
	};

	return (
		<motion.div
			key="preplay"
			className="w-full h-full flex items-center justify-center"
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.8 }}
			transition={{ duration: CAROUSEL_CONSTANTS.ANIMATION.FADE_DURATION, ease: 'easeInOut' }}
			style={{
				position: 'relative',
				zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_PLAYER_CONTAINER,
			}}
		>
			<motion.div
				onClick={(e) => {
					e.stopPropagation();
					handlePause(e);
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className="relative rounded-full overflow-visible cursor-pointer"
				style={{
					width: PREPLAY_CONSTANTS.SIZE.WIDTH,
					height: PREPLAY_CONSTANTS.SIZE.HEIGHT,
					minWidth: PREPLAY_CONSTANTS.SIZE.MIN_WIDTH,
					minHeight: PREPLAY_CONSTANTS.SIZE.MIN_HEIGHT,
					aspectRatio: '1 / 1',
					position: 'relative',
					zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_PLAYER,
					isolation: 'isolate',
					padding: PREPLAY_CONSTANTS.SIZE.PADDING,
					background: PREPLAY_CONSTANTS.GRADIENT.BORDER,
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
					{/* 배경 이미지 - 회전 (항상) */}
					<motion.div
						className="absolute inset-0 rounded-full overflow-hidden"
						animate={{
							rotate: 360,
						}}
						transition={{
							duration: CAROUSEL_CONSTANTS.ANIMATION.ROTATION_DURATION,
							repeat: Infinity,
							ease: 'linear',
						}}
						style={{
							transformOrigin: 'center center',
							backgroundImage: `url(${imageUrl})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center center',
							backgroundRepeat: 'no-repeat',
							zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_BACKGROUND,
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
						}}
					/>
					{/* 레코드판 패턴 (원형 그루브) - 회전 (항상) */}
					<motion.div
						className="absolute inset-0 rounded-full pointer-events-none"
						animate={{
							rotate: 360,
						}}
						transition={{
							duration: CAROUSEL_CONSTANTS.ANIMATION.ROTATION_DURATION,
							repeat: Infinity,
							ease: 'linear',
						}}
						style={{
							transformOrigin: 'center center',
							background: `${gradients.radial}, ${gradients.conic}`,
							maskImage: PREPLAY_CONSTANTS.GRADIENT.MASK,
							WebkitMaskImage: PREPLAY_CONSTANTS.GRADIENT.MASK,
							zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_PATTERN,
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
							width: PREPLAY_CONSTANTS.SIZE.LABEL_SIZE,
							height: PREPLAY_CONSTANTS.SIZE.LABEL_SIZE,
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							background: PREPLAY_CONSTANTS.COLORS.LABEL_BG,
							boxShadow: PREPLAY_CONSTANTS.COLORS.LABEL_SHADOW,
							zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_LABEL,
						}}
					/>
					{/* 중앙 스핀들 홀 */}
					<div
						className="absolute rounded-full pointer-events-none"
						style={{
							width: PREPLAY_CONSTANTS.SIZE.HOLE_SIZE,
							height: PREPLAY_CONSTANTS.SIZE.HOLE_SIZE,
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							background: PREPLAY_CONSTANTS.COLORS.HOLE_BG,
							boxShadow: PREPLAY_CONSTANTS.COLORS.HOLE_SHADOW,
							zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_HOLE,
						}}
					/>
					{/* Pause 버튼 */}
					<div
						className="absolute inset-0 flex items-center justify-center pointer-events-none"
						style={{ zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_PAUSE_ICON }}
					>
						<Pause
							className="w-6 h-6 md:w-7 md:h-7 drop-shadow-2xl transition-colors duration-300"
							style={{
								color: isHovered ? '#fb7185' : '#ffffff',
							}}
							fill="currentColor"
						/>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};
