import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { CAROUSEL_CONSTANTS } from '@/features/landing/constants';

interface SamplePlayButtonProps {
	onClick: (e: React.MouseEvent) => void;
}

export const SamplePlayButton = ({ onClick }: SamplePlayButtonProps) => {
	return (
		<motion.button
			onClick={onClick}
			className="play-button relative rounded-full flex items-center justify-center mx-auto cursor-pointer group mb-3"
			style={{
				width: '65px',
				height: '65px',
				minWidth: '65px',
				minHeight: '65px',
				aspectRatio: '1 / 1',
				border: 'none',
				zIndex: CAROUSEL_CONSTANTS.Z_INDEX.PLAY_BUTTON,
				position: 'relative',
				isolation: 'isolate',
			}}
			whileHover={{
				scale: 1.08,
			}}
			whileTap={{ scale: 0.92 }}
			onHoverStart={(e) => {
				const target = e.currentTarget as HTMLButtonElement;
				if (target) {
					target.classList.add('is-hovered');
				}
			}}
			onHoverEnd={(e) => {
				const target = e.currentTarget as HTMLButtonElement;
				if (target) {
					target.classList.remove('is-hovered');
				}
			}}
			transition={{
				duration: 0.2,
				ease: 'easeOut',
			}}
		>
			{/* 그라데이션 오버레이 */}
			<div className="absolute inset-0 rounded-full pointer-events-none play-button-overlay" />
			{/* 테두리 글로우 효과 */}
			<div className="play-button-glow" />
			{/* 재생 아이콘 */}
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none play-icon">
				<Play
					className="w-7 h-7 md:w-8 md:h-8 drop-shadow-lg"
					fill="currentColor"
					style={{ marginLeft: '3px' }}
				/>
			</div>
		</motion.button>
	);
};
