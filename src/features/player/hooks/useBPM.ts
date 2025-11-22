import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { BPMEstimator } from '../components/SyncGlow/SyncGlowWave/metricsUtils';

interface UseBPMOptions {
	isPlaying: boolean;
	peak: number;
	timestamp: number;
}

/**
 * BPM 계산 커스텀 훅
 * - BPM 추정기 인스턴스 관리
 * - 트랙 변경 시 자동 리셋
 * - 재생 중일 때만 BPM 계산
 */
export const useBPM = ({ isPlaying, peak, timestamp }: UseBPMOptions) => {
	const currentTrack = usePlayerStore((state) => state.getCurrentTrack());
	const bpmEstimatorRef = useRef<BPMEstimator>(new BPMEstimator());
	const [bpm, setBpm] = useState<number | null>(null);

	// 트랙 변경 시 BPM 추정기 리셋
	useEffect(() => {
		if (currentTrack?.id) {
			bpmEstimatorRef.current.reset();
			setBpm(null);
		}
	}, [currentTrack?.id]);

	// BPM 계산
	useEffect(() => {
		if (!isPlaying) {
			return;
		}

		// BPM 추정
		const estimatedBPM = bpmEstimatorRef.current.estimateBPM(peak, timestamp);
		if (estimatedBPM !== null) {
			setBpm(estimatedBPM);
		}
	}, [peak, timestamp, isPlaying]);

	return bpm;
};
