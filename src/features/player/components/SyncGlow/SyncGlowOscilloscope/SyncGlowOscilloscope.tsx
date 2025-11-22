import type { MusicGenre } from '@/shared/types';
import { useAudioAnalyzer, useBPM, usePrimaryPalette } from '../../../hooks';
import { useThemeColors } from '@/shared/hooks';
import { OscilloscopeCanvas } from './OscilloscopeCanvas';
import { SyncGlowContainer } from '../shared';

interface SyncGlowOscilloscopeProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

/**
 * 오실로스코프 효과 비주얼 컴포넌트
 * - 프라이머리 컬러로 통일
 * - 다크 모드: 밝은 프라이머리 컬러 (가시성 향상)
 * - 라이트 모드: 어두운 프라이머리 컬러 (가시성 향상)
 * - 중앙에서 바깥으로 퍼지는 원형 파형
 * - 주파수 데이터를 원형 오실로스코프로 표현
 * - 비트에 따라 파형 크기 변화
 */
export const SyncGlowOscilloscope = ({ genre: _genre, isPlaying }: SyncGlowOscilloscopeProps) => {
	const colors = useThemeColors();

	// 오디오 분석 (재생 중일 때만 활성화)
	const audioAnalysis = useAudioAnalyzer(isPlaying);

	// BPM 계산
	const bpm = useBPM({
		isPlaying,
		peak: audioAnalysis.peak,
		timestamp: audioAnalysis.timestamp,
	});

	// 프라이머리 컬러 팔레트
	const palette = usePrimaryPalette();

	return (
		<SyncGlowContainer>
			{/* 오실로스코프 Canvas */}
			<OscilloscopeCanvas
				isPlaying={isPlaying}
				isDark={colors.isDark}
				palette={palette}
				lowEnergy={audioAnalysis.lowBandEnergy}
				midEnergy={audioAnalysis.midBandEnergy}
				highEnergy={audioAnalysis.highBandEnergy}
				beatLevel={audioAnalysis.beatLevel}
				rms={audioAnalysis.rms}
				bpm={bpm}
			/>
		</SyncGlowContainer>
	);
};
