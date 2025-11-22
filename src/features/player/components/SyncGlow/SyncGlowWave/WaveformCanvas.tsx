import { useEffect, useRef } from 'react';
import { getSharedAnalyser } from '@/shared/audio';

interface WaveformCanvasProps {
	isPlaying: boolean;
	isDark: boolean;
}

/**
 * 글라스모피즘 스타일 막대 그리기
 */
const drawGlassBar = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, primaryColorRgb: string, isDark: boolean, _direction: 'center') => {
	// 반투명 배경 (더 불투명하게)
	const bgOpacity = isDark ? 0.9 : 0.9;

	// 테두리
	const borderColor = isDark ? `rgba(${primaryColorRgb}, 0.6)` : `rgba(${primaryColorRgb}, 0.7)`;

	// 그라디언트 (중앙이 밝고, 위아래 가장자리가 어두움)
	const gradient = ctx.createLinearGradient(x, y, x, y + height);
	gradient.addColorStop(0, `rgba(${primaryColorRgb}, ${bgOpacity - 0.1})`); // 위쪽 가장자리
	gradient.addColorStop(0.5, `rgba(${primaryColorRgb}, ${bgOpacity + 0.15})`); // 중앙 (가장 밝음)
	gradient.addColorStop(1, `rgba(${primaryColorRgb}, ${bgOpacity - 0.1})`); // 아래쪽 가장자리

	// 외부 blur 효과 (shadow) - 끝이 둥근 막대에 직접 적용
	ctx.save();
	ctx.shadowColor = `rgba(${primaryColorRgb}, ${isDark ? 0.7 : 0.8})`; // 프라이머리 컬러 그림자 강화
	ctx.shadowBlur = 20; // 외부 blur 강도 증가
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	// 막대 모양 그리기 (shadow 효과 포함, 둥근 모서리)
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, radius);
	ctx.fillStyle = gradient;
	ctx.fill();

	ctx.restore();

	// 테두리 그리기
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, radius);
	ctx.stroke();

	// 내부 하이라이트 (위아래 가장자리)
	ctx.save();

	// 위쪽 하이라이트
	const topHighlightGradient = ctx.createLinearGradient(x, y, x, y + height * 0.2);
	topHighlightGradient.addColorStop(0, `rgba(255, 255, 255, ${isDark ? 0.15 : 0.25})`);
	topHighlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
	ctx.fillStyle = topHighlightGradient;
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, radius);
	ctx.fill();

	// 아래쪽 하이라이트
	const bottomHighlightGradient = ctx.createLinearGradient(x, y + height * 0.8, x, y + height);
	bottomHighlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
	bottomHighlightGradient.addColorStop(1, `rgba(255, 255, 255, ${isDark ? 0.15 : 0.25})`);
	ctx.fillStyle = bottomHighlightGradient;
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, radius);
	ctx.fill();
	ctx.restore();
};

/**
 * Canvas를 사용한 주파수 스펙트럼 막대 그래프 렌더링 컴포넌트
 */
export const WaveformCanvas = ({ isPlaying, isDark }: WaveformCanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const smoothedHeightsRef = useRef<number[]>(new Array(21).fill(0)); // 21개 막대의 스무딩된 높이

	// Canvas 크기 정보를 ref로 관리
	const canvasSizeRef = useRef<{
		width: number;
		height: number;
		centerY: number;
		barWidth: number;
		barGap: number;
		minBarHeight: number;
		maxBarHeight: number;
		paddingLeft: number;
		paddingRight: number;
	}>({
		width: 0,
		height: 0,
		centerY: 0,
		barWidth: 0,
		barGap: 0,
		minBarHeight: 0,
		maxBarHeight: 0,
		paddingLeft: 0,
		paddingRight: 0,
	});

	// Canvas 크기 업데이트 함수
	const updateCanvasSize = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * window.devicePixelRatio;
		canvas.height = rect.height * window.devicePixelRatio;
		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

		const width = rect.width;
		const height = rect.height;
		const centerY = height / 2;
		const barsPerBand = 7;
		const totalBars = barsPerBand * 2 + 5;
		const paddingLeft = width * 0.1;
		const paddingRight = width * 0.1;
		const effectiveWidth = width - paddingLeft - paddingRight;
		const barWidth = (effectiveWidth / totalBars) * 0.8;
		const barGap = (effectiveWidth / totalBars) * 0.2;
		const minBarHeight = barWidth;
		const maxBarHeight = height * 1;

		canvasSizeRef.current = {
			width,
			height,
			centerY,
			barWidth,
			barGap,
			minBarHeight,
			maxBarHeight,
			paddingLeft,
			paddingRight,
		};
	};

	useEffect(() => {
		// 프라이머리 컬러 팔레트 (저음/중음/고음별로 다른 색상)
		// 다크 모드: primary-400, primary-300, primary-100
		// 라이트 모드: primary-400, primary-500, primary-600
		const getPrimaryColorRgb = (type: 'low' | 'mid' | 'high'): string => {
			if (isDark) {
				// 다크 모드
				switch (type) {
					case 'low':
						return '251, 113, 133'; // primary-400 (#fb7185)
					case 'mid':
						return '252, 165, 165'; // primary-300 (#fca5a5)
					case 'high':
						return '254, 226, 226'; // primary-100 (#fee2e2)
				}
			} else {
				// 라이트 모드
				switch (type) {
					case 'low':
						return '251, 113, 133'; // primary-500 (#fb7185)
					case 'mid':
						return '244, 63, 94'; // primary-600 (#f43f5e)
					case 'high':
						return '225, 29, 72'; // primary-700 (#e11d48)
				}
			}
		};
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// 초기 크기 설정
		updateCanvasSize();

		// ResizeObserver로 canvas 크기 변경 감지
		const resizeObserver = new ResizeObserver(() => {
			updateCanvasSize();
		});

		resizeObserver.observe(canvas);

		const smoothingFactor = 0.95; // 스무딩 강도 (높을수록 부드러움)

		const analyser = getSharedAnalyser();
		let frequencyDataArray: Uint8Array | null = null;
		let totalBarCount = 0;
		let lowBinEnd = 0;
		let midBinEnd = 0;
		let highBinStart = 0;

		if (analyser) {
			// Frequency domain data를 위한 배열
			frequencyDataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array;
			totalBarCount = analyser.frequencyBinCount;

			// 주파수 대역 구분 (Hz 기준)
			const sampleRate = analyser.context.sampleRate;
			const nyquist = sampleRate / 2;
			const lowFreqEnd = 180; // 저음 끝 (180Hz)
			const midFreqEnd = 1500; // 중음 끝 (1.5kHz)
			const highFreqStart = 4000; // 고음 시작 (1.5kHz, 중음과 동일한 시작점)
			lowBinEnd = Math.floor((lowFreqEnd / nyquist) * totalBarCount);
			midBinEnd = Math.floor((midFreqEnd / nyquist) * totalBarCount);
			highBinStart = Math.floor((highFreqStart / nyquist) * totalBarCount);
		}

		// 막대 그래프 그리기 함수 (재생/일시정지 모두 처리)
		const drawFrequencyBars = () => {
			// 최신 크기 정보 가져오기
			const { width, height, centerY, barWidth, barGap, minBarHeight, maxBarHeight } = canvasSizeRef.current;
			const barsPerBand = 7;
			const totalBars = barsPerBand * 2 + 5;

			// Canvas 클리어
			ctx.clearRect(0, 0, width, height);

			// 막대 인덱스 추적
			let barIndex = 0;

			// 재생 중이면 실제 frequency 데이터 사용, 일시정지면 target을 0으로 설정
			if (isPlaying && analyser && frequencyDataArray) {
				// Frequency domain data 가져오기
				// @ts-expect-error - Web Audio API 타입 호환성 문제
				analyser.getByteFrequencyData(frequencyDataArray);

				// 저음대역: 7개 막대
				const lowBinCount = lowBinEnd;
				const lowBinsPerBar = Math.floor(lowBinCount / barsPerBand);
				for (let i = 0; i < barsPerBand; i++) {
					const startBin = i * lowBinsPerBar;
					const endBin = i === barsPerBand - 1 ? lowBinEnd : (i + 1) * lowBinsPerBar;

					// 해당 구간의 평균값 계산
					let sum = 0;
					for (let j = startBin; j < endBin; j++) {
						sum += frequencyDataArray[j];
					}
					const avgValue = sum / (endBin - startBin);
					const normalizedValue = avgValue / 255; // 0-1로 정규화
					// 저음역대는 가중치를 낮춰서 시각적 밸런스 조정
					const weightedValue = normalizedValue * 0.9; // 저음 가중치 감소
					const targetHeight = weightedValue * maxBarHeight;

					// 스무딩 적용
					const currentHeight = smoothedHeightsRef.current[barIndex];
					const smoothedHeight = currentHeight * smoothingFactor + targetHeight * (1 - smoothingFactor);
					smoothedHeightsRef.current[barIndex] = smoothedHeight;
					// 최소 높이 보장 (value가 0일 때도 보이게)
					const barHeight = Math.max(smoothedHeight, minBarHeight);

					// 막대 위치 계산 (중앙 정렬)
					const x = i * (barWidth + barGap) + (width - (totalBars * barWidth + (totalBars - 1) * barGap)) / 2;
					const barY = centerY - barHeight / 2; // 막대 시작 위치 (중앙 기준)
					const radius = Math.min(barWidth / 2, barHeight / 2); // 최대한 둥근 모서리 (너비/높이 중 작은 값의 절반)

					// 막대를 하나로 통합해서 중앙 기준으로 위아래 대칭으로 그리기
					drawGlassBar(ctx, x, barY, barWidth, barHeight, radius, getPrimaryColorRgb('low'), isDark, 'center');

					barIndex++;
				}

				// 중음대역: 7개 막대
				const midBinCount = midBinEnd - lowBinEnd;
				const midBinsPerBar = Math.floor(midBinCount / barsPerBand);
				for (let i = 0; i < barsPerBand; i++) {
					const startBin = lowBinEnd + i * midBinsPerBar;
					const endBin = i === barsPerBand - 1 ? midBinEnd : lowBinEnd + (i + 1) * midBinsPerBar;

					// 해당 구간의 평균값 계산
					let sum = 0;
					for (let j = startBin; j < endBin; j++) {
						sum += frequencyDataArray[j];
					}
					const avgValue = sum / (endBin - startBin);
					const normalizedValue = avgValue / 255;
					// 중음역대는 가중치를 약간만 조정
					const weightedValue = normalizedValue * 1; // 중음 가중치 약간 감소
					const targetHeight = weightedValue * maxBarHeight;

					// 스무딩 적용
					const currentHeight = smoothedHeightsRef.current[barIndex];
					const smoothedHeight = currentHeight * smoothingFactor + targetHeight * (1 - smoothingFactor);
					smoothedHeightsRef.current[barIndex] = smoothedHeight;
					// 최소 높이 보장 (value가 0일 때도 보이게)
					const barHeight = Math.max(smoothedHeight, minBarHeight);

					// 막대 위치 계산 (중앙 정렬)
					const x = (barsPerBand + i) * (barWidth + barGap) + (width - (totalBars * barWidth + (totalBars - 1) * barGap)) / 2;
					const barY = centerY - barHeight / 2; // 막대 시작 위치 (중앙 기준)
					const radius = Math.min(barWidth / 2, barHeight / 2); // 최대한 둥근 모서리 (너비/높이 중 작은 값의 절반)

					// 막대를 하나로 통합해서 중앙 기준으로 위아래 대칭으로 그리기
					drawGlassBar(ctx, x, barY, barWidth, barHeight, radius, getPrimaryColorRgb('mid'), isDark, 'center');

					barIndex++;
				}

				// 고음대역: 5개 막대 (비균등 분할 - 낮은 고음은 좁게, 높은 고음은 넓게)
				const highBinCount = totalBarCount - highBinStart;
				// 각 막대의 상대적 비율 (낮은 고음은 작은 값, 높은 고음은 큰 값)
				const highBarRatios = [0.3, 0.4, 0.5, 1, 1.5]; // 총합 5.0 (5개)
				const highBarCount = highBarRatios.length; // 실제 고음 막대 개수 (5개)
				const ratioSum = highBarRatios.reduce((sum, ratio) => sum + ratio, 0);

				let currentBin = highBinStart;
				for (let i = 0; i < highBarCount; i++) {
					// 각 막대가 차지할 빈 개수 계산 (비율에 따라)
					const barBinCount = Math.floor((highBarRatios[i] / ratioSum) * highBinCount);
					const startBin = currentBin;
					const endBin = i === highBarCount - 1 ? totalBarCount : currentBin + barBinCount;
					currentBin = endBin;

					// 해당 구간의 평균값 계산
					let sum = 0;
					for (let j = startBin; j < endBin; j++) {
						sum += frequencyDataArray[j];
					}
					const avgValue = sum / (endBin - startBin);
					const normalizedValue = avgValue / 255;
					// 고음역대는 가중치를 높여서 시각적 밸런스 조정
					const weightedValue = normalizedValue * 1.5; // 고음 가중치 증가
					const targetHeight = weightedValue * maxBarHeight;

					// 스무딩 적용
					const currentHeight = smoothedHeightsRef.current[barIndex];
					const smoothedHeight = currentHeight * smoothingFactor + targetHeight * (1 - smoothingFactor);
					smoothedHeightsRef.current[barIndex] = smoothedHeight;
					// 최소 높이 보장 (value가 0일 때도 보이게)
					const barHeight = Math.max(smoothedHeight, minBarHeight);

					// 막대 위치 계산 (중앙 정렬)
					const x = (barsPerBand * 2 + i) * (barWidth + barGap) + (width - (totalBars * barWidth + (totalBars - 1) * barGap)) / 2;
					const barY = centerY - barHeight / 2; // 막대 시작 위치 (중앙 기준)
					const radius = Math.min(barWidth / 2, barHeight / 2); // 최대한 둥근 모서리 (너비/높이 중 작은 값의 절반)

					// 막대를 하나로 통합해서 중앙 기준으로 위아래 대칭으로 그리기
					drawGlassBar(ctx, x, barY, barWidth, barHeight, radius, getPrimaryColorRgb('high'), isDark, 'center');

					barIndex++;
				}
			} else {
				// 일시정지 시: 모든 막대를 0으로 스무스하게 줄이기
				for (let i = 0; i < totalBars; i++) {
					// 막대 타입 결정 (저음/중음/고음)
					let barType: 'low' | 'mid' | 'high';
					if (i < barsPerBand) {
						barType = 'low'; // 저음
					} else if (i < barsPerBand * 2) {
						barType = 'mid'; // 중음
					} else {
						barType = 'high'; // 고음
					}
					const targetHeight = 0; // 일시정지 시 target은 0

					// 스무딩 적용
					const currentHeight = smoothedHeightsRef.current[i];
					const smoothedHeight = currentHeight * smoothingFactor + targetHeight * (1 - smoothingFactor);
					smoothedHeightsRef.current[i] = smoothedHeight;
					// 최소 높이 보장 (value가 0일 때도 보이게)
					const barHeight = Math.max(smoothedHeight, minBarHeight);

					// 막대 위치 계산 (중앙 정렬)
					const x = i * (barWidth + barGap) + (width - (totalBars * barWidth + (totalBars - 1) * barGap)) / 2;
					const barY = centerY - barHeight / 2; // 막대 시작 위치 (중앙 기준)
					const radius = Math.min(barWidth / 2, barHeight / 2); // 최대한 둥근 모서리 (너비/높이 중 작은 값의 절반)

					// 막대를 하나로 통합해서 중앙 기준으로 위아래 대칭으로 그리기
					drawGlassBar(ctx, x, barY, barWidth, barHeight, radius, getPrimaryColorRgb(barType), isDark, 'center');
				}
			}

			animationFrameRef.current = requestAnimationFrame(drawFrequencyBars);
		};

		// 애니메이션 시작
		animationFrameRef.current = requestAnimationFrame(drawFrequencyBars);

		return () => {
			resizeObserver.disconnect();
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [isPlaying, isDark]);

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 w-full h-full"
			style={{
				zIndex: 2,
				pointerEvents: 'none',
			}}
		/>
	);
};
