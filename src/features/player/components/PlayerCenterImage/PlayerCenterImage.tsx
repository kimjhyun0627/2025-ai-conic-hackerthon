import { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MusicGenre } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../constants';
import { useThemeColors } from '@/shared/hooks';
import { useAudioAnalyzer } from '../../hooks';
import { usePlayerStore } from '@/store/playerStore';

interface PlayerCenterImageProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

export const PlayerCenterImage = ({ genre, isPlaying }: PlayerCenterImageProps) => {
	const colors = useThemeColors();
	const currentTrack = usePlayerStore((state) => state.getCurrentTrack());

	// 오디오 분석 (재생 중일 때만 활성화)
	const audioAnalysis = useAudioAnalyzer(isPlaying);

	// 테마별 이미지 투명도
	const imageOpacity = colors.isDark ? 0.85 : 0.95;

	// 테마별 색상 (라이트 모드일 때 더 어둡게)
	const boxColorRgb = colors.isDark ? '251, 113, 133' : '200, 60, 90'; // 라이트 모드: 더 어두운 로즈 색상

	// 이전 값 추적 (크기 변화 방향 판단용)
	const prevIntensityExtraPixelsRef = useRef(6);
	const prevBeatExtraPixelsRef = useRef(3);

	// intensity 기반 추가 픽셀 계산
	const intensityExtraPixels = isPlaying ? 6 + audioAnalysis.intensity * 10 : 6;
	const intensityExtraPixelsX = intensityExtraPixels;
	const intensityExtraPixelsY = intensityExtraPixels;

	// beat 기반 추가 픽셀 계산 (연속 값)
	const beatLevel = Math.min(Math.max(audioAnalysis.beatLevel ?? 0, 0), 1);
	const beatExtraPixels = isPlaying ? 2 + beatLevel * 6 : 2;
	const beatExtraPixelsX = beatExtraPixels;
	const beatExtraPixelsY = beatExtraPixels;

	// beat 박스 투명도 (연속 값)
	const beatOpacity = 0.5 + beatLevel * 0.4;

	// 크기 변화 방향에 따른 transition duration 계산
	const intensityIsGrowing = intensityExtraPixels > prevIntensityExtraPixelsRef.current;
	const beatIsGrowing = beatExtraPixels > prevBeatExtraPixelsRef.current;

	// 이전 값 업데이트
	prevIntensityExtraPixelsRef.current = intensityExtraPixels;
	prevBeatExtraPixelsRef.current = beatExtraPixels;

	const beatTransition = useMemo(
		() => ({
			width: { duration: beatIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
			height: { duration: beatIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
			left: { duration: beatIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
			top: { duration: beatIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
			opacity: { duration: 0.1 },
		}),
		[beatIsGrowing]
	);

	return (
		<div className="fixed inset-0 z-0 flex items-center justify-center md:pt-[28px] md:pb-[28px] py-[40px] md:px-[28px] md:py-[40px]">
			<motion.div className="w-[calc(100vw-20vh)] h-[80vh] glass-card rounded-4xl md:rounded-2rem overflow-visible shadow-2xl relative">
				{/* Intensity 박스 (덜 투명한 네모) - 이미지 뒤에, 픽셀 단위로 크기 조절 + 블러 효과 */}
				<AnimatePresence mode="wait">
					<motion.div
						key={`intensity-${currentTrack?.id || 'none'}`}
						className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-4xl md:rounded-2rem"
						style={{
							background: `linear-gradient(135deg, rgba(${boxColorRgb}, 0.4) 0%, rgba(${boxColorRgb}, 0.2) 50%, rgba(${boxColorRgb}, 0.4) 100%)`,
							border: `1px solid rgba(${boxColorRgb}, 0.5)`,
							boxShadow: `
								0 0 20px rgba(${boxColorRgb}, 0.3),
								0 0 40px rgba(${boxColorRgb}, 0.2),
								inset 0 0 20px rgba(${boxColorRgb}, 0.1)
							`,
							backdropFilter: 'blur(10px)',
							filter: 'blur(2px)', // 박스 자체에 블러 효과
							zIndex: 1,
						}}
						initial={{
							width: 'calc(100% + 6vh)',
							height: 'calc(100% + 6vh)',
							left: '-3vh',
							top: '-3vh',
							opacity: 0.3,
						}}
						animate={{
							width: `calc(100% + ${intensityExtraPixelsX}vh)`,
							height: `calc(100% + ${intensityExtraPixelsY}vh)`,
							left: `-${intensityExtraPixelsX / 2}vh`,
							top: `-${intensityExtraPixelsY / 2}vh`,
							opacity: 0.5, // 투명도 높임 (더 투명하게)
							boxShadow: `
								0 0 ${10 + audioAnalysis.intensity * 20}px rgba(${boxColorRgb}, ${0.3 + audioAnalysis.intensity * 0.3}),
								0 0 ${20 + audioAnalysis.intensity * 40}px rgba(${boxColorRgb}, ${0.2 + audioAnalysis.intensity * 0.2}),
								inset 0 0 ${10 + audioAnalysis.intensity * 10}px rgba(${boxColorRgb}, ${0.1 + audioAnalysis.intensity * 0.2})
							`,
							filter: `blur(${2 + audioAnalysis.intensity * 3}px)`, // intensity에 따라 블러 강도 변화
						}}
						exit={{
							width: 'calc(100% + 6vh)',
							height: 'calc(100% + 6vh)',
							left: '-3vh',
							top: '-3vh',
							opacity: 0,
						}}
						transition={{
							width: { duration: intensityIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
							height: { duration: intensityIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
							left: { duration: intensityIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
							top: { duration: intensityIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
							opacity: { duration: 0.1 },
							boxShadow: { duration: intensityIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
							filter: { duration: intensityIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
						}}
					/>
				</AnimatePresence>

				{/* Beat 박스 (더 투명한 네모) - 이미지 뒤에, 픽셀 단위로 크기 조절 */}
				<AnimatePresence mode="wait">
					<motion.div
						key={`beat-${currentTrack?.id || 'none'}`}
						className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-4xl md:rounded-2rem"
						style={{
							background: `radial-gradient(circle, rgba(${boxColorRgb}, 0.9) 0%, rgba(${boxColorRgb}, 0.6) 50%, rgba(${boxColorRgb}, 0.3) 100%)`,
							border: `2px solid rgba(${boxColorRgb}, 0.8)`,
							boxShadow: `
								0 0 30px rgba(${boxColorRgb}, 0.5),
								0 0 60px rgba(${boxColorRgb}, 0.3),
								0 0 90px rgba(${boxColorRgb}, 0.1),
								inset 0 0 30px rgba(${boxColorRgb}, 0.2)
							`,
							backdropFilter: 'blur(15px)',
							zIndex: 1,
						}}
						initial={{
							width: 'calc(100% + 3vh)',
							height: 'calc(100% + 3vh)',
							left: '-1.5vh',
							top: '-1.5vh',
							opacity: 0.2,
							filter: 'blur(2px)', // 초기 블러
						}}
						animate={{
							width: `calc(100% + ${beatExtraPixelsX}vh)`,
							height: `calc(100% + ${beatExtraPixelsY}vh)`,
							left: `-${beatExtraPixelsX / 2}vh`,
							top: `-${beatExtraPixelsY / 2}vh`,
							opacity: beatOpacity,
							boxShadow: `
								0 0 ${30 + beatLevel * 20}px rgba(${boxColorRgb}, ${0.5 + beatLevel * 0.3}),
								0 0 ${60 + beatLevel * 40}px rgba(${boxColorRgb}, ${0.3 + beatLevel * 0.2}),
								0 0 ${90 + beatLevel * 60}px rgba(${boxColorRgb}, ${0.1 + beatLevel * 0.2}),
								inset 0 0 ${30 + beatLevel * 20}px rgba(${boxColorRgb}, ${0.2 + beatLevel * 0.2})
							`,
							filter: `blur(${2 + beatLevel * 2}px) brightness(${1 + beatLevel * 0.4})`, // 블러 + 밝기 조절
						}}
						exit={{
							width: 'calc(100% + 3vh)',
							height: 'calc(100% + 3vh)',
							left: '-1.5vh',
							top: '-1.5vh',
							opacity: 0,
							filter: 'blur(2px)', // exit 블러
						}}
						transition={{
							...beatTransition,
							boxShadow: { duration: beatIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const },
							filter: { duration: beatIsGrowing ? 0.03 : 0.15, ease: 'easeOut' as const }, // 블러 transition 추가
						}}
					/>
				</AnimatePresence>

				<motion.div
					{...PLAYER_CONSTANTS.ANIMATIONS.centerImage}
					style={{
						width: '100%',
						height: '100%',
						position: 'relative',
						zIndex: 2,
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
