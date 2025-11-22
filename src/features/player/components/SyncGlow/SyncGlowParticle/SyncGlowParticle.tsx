import type { MusicGenre } from '@/shared/types';
import { useThemeColors } from '@/shared/hooks';
import { useAudioAnalyzer, usePrimaryPalette } from '../../../hooks';
import { ParticleCanvas } from './ParticleCanvas';
import { SyncGlowContainer } from '../shared';

interface SyncGlowParticleProps {
	genre: MusicGenre;
	isPlaying: boolean;
}

/**
 * 테마 팔레트 + 오디오 기반 파티클 비주얼 컴포넌트
 * - 프라이머리 컬러로 통일
 * - 다크 모드: 밝은 프라이머리 컬러 (가시성 향상)
 * - 라이트 모드: 어두운 프라이머리 컬러 (가시성 향상)
 * - 비트·주파수 데이터로 입자, 라인, 네온 스트로크 변형
 * - 고주파 증가 시 입자 속도 상승
 */
export const SyncGlowParticle = ({ genre: _genre, isPlaying }: SyncGlowParticleProps) => {
	const colors = useThemeColors();

	// 오디오 분석 (재생 중일 때만 활성화)
	const audioAnalysis = useAudioAnalyzer(isPlaying);

	// 프라이머리 컬러 팔레트
	const palette = usePrimaryPalette();

	return (
		<SyncGlowContainer>
			{/* 파티클 Canvas */}
			<ParticleCanvas
				isPlaying={isPlaying}
				isDark={colors.isDark}
				palette={palette}
				lowEnergy={audioAnalysis.lowBandEnergy}
				midEnergy={audioAnalysis.midBandEnergy}
				highEnergy={audioAnalysis.highBandEnergy}
				beatLevel={audioAnalysis.beatLevel}
				rms={audioAnalysis.rms}
			/>
		</SyncGlowContainer>
	);
};
