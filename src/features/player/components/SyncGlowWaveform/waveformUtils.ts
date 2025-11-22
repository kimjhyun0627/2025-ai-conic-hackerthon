/**
 * 파형 계산 및 그리기 유틸리티
 */

import { WAVEFORM_CONSTANTS } from './constants';

/**
 * 파형 데이터를 스무딩 처리
 */
export const smoothWaveform = (data: Uint8Array, smoothing: number = WAVEFORM_CONSTANTS.WAVEFORM_SMOOTHING): number[] => {
	const smoothed: number[] = [];
	const prevValues: number[] = new Array(data.length).fill(128); // 초기값 128 (중앙)

	for (let i = 0; i < data.length; i++) {
		const current = data[i];
		const prev = prevValues[i];
		const smoothedValue = prev * smoothing + current * (1 - smoothing);
		smoothed.push(smoothedValue);
		prevValues[i] = smoothedValue;
	}

	return smoothed;
};

/**
 * 파형 데이터를 Canvas 좌표로 변환
 */
export const normalizeWaveformData = (data: number[], canvasHeight: number, centerY: number): number[] => {
	return data.map((value) => {
		// 0-255 범위를 -1 ~ 1로 정규화
		const normalized = (value - 128) / 128;
		// Canvas 높이에 맞게 스케일링
		return centerY + normalized * (canvasHeight * 0.4); // 40% 범위로 제한
	});
};

/**
 * 주파수 대역별 색상 그라디언트 생성
 */
export const getFrequencyGradient = (
	ctx: CanvasRenderingContext2D,
	width: number,
	_height: number,
	lowColor: string,
	midColor: string,
	highColor: string,
	lowEnergy: number,
	midEnergy: number,
	highEnergy: number
): CanvasGradient => {
	const gradient = ctx.createLinearGradient(0, 0, width, 0);

	// 에너지에 따라 색상 비율 조정
	const totalEnergy = lowEnergy + midEnergy + highEnergy;

	if (totalEnergy > 0) {
		const lowRatio = lowEnergy / totalEnergy;
		const midRatio = midEnergy / totalEnergy;

		// 저음대역 (왼쪽)
		gradient.addColorStop(0, lowColor);
		gradient.addColorStop(lowRatio, lowColor);

		// 중음대역 (중간)
		gradient.addColorStop(lowRatio, midColor);
		gradient.addColorStop(lowRatio + midRatio, midColor);

		// 고음대역 (오른쪽)
		gradient.addColorStop(lowRatio + midRatio, highColor);
		gradient.addColorStop(1, highColor);
	} else {
		// 에너지가 없으면 기본 그라디언트
		gradient.addColorStop(0, lowColor);
		gradient.addColorStop(0.5, midColor);
		gradient.addColorStop(1, highColor);
	}

	return gradient;
};
