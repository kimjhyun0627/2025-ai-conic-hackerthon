import { useEffect, useRef } from 'react';

interface OscilloscopeCanvasProps {
	isPlaying: boolean;
	isDark: boolean;
	palette: string[]; // 테마별 색상 팔레트 (2-3개)
	lowEnergy: number;
	midEnergy: number;
	highEnergy: number;
	beatLevel: number;
	rms: number;
	bpm: number | null; // BPM (null이면 기본 속도 사용)
}

/**
 * 오실로스코프 Canvas 컴포넌트
 * - 중앙에서 바깥으로 퍼지는 원형 파형
 * - 주파수 데이터를 원형으로 표현
 * - 비트에 따라 파형 크기 변화
 */
export const OscilloscopeCanvas = ({ isPlaying, isDark, palette, lowEnergy, midEnergy, highEnergy, beatLevel, rms, bpm }: OscilloscopeCanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const angleRef = useRef<number>(0);

	// 주파수 에너지 스무딩을 위한 ref
	const smoothedLowEnergyRef = useRef<number>(0);
	const smoothedMidEnergyRef = useRef<number>(0);
	const smoothedHighEnergyRef = useRef<number>(0);
	const smoothingFactor = 0.92; // 스무딩 강도 증가 (0.92 -> 0.97로 더 부드럽게)

	// BPM 기반 회전 속도 스무딩
	const smoothedRotationSpeedRef = useRef<number>(0.002); // 기본 회전 속도

	// Props를 ref로 저장 (애니메이션 루프에서 사용, useEffect 재실행 방지)
	const propsRef = useRef({ isPlaying, isDark, palette, lowEnergy, midEnergy, highEnergy, beatLevel, rms, bpm });

	// Props 업데이트
	useEffect(() => {
		propsRef.current = { isPlaying, isDark, palette, lowEnergy, midEnergy, highEnergy, beatLevel, rms, bpm };
	}, [isPlaying, isDark, palette, lowEnergy, midEnergy, highEnergy, beatLevel, rms, bpm]);

	// Canvas 크기 정보를 ref로 관리
	const canvasSizeRef = useRef<{ width: number; height: number; centerX: number; centerY: number; maxRadius: number }>({
		width: 0,
		height: 0,
		centerX: 0,
		centerY: 0,
		maxRadius: 0,
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
		const centerX = width / 2;
		const centerY = height / 2;
		const maxRadius = Math.min(width, height) / 2 - 20;

		canvasSizeRef.current = { width, height, centerX, centerY, maxRadius };
	};

	// Canvas 크기 및 컨텍스트 초기화 + 메인 애니메이션 루프
	useEffect(() => {
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

		// 주파수 데이터 포인트 수
		const dataPoints = 512;
		const angleStep = (Math.PI * 2) / dataPoints;

		const draw = () => {
			// 최신 props 가져오기 (ref에서)
			const currentProps = propsRef.current;

			// 최신 크기 정보 가져오기
			const { width, height, centerX, centerY, maxRadius } = canvasSizeRef.current;

			// Canvas 클리어
			ctx.clearRect(0, 0, width, height);

			// BPM 기반 회전 속도 계산
			const baseBPM = 120; // 기준 BPM
			const baseRotationSpeed = 0.005; // 기준 회전 속도 (120 BPM일 때)

			// BPM에 따라 회전 속도 조절 (BPM이 높을수록 빠르게, 하지만 변화 폭 제한)
			let targetRotationSpeed = baseRotationSpeed;
			if (currentProps.bpm !== null && currentProps.bpm > 0) {
				// BPM 비율 계산 (제곱근 사용으로 급격한 변화 완화)
				const bpmRatio = Math.sqrt(currentProps.bpm / baseBPM); // 제곱근으로 변화 완화
				// 회전 속도 범위 제한 (최소 0.5배, 최대 1.3배)
				const clampedRatio = Math.max(0.5, Math.min(1.3, bpmRatio));
				targetRotationSpeed = baseRotationSpeed * clampedRatio;
			}

			// 회전 속도 스무딩 적용 (더 강한 스무딩)
			smoothedRotationSpeedRef.current = smoothedRotationSpeedRef.current * 0.98 + targetRotationSpeed * 0.02;

			// 각도 회전 (BPM에 의존적)
			angleRef.current += smoothedRotationSpeedRef.current;

			// 주파수 에너지 스무딩 적용
			const currentLowEnergy = currentProps.isPlaying ? currentProps.lowEnergy : 0;
			const currentMidEnergy = currentProps.isPlaying ? currentProps.midEnergy : 0;
			const currentHighEnergy = currentProps.isPlaying ? currentProps.highEnergy : 0;

			smoothedLowEnergyRef.current = smoothedLowEnergyRef.current * smoothingFactor + currentLowEnergy * (1 - smoothingFactor);
			smoothedMidEnergyRef.current = smoothedMidEnergyRef.current * smoothingFactor + currentMidEnergy * (1 - smoothingFactor);
			smoothedHighEnergyRef.current = smoothedHighEnergyRef.current * smoothingFactor + currentHighEnergy * (1 - smoothingFactor);

			// 배경 그라디언트 (중앙에서 외곽으로)
			const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 1.5);
			bgGradient.addColorStop(0, currentProps.palette[0] + '20');
			bgGradient.addColorStop(0.5, currentProps.palette[1] + '15');
			bgGradient.addColorStop(1, currentProps.palette[currentProps.palette.length - 1] + '00');

			ctx.fillStyle = bgGradient;
			ctx.fillRect(0, 0, width, height);

			// 오실로스코프 파형 그리기
			ctx.save();
			ctx.translate(centerX, centerY);

			// 기본 반지름 (비트 레벨에 따라 변화) - 변화 폭 감소
			const baseRadius = maxRadius * 0.5 * (1 + currentProps.beatLevel * 0.15); // 반응 속도 감소: 0.3 -> 0.15

			// 파형 생성 (저음/중음/고음 각각 다른 주파수로)
			for (let layer = 0; layer < 3; layer++) {
				const layerAngle = angleRef.current + (layer * (Math.PI * 2)) / 3; // 각 레이어를 120도씩 회전
				const color = currentProps.palette[layer] || currentProps.palette[currentProps.palette.length - 1];
				const energy = layer === 0 ? smoothedLowEnergyRef.current : layer === 1 ? smoothedMidEnergyRef.current : smoothedHighEnergyRef.current;

				// 파형 그리기 (외부 글로우 쉐도우 효과)
				ctx.save();
				ctx.shadowBlur = 40; // 외부 글로우 강도 증가 (20 -> 40)
				ctx.shadowColor = color;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;
				ctx.strokeStyle = color;
				ctx.lineWidth = 3; // 선 두께 증가 (2 -> 3)
				ctx.globalAlpha = 0.9; // 투명도 증가 (0.8 -> 0.9)

				ctx.beginPath();

				let firstPoint = true;

				for (let i = 0; i < dataPoints; i++) {
					const angle = angleStep * i + layerAngle;

					// 주파수에 따른 파형 진폭 계산
					// 저음: 낮은 주파수, 중음: 중간 주파수, 고음: 높은 주파수
					const frequency = layer === 0 ? 2 : layer === 1 ? 4 : 8;
					// 에너지를 제곱하여 변화를 부드럽게 하고, 진폭 감소 (0.6 -> 0.35)
					const smoothEnergy = Math.sqrt(energy); // 에너지 제곱근으로 급격한 변화 완화
					const waveAmplitude = Math.sin(angle * frequency + angleRef.current * 1) * smoothEnergy * maxRadius * 0.35;

					// 반지름 계산 (기본 반지름 + 파형 진폭)
					const radius = baseRadius + waveAmplitude;

					const x = Math.cos(angle) * radius;
					const y = Math.sin(angle) * radius;

					if (firstPoint) {
						ctx.moveTo(x, y);
						firstPoint = false;
					} else {
						ctx.lineTo(x, y);
					}
				}

				ctx.closePath();
				ctx.stroke();
				ctx.restore();

				// 내부 채우기 (그라디언트)
				if (energy > 0.1) {
					const fillGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
					fillGradient.addColorStop(0, color + '30');
					fillGradient.addColorStop(0.5, color + '15');
					fillGradient.addColorStop(1, color + '00');

					ctx.fillStyle = fillGradient;
					ctx.fill();
				}
			}

			// 중심점 강조 (RMS에 따라 크기 변화) - 외부 글로우 효과
			ctx.save();
			ctx.fillStyle = currentProps.palette[1];
			ctx.shadowBlur = 50; // 외부 글로우 강도 증가 (30 -> 50)
			ctx.shadowColor = currentProps.palette[1];
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.globalAlpha = 0.95; // 투명도 증가 (0.9 -> 0.95)
			const centerSize = 0; // 4 + currentProps.rms * 12; // 크기 증가 (3 -> 4, 10 -> 12)
			ctx.beginPath();
			ctx.arc(0, 0, centerSize, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();

			ctx.restore();

			animationFrameRef.current = requestAnimationFrame(draw);
		};

		animationFrameRef.current = requestAnimationFrame(draw);

		return () => {
			resizeObserver.disconnect();
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, []); // 빈 배열로 한 번만 실행 (props는 ref로 관리)

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 w-full h-full"
			style={{
				zIndex: 1,
				pointerEvents: 'none',
			}}
		/>
	);
};
