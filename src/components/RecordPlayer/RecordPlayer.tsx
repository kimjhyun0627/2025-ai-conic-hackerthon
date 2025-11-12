import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import { RECORD_PLAYER_CONSTANTS, generateRecordGradients } from '../../constants/recordPlayerConstants';
import { CAROUSEL_CONSTANTS } from '../../constants/carouselConstants';

interface RecordPlayerProps {
	imageUrl: string;
	onPause: (e?: React.MouseEvent) => void;
}

export const RecordPlayer = ({ imageUrl, onPause }: RecordPlayerProps) => {
	const gradients = generateRecordGradients();

	return (
		<motion.div
			key="record-player"
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
					width: RECORD_PLAYER_CONSTANTS.SIZE.WIDTH,
					height: RECORD_PLAYER_CONSTANTS.SIZE.HEIGHT,
					minWidth: RECORD_PLAYER_CONSTANTS.SIZE.MIN_WIDTH,
					minHeight: RECORD_PLAYER_CONSTANTS.SIZE.MIN_HEIGHT,
					aspectRatio: '1 / 1',
					position: 'relative',
					zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_PLAYER,
					isolation: 'isolate',
					padding: RECORD_PLAYER_CONSTANTS.SIZE.PADDING,
					background: RECORD_PLAYER_CONSTANTS.GRADIENT.BORDER,
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
							maskImage: RECORD_PLAYER_CONSTANTS.GRADIENT.MASK,
							WebkitMaskImage: RECORD_PLAYER_CONSTANTS.GRADIENT.MASK,
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
							width: RECORD_PLAYER_CONSTANTS.SIZE.LABEL_SIZE,
							height: RECORD_PLAYER_CONSTANTS.SIZE.LABEL_SIZE,
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							background: RECORD_PLAYER_CONSTANTS.COLORS.LABEL_BG,
							boxShadow: RECORD_PLAYER_CONSTANTS.COLORS.LABEL_SHADOW,
							zIndex: CAROUSEL_CONSTANTS.Z_INDEX.RECORD_LABEL,
							position: 'absolute',
						}}
					/>
					{/* 중앙 스핀들 홀 */}
					<div
						className="absolute rounded-full pointer-events-none"
						style={{
							width: RECORD_PLAYER_CONSTANTS.SIZE.HOLE_SIZE,
							height: RECORD_PLAYER_CONSTANTS.SIZE.HOLE_SIZE,
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							background: RECORD_PLAYER_CONSTANTS.COLORS.HOLE_BG,
							boxShadow: RECORD_PLAYER_CONSTANTS.COLORS.HOLE_SHADOW,
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
							className="w-16 h-16 md:w-20 md:h-20 text-slate-900 dark:text-white drop-shadow-2xl"
							fill="currentColor"
						/>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};
