import type { MusicGenre } from '@/shared/types';
import { useThemeColors } from '@/shared/hooks';
import { useAudioAnalyzer, useBPM } from '../../../hooks';
import { WaveformCanvas } from './WaveformCanvas';
import { AudioMetricsHUD } from './AudioMetricsHUD';
import { GenreImage, SyncGlowContainer } from '../shared';
import { WAVEFORM_CONSTANTS } from './constants';

interface SyncGlowWaveProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

export const SyncGlowWave = ({ genre, isPlaying }: SyncGlowWaveProps) => {
	const colors = useThemeColors();

	// 이미지 투명도 설정
	const imageOpacity = colors.isDark ? WAVEFORM_CONSTANTS.IMAGE_OPACITY_DARK : WAVEFORM_CONSTANTS.IMAGE_OPACITY_LIGHT;

	// 오디오 분석 (재생 중일 때만 활성화)
	const audioAnalysis = useAudioAnalyzer(isPlaying);

	// BPM 계산
	const bpm = useBPM({
		isPlaying,
		peak: audioAnalysis.peak,
		timestamp: audioAnalysis.timestamp,
	});

	return (
		<SyncGlowContainer withPadding className="w-[calc(100vw-20vh)] h-[80vh] overflow-hidden relative">
			{/* 장르 이미지 (배경) */}
			<GenreImage
				genre={genre}
				isPlaying={isPlaying}
				imageOpacity={imageOpacity}
				zIndex={0}
				opacityMultiplier={0.5}
			/>

			{/* 주파수 스펙트럼 막대 그래프 (중앙 정렬) */}
			<WaveformCanvas
				isPlaying={isPlaying}
				isDark={colors.isDark}
			/>

			{/* 오디오 지표 HUD */}
			<AudioMetricsHUD
				rms={audioAnalysis.rms}
				bpm={bpm}
				lowEnergy={audioAnalysis.lowBandEnergy}
				midEnergy={audioAnalysis.midBandEnergy}
				highEnergy={audioAnalysis.highBandEnergy}
			/>
		</SyncGlowContainer>
	);
};
