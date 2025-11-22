import { useEffect, useRef } from 'react';

interface ParticleCanvasProps {
	isPlaying: boolean;
	isDark: boolean;
	palette: string[]; // 테마별 색상 팔레트 (2-3개)
	lowEnergy: number;
	midEnergy: number;
	highEnergy: number;
	beatLevel: number;
	rms: number;
}

/**
 * 입자 클래스
 */
class Particle {
	x: number;
	y: number;
	vx: number; // x 속도
	vy: number; // y 속도
	size: number;
	color: string;
	life: number; // 입자 수명 (0-1)
	trail: Array<{ x: number; y: number; alpha: number }>; // 궤적
	isRemoving: boolean; // 제거 중인지 여부
	removeProgress: number; // 제거 진행도 (0-1)

	constructor(width: number, height: number, palette: string[]) {
		this.x = Math.random() * width;
		this.y = Math.random() * height;
		this.vx = (Math.random() - 0.5) * 2;
		this.vy = (Math.random() - 0.5) * 2;
		this.size = Math.random() * 3 + 1;
		this.color = palette[Math.floor(Math.random() * palette.length)];
		this.life = 1;
		this.trail = [];
		this.isRemoving = false;
		this.removeProgress = 0;
	}

	update(width: number, height: number, speedMultiplier: number) {
		// 속도 조절 (고주파에 따라 증가)
		this.x += this.vx * speedMultiplier;
		this.y += this.vy * speedMultiplier;

		// 경계 반사
		if (this.x < 0 || this.x > width) this.vx *= -1;
		if (this.y < 0 || this.y > height) this.vy *= -1;

		// 경계 클램핑
		this.x = Math.max(0, Math.min(width, this.x));
		this.y = Math.max(0, Math.min(height, this.y));

		// 궤적 추가 (최대 5개)
		this.trail.push({ x: this.x, y: this.y, alpha: 1 });
		if (this.trail.length > 5) {
			this.trail.shift();
		}

		// 궤적 알파 감소
		this.trail.forEach((point) => {
			point.alpha *= 0.7;
		});
	}

	draw(ctx: CanvasRenderingContext2D, beatLevel: number) {
		// 제거 중이면 페이드아웃
		if (this.isRemoving) {
			this.removeProgress += 0.03; // 제거 속도 감소 (0.05 -> 0.03으로 더 부드럽게)
			if (this.removeProgress >= 1) {
				return; // 제거 완료
			}
		}

		const alphaMultiplier = 1 - this.removeProgress; // 제거 진행도에 따른 알파

		// 궤적 그리기 (네온 스트로크 효과)
		if (this.trail.length > 1) {
			ctx.save();
			ctx.globalAlpha = 0.3 * alphaMultiplier;
			ctx.strokeStyle = this.color;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(this.trail[0].x, this.trail[0].y);
			for (let i = 1; i < this.trail.length; i++) {
				ctx.lineTo(this.trail[i].x, this.trail[i].y);
			}
			ctx.stroke();
			ctx.restore();
		}

		// 입자 그리기 (비트에 따라 크기 변화) - 변화 폭 증가
		const sizeMultiplier = 1 + beatLevel * 1.5; // 0.5 → 1.5로 증가 (1.0 ~ 2.5)
		ctx.save();
		ctx.globalAlpha = 0.8 * alphaMultiplier;
		ctx.fillStyle = this.color;
		ctx.shadowBlur = 15;
		ctx.shadowColor = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size * sizeMultiplier, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
}

/**
 * 파티클 Canvas 컴포넌트
 * - 원형/멀티 레이어 그라디언트 배경
 * - 입자 시스템
 * - 네온 스트로크 효과
 * - 비트/주파수 데이터 연동
 */
export const ParticleCanvas = ({ isPlaying, isDark, palette, lowEnergy, midEnergy, highEnergy, beatLevel, rms }: ParticleCanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const particlesRef = useRef<Particle[]>([]);
	const gradientAngleRef = useRef<number>(0);

	// 주파수 에너지 스무딩을 위한 ref
	const smoothedLowEnergyRef = useRef<number>(0);
	const smoothedMidEnergyRef = useRef<number>(0);
	const smoothedHighEnergyRef = useRef<number>(0);
	const smoothingFactor = 0.92; // 스무딩 강도 증가 (0.85 -> 0.92로 더 부드럽게)

	// 입자 개수 스무딩을 위한 ref
	const smoothedParticleCountRef = useRef<number>(30);
	const particleCountSmoothingFactor = 0.95; // 입자 개수 스무딩 강도

	// Props를 ref로 저장 (애니메이션 루프에서 사용, useEffect 재실행 방지)
	const propsRef = useRef({ isPlaying, isDark, palette, lowEnergy, midEnergy, highEnergy, beatLevel, rms });

	// Props 업데이트
	useEffect(() => {
		propsRef.current = { isPlaying, isDark, palette, lowEnergy, midEnergy, highEnergy, beatLevel, rms };
	}, [isPlaying, isDark, palette, lowEnergy, midEnergy, highEnergy, beatLevel, rms]);

	// 팔레트 변경 시 입자 색상 업데이트
	useEffect(() => {
		particlesRef.current.forEach((particle) => {
			particle.color = palette[Math.floor(Math.random() * palette.length)];
		});
	}, [palette]);

	// Canvas 크기 정보를 ref로 관리
	const canvasSizeRef = useRef<{ width: number; height: number; centerX: number; centerY: number }>({
		width: 0,
		height: 0,
		centerX: 0,
		centerY: 0,
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

		const oldWidth = canvasSizeRef.current.width;
		const oldHeight = canvasSizeRef.current.height;

		canvasSizeRef.current = { width, height, centerX, centerY };

		// 크기가 변경된 경우 입자 위치 재조정
		if (oldWidth > 0 && oldHeight > 0 && (oldWidth !== width || oldHeight !== height)) {
			const scaleX = width / oldWidth;
			const scaleY = height / oldHeight;
			particlesRef.current.forEach((particle) => {
				particle.x = particle.x * scaleX;
				particle.y = particle.y * scaleY;
				// 경계 밖으로 나간 경우 재조정
				particle.x = Math.max(0, Math.min(width, particle.x));
				particle.y = Math.max(0, Math.min(height, particle.y));
			});
		}
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

		// 입자 초기화 (최소 개수로 시작)
		const initialParticleCount = 30;
		if (particlesRef.current.length === 0) {
			const { width, height } = canvasSizeRef.current;
			particlesRef.current = Array.from({ length: initialParticleCount }, () => new Particle(width, height, propsRef.current.palette));
		}

		const draw = () => {
			// 최신 props 가져오기 (ref에서)
			const currentProps = propsRef.current;

			// 최신 크기 정보 가져오기
			const { width, height, centerX, centerY } = canvasSizeRef.current;

			// Canvas 클리어 (완전히 지우기로 변경 - 깜빡임 방지)
			ctx.clearRect(0, 0, width, height);

			// 그라디언트 배경
			// 그라디언트 각도 회전 (시간에 따라)
			gradientAngleRef.current += 0.002;

			// 원형 그라디언트 (중앙에서 외곽으로)
			const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2);
			centerGradient.addColorStop(0, currentProps.palette[0] + '40');
			centerGradient.addColorStop(0.5, currentProps.palette[1] + '30');
			centerGradient.addColorStop(1, currentProps.palette[currentProps.palette.length - 1] + '20');

			ctx.fillStyle = centerGradient;
			ctx.fillRect(0, 0, width, height);

			// 회전하는 원형 그라디언트 레이어 (RMS에 따라 크기 변화)
			const angle = gradientAngleRef.current;
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const smoothedRms = currentProps.rms * 0.9 + (gradientAngleRef.current % 1) * 0.1;
			const radius = (Math.max(width, height) / 3) * (1 + smoothedRms * 0.5);
			const x1 = centerX + cos * radius * 0.3;
			const y1 = centerY + sin * radius * 0.3;
			const x2 = centerX - cos * radius * 0.3;
			const y2 = centerY - sin * radius * 0.3;

			const rotatingGradient = ctx.createRadialGradient(x1, y1, 0, x2, y2, radius);
			rotatingGradient.addColorStop(0, currentProps.palette[1] + '30');
			rotatingGradient.addColorStop(1, currentProps.palette[0] + '00');

			ctx.globalCompositeOperation = 'screen';
			ctx.fillStyle = rotatingGradient;
			ctx.fillRect(0, 0, width, height);
			ctx.globalCompositeOperation = 'source-over';

			// 주파수 라인 (스무딩 적용)
			// 주파수 에너지 스무딩 적용
			const currentLowEnergy = currentProps.isPlaying ? currentProps.lowEnergy : 0;
			const currentMidEnergy = currentProps.isPlaying ? currentProps.midEnergy : 0;
			const currentHighEnergy = currentProps.isPlaying ? currentProps.highEnergy : 0;

			smoothedLowEnergyRef.current = smoothedLowEnergyRef.current * smoothingFactor + currentLowEnergy * (1 - smoothingFactor);
			smoothedMidEnergyRef.current = smoothedMidEnergyRef.current * smoothingFactor + currentMidEnergy * (1 - smoothingFactor);
			smoothedHighEnergyRef.current = smoothedHighEnergyRef.current * smoothingFactor + currentHighEnergy * (1 - smoothingFactor);

			// 저음/중음/고음 에너지에 따라 수평선 그리기 (스무딩된 값 사용)
			ctx.save();
			ctx.globalAlpha = 0.4;

			// 저음 - 하단
			if (smoothedLowEnergyRef.current > 0.05) {
				const y = height * 0.8;
				const lineWidth = width * smoothedLowEnergyRef.current;
				ctx.strokeStyle = currentProps.palette[0];
				ctx.lineWidth = 3;
				ctx.shadowBlur = 20;
				ctx.shadowColor = currentProps.palette[0];
				ctx.beginPath();
				ctx.moveTo((width - lineWidth) / 2, y);
				ctx.lineTo((width + lineWidth) / 2, y);
				ctx.stroke();
			}

			// 중음 - 중앙
			if (smoothedMidEnergyRef.current > 0.05) {
				const y = height * 0.5;
				const lineWidth = width * smoothedMidEnergyRef.current;
				ctx.strokeStyle = currentProps.palette[1];
				ctx.lineWidth = 3;
				ctx.shadowBlur = 20;
				ctx.shadowColor = currentProps.palette[1];
				ctx.beginPath();
				ctx.moveTo((width - lineWidth) / 2, y);
				ctx.lineTo((width + lineWidth) / 2, y);
				ctx.stroke();
			}

			// 고음 - 상단
			if (smoothedHighEnergyRef.current > 0.05) {
				const y = height * 0.2;
				const lineWidth = width * smoothedHighEnergyRef.current;
				ctx.strokeStyle = currentProps.palette[currentProps.palette.length - 1];
				ctx.lineWidth = 3;
				ctx.shadowBlur = 20;
				ctx.shadowColor = currentProps.palette[currentProps.palette.length - 1];
				ctx.beginPath();
				ctx.moveTo((width - lineWidth) / 2, y);
				ctx.lineTo((width + lineWidth) / 2, y);
				ctx.stroke();
			}

			ctx.restore();

			// 입자 개수 동적 조절 (에너지 기반 + 가중치 적용 + 스무딩)
			const minParticles = 30;
			const maxParticles = 80;
			// 주파수 대역별 가중치 (WaveCanvas와 동일)
			const lowWeight = 0.9; // 저음 가중치
			const midWeight = 1.0; // 중음 가중치
			const highWeight = 1.8; // 고음 가중치
			// 가중치가 적용된 총 에너지 (정규화를 위해 가중치 합으로 나눔)
			const weightedLow = smoothedLowEnergyRef.current * lowWeight;
			const weightedMid = smoothedMidEnergyRef.current * midWeight;
			const weightedHigh = smoothedHighEnergyRef.current * highWeight;
			const totalEnergy = (weightedLow + weightedMid + weightedHigh) / (lowWeight + midWeight + highWeight);
			const targetParticleCount = minParticles + totalEnergy * (maxParticles - minParticles);

			// 입자 개수 스무딩 적용
			smoothedParticleCountRef.current = smoothedParticleCountRef.current * particleCountSmoothingFactor + targetParticleCount * (1 - particleCountSmoothingFactor);
			const smoothedTargetCount = Math.floor(smoothedParticleCountRef.current);

			// 현재 입자 개수 조절 (스무딩된 값 사용)
			const currentCount = particlesRef.current.length;
			if (currentCount < smoothedTargetCount) {
				// 입자 추가 (더 부드럽게)
				const addCount = Math.min(smoothedTargetCount - currentCount, 3); // 한 번에 최대 3개씩 추가 (5 -> 3)
				for (let i = 0; i < addCount; i++) {
					particlesRef.current.push(new Particle(width, height, currentProps.palette));
				}
			} else if (currentCount > smoothedTargetCount) {
				// 입자 제거 (제거 표시만, 더 부드럽게)
				const removeCount = Math.min(currentCount - smoothedTargetCount, 3); // 한 번에 최대 3개씩 제거 (5 -> 3)
				let removed = 0;
				for (let i = particlesRef.current.length - 1; i >= 0 && removed < removeCount; i--) {
					if (!particlesRef.current[i].isRemoving) {
						particlesRef.current[i].isRemoving = true;
						removed++;
					}
				}
			}

			// 제거 완료된 입자 삭제
			particlesRef.current = particlesRef.current.filter((particle) => {
				if (particle.isRemoving && particle.removeProgress >= 1) {
					return false; // 제거
				}
				return true;
			});

			// 입자 업데이트 및 그리기
			// 고주파에 따라 속도 증가 - 변화 폭 증가 (1.0 ~ 3.5)
			const smoothedHighEnergy = smoothedHighEnergyRef.current;
			const speedMultiplier = currentProps.isPlaying ? 1.0 + smoothedHighEnergy * 2.5 : 0.3;

			particlesRef.current.forEach((particle) => {
				particle.update(width, height, speedMultiplier);
				particle.draw(ctx, currentProps.beatLevel);
			});

			// 입자 간 연결선 그리기 (가까운 입자들)
			ctx.save();
			ctx.globalAlpha = 0.2;
			ctx.strokeStyle = currentProps.palette[1];
			ctx.lineWidth = 1;
			for (let i = 0; i < particlesRef.current.length; i++) {
				for (let j = i + 1; j < particlesRef.current.length; j++) {
					const p1 = particlesRef.current[i];
					const p2 = particlesRef.current[j];
					const dx = p1.x - p2.x;
					const dy = p1.y - p2.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < 150) {
						ctx.beginPath();
						ctx.moveTo(p1.x, p1.y);
						ctx.lineTo(p2.x, p2.y);
						ctx.stroke();
					}
				}
			}
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
