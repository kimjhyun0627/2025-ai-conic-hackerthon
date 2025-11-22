import { motion } from 'framer-motion';
import type { ThemeCategory } from '@/shared/types';
import { getGlowStyle } from './glowUtils';

interface BeatSyncGlowProps {
	category: ThemeCategory;
	intensity: number; // 0-1 범위의 오디오 강도
	beatLevel: number; // 0-1 범위의 비트 강도
}

/**
 * 비트 싱크 글로우 효과 컴포넌트
 * 오디오 분석 데이터를 기반으로 이미지 주변에 글로우 효과를 적용합니다.
 */
export const BeatSyncGlow = ({ category, intensity, beatLevel }: BeatSyncGlowProps) => {
	const clampedBeat = Math.max(0, Math.min(1, beatLevel || 0));
	const glowStyle = getGlowStyle(category, intensity, clampedBeat);
	const transitionDuration = Math.max(0.1, 0.3 - clampedBeat * 0.15);

	return (
		<motion.div
			className="absolute inset-0 pointer-events-none rounded-[inherit]"
			style={{
				zIndex: 0,
				pointerEvents: 'none',
			}}
		>
			<motion.div
				className="absolute inset-0 rounded-[inherit]"
				style={{
					boxShadow: glowStyle.boxShadow,
				}}
				animate={{
					boxShadow: glowStyle.boxShadow,
				}}
				transition={{
					duration: transitionDuration,
					ease: clampedBeat > 0.3 ? 'easeOut' : 'easeInOut',
				}}
			/>
		</motion.div>
	);
};
