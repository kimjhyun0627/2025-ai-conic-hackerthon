import { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MusicGenre } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../constants';
import { useThemeColors } from '@/shared/hooks';
import { useAudioAnalyzer } from '../../hooks';
import { usePlayerStore } from '@/store/playerStore';

interface IntensitySyncGlowProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

export const IntensitySyncGlow = ({ genre, isPlaying }: IntensitySyncGlowProps) => {
	const colors = useThemeColors();
	const currentTrack = usePlayerStore((state) => state.getCurrentTrack());

	// 오디오 분석 (재생 중일 때만 활성화)
	const audioAnalysis = useAudioAnalyzer(isPlaying);

	// 테마별 이미지 투명도
	const imageOpacity = colors.isDark ? 0.85 : 0.95;

	// 테마별 색상 (라이트 모드일 때 더 어둡게)
	const boxColorRgb = colors.isDark ? '251, 113, 133' : '200, 60, 90'; // 라이트 모드: 더 어두운 로즈 색상

	// 이전 값 추적 (크기 변화 방향 판단용)
	const prevLowExtraPixelsRef = useRef(6);
	const prevMidExtraPixelsRef = useRef(6);
	const prevHighExtraPixelsRef = useRef(6);

	// Low/Mid/High intensity 기반 추가 픽셀 계산
	const lowIntensity = Math.min(Math.max(audioAnalysis.lowBandEnergy ?? 0, 0), 1);
	const midIntensity = Math.min(Math.max(audioAnalysis.midBandEnergy ?? 0, 0), 1);
	const highIntensity = Math.min(Math.max(audioAnalysis.highBandEnergy ?? 0, 0), 1);

	const lowExtraPixels = isPlaying ? 6 + lowIntensity * 10 : 6;
	const midExtraPixels = isPlaying ? 6 + midIntensity * 10 : 6;
	const highExtraPixels = isPlaying ? 6 + highIntensity * 10 : 6;

	// 이전 값 업데이트
	prevLowExtraPixelsRef.current = lowExtraPixels;
	prevMidExtraPixelsRef.current = midExtraPixels;
	prevHighExtraPixelsRef.current = highExtraPixels;

	const transitionConfig = useMemo(
		() => ({
			width: { duration: 0.05, ease: 'easeOut' as const },
			height: { duration: 0.05, ease: 'easeOut' as const },
			left: { duration: 0.05, ease: 'easeOut' as const },
			top: { duration: 0.05, ease: 'easeOut' as const },
			opacity: { duration: 0.1 },
			boxShadow: { duration: 0.05, ease: 'easeOut' as const },
			filter: { duration: 0.05, ease: 'easeOut' as const },
		}),
		[]
	);

	return (
		<div className="fixed inset-0 z-0 flex items-center justify-center md:pt-[28px] md:pb-[28px] py-[40px] md:px-[28px] md:py-[40px]">
			<motion.div className="w-[calc(100vw-20vh)] h-[80vh] glass-card rounded-4xl md:rounded-2rem overflow-visible shadow-2xl relative">
				{/* Low Band Intensity 박스 (저음역대 - 가장 바깥쪽) */}
				<AnimatePresence mode="wait">
					<motion.div
						key={`low-${currentTrack?.id || 'none'}`}
						className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-4xl md:rounded-2rem"
						style={{
							background: `radial-gradient(circle, rgba(${boxColorRgb}, ${0.9 + lowIntensity * 0.1}) 0%, rgba(${boxColorRgb}, ${0.6 + lowIntensity * 0.2}) 50%, rgba(${boxColorRgb}, ${0.3 + lowIntensity * 0.3}) 100%)`,
							border: `2px solid rgba(${boxColorRgb}, ${0.8 + lowIntensity * 0.2})`,
							backdropFilter: 'blur(15px)',
							filter: `blur(${2 + lowIntensity * 3}px) brightness(${1 + lowIntensity * 0.3})`,
							zIndex: 1,
						}}
						initial={{
							width: 'calc(100% + 6vh)',
							height: 'calc(100% + 6vh)',
							left: '-3vh',
							top: '-3vh',
							opacity: 0.4,
							filter: 'blur(2px)',
						}}
						animate={{
							width: `calc(100% + ${lowExtraPixels}vh)`,
							height: `calc(100% + ${lowExtraPixels}vh)`,
							left: `-${lowExtraPixels / 2}vh`,
							top: `-${lowExtraPixels / 2}vh`,
							opacity: 0.5 + lowIntensity * 0.4,
							boxShadow: `
								0 0 ${30 + lowIntensity * 30}px rgba(${boxColorRgb}, ${0.5 + lowIntensity * 0.4}),
								0 0 ${60 + lowIntensity * 60}px rgba(${boxColorRgb}, ${0.3 + lowIntensity * 0.3}),
								0 0 ${90 + lowIntensity * 90}px rgba(${boxColorRgb}, ${0.1 + lowIntensity * 0.2}),
								inset 0 0 ${30 + lowIntensity * 30}px rgba(${boxColorRgb}, ${0.2 + lowIntensity * 0.3})
							`,
						}}
						exit={{
							width: 'calc(100% + 6vh)',
							height: 'calc(100% + 6vh)',
							left: '-3vh',
							top: '-3vh',
							opacity: 0,
							filter: 'blur(2px)',
						}}
						transition={transitionConfig}
					/>
				</AnimatePresence>

				{/* Mid Band Intensity 박스 (중음역대 - 중간) */}
				<AnimatePresence mode="wait">
					<motion.div
						key={`mid-${currentTrack?.id || 'none'}`}
						className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-4xl md:rounded-2rem"
						style={{
							background: `linear-gradient(135deg, rgba(${boxColorRgb}, ${0.4 + midIntensity * 0.4}) 0%, rgba(${boxColorRgb}, ${0.2 + midIntensity * 0.3}) 50%, rgba(${boxColorRgb}, ${0.4 + midIntensity * 0.4}) 100%)`,
							border: `1px solid rgba(${boxColorRgb}, ${0.5 + midIntensity * 0.3})`,
							backdropFilter: 'blur(10px)',
							filter: `blur(${2 + midIntensity * 3}px)`,
							zIndex: 2,
						}}
						initial={{
							width: 'calc(100% + 6vh)',
							height: 'calc(100% + 6vh)',
							left: '-3vh',
							top: '-3vh',
							opacity: 0.3,
						}}
						animate={{
							width: `calc(100% + ${midExtraPixels}vh)`,
							height: `calc(100% + ${midExtraPixels}vh)`,
							left: `-${midExtraPixels / 2}vh`,
							top: `-${midExtraPixels / 2}vh`,
							opacity: 0.4 + midIntensity * 0.4,
							boxShadow: `
								0 0 ${10 + midIntensity * 20}px rgba(${boxColorRgb}, ${0.3 + midIntensity * 0.3}),
								0 0 ${20 + midIntensity * 40}px rgba(${boxColorRgb}, ${0.2 + midIntensity * 0.2}),
								inset 0 0 ${10 + midIntensity * 10}px rgba(${boxColorRgb}, ${0.1 + midIntensity * 0.2})
							`,
						}}
						exit={{
							width: 'calc(100% + 6vh)',
							height: 'calc(100% + 6vh)',
							left: '-3vh',
							top: '-3vh',
							opacity: 0,
						}}
						transition={transitionConfig}
					/>
				</AnimatePresence>

				{/* High Band Intensity 박스 (고음역대 - 가장 안쪽) */}
				<AnimatePresence mode="wait">
					<motion.div
						key={`high-${currentTrack?.id || 'none'}`}
						className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-4xl md:rounded-2rem"
						style={{
							background: `radial-gradient(circle, rgba(${boxColorRgb}, ${0.3 + highIntensity * 0.4}) 0%, rgba(${boxColorRgb}, ${0.2 + highIntensity * 0.3}) 50%, rgba(${boxColorRgb}, ${0.1 + highIntensity * 0.2}) 100%)`,
							border: `1px solid rgba(${boxColorRgb}, ${0.4 + highIntensity * 0.4})`,
							backdropFilter: 'blur(10px)',
							filter: `blur(${2 + highIntensity * 2}px)`,
							zIndex: 3,
						}}
						initial={{
							width: 'calc(100% + 6vh)',
							height: 'calc(100% + 6vh)',
							left: '-3vh',
							top: '-3vh',
							opacity: 0.2,
						}}
						animate={{
							width: `calc(100% + ${highExtraPixels}vh)`,
							height: `calc(100% + ${highExtraPixels}vh)`,
							left: `-${highExtraPixels / 2}vh`,
							top: `-${highExtraPixels / 2}vh`,
							opacity: 0.3 + highIntensity * 0.3,
							boxShadow: `
								0 0 ${10 + highIntensity * 20}px rgba(${boxColorRgb}, ${0.2 + highIntensity * 0.3}),
								0 0 ${20 + highIntensity * 40}px rgba(${boxColorRgb}, ${0.15 + highIntensity * 0.2}),
								inset 0 0 ${10 + highIntensity * 10}px rgba(${boxColorRgb}, ${0.1 + highIntensity * 0.2})
							`,
						}}
						exit={{
							width: 'calc(100% + 6vh)',
							height: 'calc(100% + 6vh)',
							left: '-3vh',
							top: '-3vh',
							opacity: 0,
						}}
						transition={transitionConfig}
					/>
				</AnimatePresence>

				<motion.div
					{...PLAYER_CONSTANTS.ANIMATIONS.centerImage}
					style={{
						width: '100%',
						height: '100%',
						position: 'relative',
						zIndex: 4,
						border: '1px solid rgba(251, 113, 133, 0.8)',
					}}
					className="overflow-hidden rounded-[inherit]"
				>
					<AnimatePresence>
						{genre.backgroundImage || genre.image ? (
							<motion.img
								key={genre.id}
								src={genre.backgroundImage || genre.image}
								alt={genre.nameKo}
								draggable={false}
								className="w-full h-full object-cover absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: imageOpacity }}
								exit={{ opacity: 0 }}
								transition={{
									opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
								}}
							/>
						) : (
							<motion.div
								key={`fallback-${genre.id}`}
								className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500/20 to-primary-700/20 absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
							>
								<motion.div
									className="text-8xl"
									{...(isPlaying
										? {
												animate: {
													rotate: [0, 5, -5, 0],
												},
												transition: {
													duration: 2,
													repeat: Infinity,
													ease: 'easeInOut',
												},
											}
										: {})}
								>
									🎵
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</div>
	);
};
