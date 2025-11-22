import { useMemo } from 'react';
import type { MusicGenre } from '@/shared/types';
import { useThemeColors } from '@/shared/hooks';
import { useAudioAnalyzer } from '../../../hooks';
import { usePlayerStore } from '@/store/playerStore';
import { AnimatedIntensityBox } from './AnimatedBox';
import { getIntensityBoxStyle, getTransition } from './boxUtils';
import { useIntensityBoxSizes } from './useBoxSizes';
import { GenreImage, SyncGlowContainer } from '../shared';
import { INTENSITY_BOX_CONSTANTS } from './constants';

interface SyncGlowIntensityProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

export const SyncGlowIntensity = ({ genre, isPlaying }: SyncGlowIntensityProps) => {
	const colors = useThemeColors();
	const currentTrack = usePlayerStore((state) => state.getCurrentTrack());

	// 오디오 분석 (재생 중일 때만 활성화)
	const audioAnalysis = useAudioAnalyzer(isPlaying);

	// 테마별 설정
	const imageOpacity = colors.isDark ? INTENSITY_BOX_CONSTANTS.IMAGE_OPACITY_DARK : INTENSITY_BOX_CONSTANTS.IMAGE_OPACITY_LIGHT;

	// 주파수 대역별 색상 (명도 차이)
	const lowColorRgb = colors.isDark ? INTENSITY_BOX_CONSTANTS.LOW_COLOR_RGB_DARK : INTENSITY_BOX_CONSTANTS.LOW_COLOR_RGB_LIGHT;
	const midColorRgb = colors.isDark ? INTENSITY_BOX_CONSTANTS.MID_COLOR_RGB_DARK : INTENSITY_BOX_CONSTANTS.MID_COLOR_RGB_LIGHT;
	const highColorRgb = colors.isDark ? INTENSITY_BOX_CONSTANTS.HIGH_COLOR_RGB_DARK : INTENSITY_BOX_CONSTANTS.HIGH_COLOR_RGB_LIGHT;

	// Intensity 정규화
	const lowIntensity = Math.min(Math.max(audioAnalysis.lowBandEnergy ?? 0, 0), 1);
	const midIntensity = Math.min(Math.max(audioAnalysis.midBandEnergy ?? 0, 0), 1);
	const highIntensity = Math.min(Math.max(audioAnalysis.highBandEnergy ?? 0, 0), 1);

	// 박스 크기 계산
	const { lowExtraPixels, midExtraPixels, highExtraPixels } = useIntensityBoxSizes({
		lowIntensity,
		midIntensity,
		highIntensity,
		isPlaying,
	});

	// Transition 계산 (주파수 대역별 차별화)
	const lowTransition = useMemo(() => getTransition('low'), []);
	const midTransition = useMemo(() => getTransition('mid'), []);
	const highTransition = useMemo(() => getTransition('high'), []);

	// 박스 스타일 계산 (주파수 대역별 색상 적용)
	const lowBoxStyle = useMemo(
		() =>
			getIntensityBoxStyle({
				colorRgb: lowColorRgb,
				intensity: lowIntensity,
				extraPixels: lowExtraPixels,
				type: 'low',
			}),
		[lowColorRgb, lowIntensity, lowExtraPixels]
	);

	const midBoxStyle = useMemo(
		() =>
			getIntensityBoxStyle({
				colorRgb: midColorRgb,
				intensity: midIntensity,
				extraPixels: midExtraPixels,
				type: 'mid',
			}),
		[midColorRgb, midIntensity, midExtraPixels]
	);

	const highBoxStyle = useMemo(
		() =>
			getIntensityBoxStyle({
				colorRgb: highColorRgb,
				intensity: highIntensity,
				extraPixels: highExtraPixels,
				type: 'high',
			}),
		[highColorRgb, highIntensity, highExtraPixels]
	);

	return (
		<SyncGlowContainer
			withPadding
			className="w-[calc(100vw-20vh)] h-[80vh] glass-card rounded-4xl md:rounded-2rem overflow-visible shadow-2xl relative"
		>
			{/* Low Band Intensity 박스 (저음역대 - 가장 바깥쪽) */}
			<AnimatedIntensityBox
				keyValue="low"
				trackId={currentTrack?.id || null}
				baseSize={INTENSITY_BOX_CONSTANTS.BOX_BASE_SIZE}
				extraPixels={lowExtraPixels}
				opacity={lowBoxStyle.opacity}
				background={lowBoxStyle.background}
				border={lowBoxStyle.border}
				boxShadow={lowBoxStyle.boxShadow}
				backdropFilter={lowBoxStyle.backdropFilter}
				filter={lowBoxStyle.filter}
				initialOpacity={INTENSITY_BOX_CONSTANTS.BOX_INITIAL_OPACITY}
				transition={lowTransition}
				zIndex={INTENSITY_BOX_CONSTANTS.Z_INDEX.LOW}
			/>

			{/* Mid Band Intensity 박스 (중음역대 - 중간) */}
			<AnimatedIntensityBox
				keyValue="mid"
				trackId={currentTrack?.id || null}
				baseSize={INTENSITY_BOX_CONSTANTS.BOX_BASE_SIZE}
				extraPixels={midExtraPixels}
				opacity={midBoxStyle.opacity}
				background={midBoxStyle.background}
				border={midBoxStyle.border}
				boxShadow={midBoxStyle.boxShadow}
				backdropFilter={midBoxStyle.backdropFilter}
				filter={midBoxStyle.filter}
				initialOpacity={INTENSITY_BOX_CONSTANTS.BOX_INITIAL_OPACITY}
				transition={midTransition}
				zIndex={INTENSITY_BOX_CONSTANTS.Z_INDEX.MID}
			/>

			{/* High Band Intensity 박스 (고음역대 - 가장 안쪽) */}
			<AnimatedIntensityBox
				keyValue="high"
				trackId={currentTrack?.id || null}
				baseSize={INTENSITY_BOX_CONSTANTS.BOX_BASE_SIZE}
				extraPixels={highExtraPixels}
				opacity={highBoxStyle.opacity}
				background={highBoxStyle.background}
				border={highBoxStyle.border}
				boxShadow={highBoxStyle.boxShadow}
				backdropFilter={highBoxStyle.backdropFilter}
				filter={highBoxStyle.filter}
				initialOpacity={INTENSITY_BOX_CONSTANTS.BOX_INITIAL_OPACITY}
				transition={highTransition}
				zIndex={INTENSITY_BOX_CONSTANTS.Z_INDEX.HIGH}
			/>

			{/* 이미지 컨테이너 */}
			<GenreImage
				genre={genre}
				isPlaying={isPlaying}
				imageOpacity={imageOpacity}
				zIndex={INTENSITY_BOX_CONSTANTS.Z_INDEX.IMAGE}
				border="1px solid rgba(251, 113, 133, 0.8)"
				className="overflow-hidden rounded-[inherit]"
				opacityMultiplier={1}
			/>
		</SyncGlowContainer>
	);
};
