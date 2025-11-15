import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import { PREPLAY_CONSTANTS, generatePreplayGradients } from '../../constants/preplayConstants';
import { CAROUSEL_CONSTANTS } from '../../constants/carouselConstants';

interface PreplayProps {
	imageUrl: string;
	onPause: (e?: React.MouseEvent) => void;
}

export const Preplay = ({ imageUrl, onPause }: PreplayProps) => {
	const gradients = generatePreplayGradients();

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
					onPause(e);
				}}
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
					{/* 배경 이미지 - 회전 */}
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
							width: PREPLAY_CONSTANTS.SIZE.LABEL_SIZE,
							height: PREPLAY_CONSTANTS.SIZE.LABEL_SIZE,
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							background: PREPLAY_CONSTANTS.COLORS.LABEL_BG,
							boxShadow: PREPLAY_CONSTANTS.COLORS.LABEL_SHADOW,
							zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_LABEL,
							position: 'absolute',
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
							position: 'absolute',
						}}
					/>
					{/* Pause 버튼 */}
					<div
						className="absolute inset-0 flex items-center justify-center pointer-events-none"
						style={{ zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_PAUSE_ICON, position: 'absolute' }}
					>
						<Pause
							className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-2xl"
							fill="currentColor"
						/>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};
