/**
 * 오디오 지표 계산 유틸리티
 */

import { WAVEFORM_CONSTANTS } from './constants';

/**
 * BPM 추정 (피크 간격 분석)
 */
export class BPMEstimator {
	private peakTimes: number[] = [];
	private readonly minInterval = 60 / WAVEFORM_CONSTANTS.BPM_MAX; // 최소 간격 (초)
	private readonly maxInterval = 60 / WAVEFORM_CONSTANTS.BPM_MIN; // 최대 간격 (초)
	private readonly maxPeaks = 20; // 최대 저장할 피크 개수

	/**
	 * 피크를 기록하고 BPM 추정
	 */
	estimateBPM(peak: number, timestamp: number): number | null {
		// 피크가 임계값 이상일 때만 기록
		if (peak < WAVEFORM_CONSTANTS.PEAK_THRESHOLD) {
			return this.getCurrentBPM();
		}

		// 첫 번째 피크이거나 최소 간격 이상 지났을 때만 기록
		if (this.peakTimes.length === 0 || timestamp - this.peakTimes[this.peakTimes.length - 1] >= this.minInterval * 1000) {
			this.peakTimes.push(timestamp);

			// 오래된 피크 제거 (최대 개수 유지)
			if (this.peakTimes.length > this.maxPeaks) {
				this.peakTimes.shift();
			}
		}

		return this.getCurrentBPM();
	}

	/**
	 * 현재 BPM 계산
	 */
	private getCurrentBPM(): number | null {
		if (this.peakTimes.length < 2) {
			return null;
		}

		// 최근 피크들 간의 평균 간격 계산
		const intervals: number[] = [];
		for (let i = 1; i < this.peakTimes.length; i++) {
			const interval = (this.peakTimes[i] - this.peakTimes[i - 1]) / 1000; // 초 단위
			if (interval >= this.minInterval && interval <= this.maxInterval) {
				intervals.push(interval);
			}
		}

		if (intervals.length === 0) {
			return null;
		}

		// 평균 간격 계산
		const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
		const bpm = 60 / avgInterval;

		// 범위 내로 제한
		return Math.max(WAVEFORM_CONSTANTS.BPM_MIN, Math.min(WAVEFORM_CONSTANTS.BPM_MAX, Math.round(bpm)));
	}

	/**
	 * 리셋
	 */
	reset(): void {
		this.peakTimes = [];
	}
}

/**
 * Spectral Centroid 계산 (주파수 중심)
 * 주파수 스펙트럼의 가중 평균 주파수
 */
export const calculateSpectralCentroid = (frequencyData: Uint8Array, sampleRate: number, fftSize: number): number => {
	let weightedSum = 0;
	let magnitudeSum = 0;

	const nyquist = sampleRate / 2;
	const binSize = nyquist / (fftSize / 2);

	for (let i = 0; i < frequencyData.length; i++) {
		const magnitude = frequencyData[i];
		const frequency = i * binSize;

		weightedSum += frequency * magnitude;
		magnitudeSum += magnitude;
	}

	if (magnitudeSum === 0) {
		return 0;
	}

	return weightedSum / magnitudeSum;
};

/**
 * Zero Crossing Rate 계산
 * 신호가 0을 지나가는 빈도
 */
export const calculateZeroCrossingRate = (timeData: Uint8Array): number => {
	let crossings = 0;
	const threshold = 128; // 중앙값

	for (let i = 1; i < timeData.length; i++) {
		const prev = timeData[i - 1];
		const current = timeData[i];

		// 0을 지나가는 경우 (threshold를 넘나드는 경우)
		if ((prev < threshold && current >= threshold) || (prev >= threshold && current < threshold)) {
			crossings++;
		}
	}

	// 초당 교차율 (샘플링 레이트는 일반적으로 44100Hz, 하지만 timeData는 fftSize만큼)
	return crossings / timeData.length;
};
