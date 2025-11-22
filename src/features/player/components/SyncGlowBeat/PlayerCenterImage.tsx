import { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MusicGenre } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../constants';
import { useThemeColors } from '@/shared/hooks';
import { useAudioAnalyzer } from '../../hooks';
import { usePlayerStore } from '@/store/playerStore';
import { AnimatedBox } from './AnimatedBox';
import { getIntensityBoxStyle, getBeatBoxStyle, getTransition } from './boxUtils';

interface PlayerCenterImageProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

// 상수 정의
const INTENSITY_BOX_BASE_SIZE = 6; // vh
const BEAT_BOX_BASE_SIZE = 3; // vh
const INTENSITY_IDLE_SIZE = 6; // vh
const BEAT_IDLE_SIZE = 2; // vh
const INTENSITY_MAX_EXTRA = 10; // vh
const BEAT_MAX_EXTRA = 6; // vh

export const PlayerCenterImage = ({ genre, isPlaying }: PlayerCenterImageProps) => {
	const colors = useThemeColors();
	const currentTrack = usePlayerStore((state) => state.getCurrentTrack());

	// 오디오 분석 (재생 중일 때만 활성화)
	const audioAnalysis = useAudioAnalyzer(isPlaying);

	// 테마별 설정
	const imageOpacity = colors.isDark ? 0.85 : 0.95;
	const boxColorRgb = colors.isDark ? '251, 113, 133' : '200, 60, 90';

	// 이전 값 추적 (크기 변화 방향 판단용)
	const prevIntensityExtraPixelsRef = useRef(INTENSITY_IDLE_SIZE);
	const prevBeatExtraPixelsRef = useRef(BEAT_IDLE_SIZE);

	// Intensity 계산
	const intensityExtraPixels = isPlaying ? INTENSITY_IDLE_SIZE + audioAnalysis.intensity * INTENSITY_MAX_EXTRA : INTENSITY_IDLE_SIZE;
	const intensityIsGrowing = intensityExtraPixels > prevIntensityExtraPixelsRef.current;
	prevIntensityExtraPixelsRef.current = intensityExtraPixels;

	// Beat 계산
	const beatLevel = Math.min(Math.max(audioAnalysis.beatLevel ?? 0, 0), 1);
	const beatExtraPixels = isPlaying ? BEAT_IDLE_SIZE + beatLevel * BEAT_MAX_EXTRA : BEAT_IDLE_SIZE;
	const beatIsGrowing = beatExtraPixels > prevBeatExtraPixelsRef.current;
	prevBeatExtraPixelsRef.current = beatExtraPixels;

	// Transition 계산
	const intensityTransition = useMemo(() => getTransition(intensityIsGrowing, 'intensity'), [intensityIsGrowing]);
	const beatTransition = useMemo(() => getTransition(beatIsGrowing, 'beat'), [beatIsGrowing]);

	// 박스 스타일 계산
	const intensityBoxStyle = useMemo(
		() =>
			getIntensityBoxStyle({
				baseSize: INTENSITY_BOX_BASE_SIZE,
				colorRgb: boxColorRgb,
				intensity: audioAnalysis.intensity,
				extraPixels: intensityExtraPixels,
			}),
		[boxColorRgb, audioAnalysis.intensity, intensityExtraPixels]
	);

	const beatBoxStyle = useMemo(
		() =>
			getBeatBoxStyle({
				baseSize: BEAT_BOX_BASE_SIZE,
				colorRgb: boxColorRgb,
				beatLevel,
				extraPixels: beatExtraPixels,
			}),
		[boxColorRgb, beatLevel, beatExtraPixels]
	);

	return (
		<div className="fixed inset-0 z-0 flex items-center justify-center md:pt-[28px] md:pb-[28px] py-[40px] md:px-[28px] md:py-[40px]">
			<motion.div className="w-[calc(100vw-20vh)] h-[80vh] glass-card rounded-4xl md:rounded-2rem overflow-visible shadow-2xl relative">
				{/* Intensity 박스 */}
				<AnimatedBox
					keyValue="intensity"
					trackId={currentTrack?.id || null}
					baseSize={INTENSITY_BOX_BASE_SIZE}
					extraPixels={intensityExtraPixels}
					opacity={intensityBoxStyle.opacity}
					background={intensityBoxStyle.background}
					border={intensityBoxStyle.border}
					boxShadow={intensityBoxStyle.boxShadow}
					backdropFilter={intensityBoxStyle.backdropFilter}
					filter={intensityBoxStyle.filter}
					initialOpacity={0.3}
					transition={intensityTransition}
				/>

				{/* Beat 박스 */}
				<AnimatedBox
					keyValue="beat"
					trackId={currentTrack?.id || null}
					baseSize={BEAT_BOX_BASE_SIZE}
					extraPixels={beatExtraPixels}
					opacity={beatBoxStyle.opacity}
					background={beatBoxStyle.background}
					border={beatBoxStyle.border}
					boxShadow={beatBoxStyle.boxShadow}
					backdropFilter={beatBoxStyle.backdropFilter}
					filter={beatBoxStyle.filter}
					initialOpacity={0.2}
					transition={beatTransition}
				/>

				{/* 이미지 컨테이너 */}
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
