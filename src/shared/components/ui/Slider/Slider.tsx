import { forwardRef, useRef, useEffect, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { useThemeStore } from '@/store/themeStore';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: string;
	showValue?: boolean;
	unit?: string;
	description?: string;
	orientation?: 'horizontal' | 'vertical';
	tickInterval?: number; // 눈금 간격 (예: 20이면 20% 단위로 눈금 표시)
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
	({ label, showValue = true, unit = '', description, value, min = 0, max = 100, step = 1, className = '', orientation = 'horizontal', tickInterval, ...props }, ref) => {
		const theme = useThemeStore((state) => state.theme);
		const isDark = theme === 'dark';
		const labelColor = isDark ? '#cbd5e1' : '#0f172a'; // slate-300 : slate-900
		const valueColor = isDark ? '#c084fc' : '#7e22ce'; // primary-400 : primary-700
		const descColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 : slate-500

		// 프로그래스 퍼센티지 계산 (썸의 중앙 위치에 맞춤)
		const numValue = Number(value);
		const numMin = Number(min);
		const numMax = Number(max);
		const numStep = Number(step);
		const percentage = ((numValue - numMin) / (numMax - numMin)) * 100;

		// 썸 크기의 절반 (픽셀 단위) - 가로/세로 모두 3px
		const thumbHalfSize = 3;

		// 트랙 크기 (픽셀 단위)
		// 세로: 높이 200px (고정)
		// 가로: 너비는 동적이므로 ref로 측정
		const trackContainerRef = useRef<HTMLDivElement>(null);
		const [trackWidth, setTrackWidth] = useState<number>(0);

		useEffect(() => {
			if (orientation === 'horizontal' && trackContainerRef.current) {
				const updateWidth = () => {
					if (trackContainerRef.current) {
						// 패딩을 제외한 실제 트랙 너비 측정
						const width = trackContainerRef.current.offsetWidth;
						setTrackWidth(width);
					}
				};

				// 초기 측정
				updateWidth();

				// ResizeObserver를 사용하여 더 정확한 측정
				const resizeObserver = new ResizeObserver(() => {
					updateWidth();
				});

				if (trackContainerRef.current) {
					resizeObserver.observe(trackContainerRef.current);
				}

				// 윈도우 리사이즈 이벤트도 함께 처리
				window.addEventListener('resize', updateWidth);

				return () => {
					resizeObserver.disconnect();
					window.removeEventListener('resize', updateWidth);
				};
			}
		}, [orientation]);

		const trackSize = orientation === 'vertical' ? 200 : trackWidth;

		// 눈금 생성
		const generateTicks = () => {
			const ticks: number[] = [];

			if (tickInterval !== undefined) {
				// tickInterval 기반: 눈금 개수를 먼저 계산
				const range = numMax - numMin;
				const interval = (range / 100) * tickInterval;
				const tickCount = Math.floor(range / interval) + 1;

				for (let i = 0; i < tickCount; i++) {
					const tickValue = numMin + i * interval;
					ticks.push(Math.round(tickValue * 100) / 100);
				}
				// 마지막 값이 max와 다르면 추가
				if (ticks[ticks.length - 1] < numMax) {
					ticks.push(numMax);
				}
			} else {
				// 기본 로직: 최대 21개 눈금
				const tickCount = Math.min(21, Math.floor((numMax - numMin) / numStep) + 1);
				const tickStep = (numMax - numMin) / (tickCount - 1);
				for (let i = 0; i < tickCount; i++) {
					ticks.push(numMin + i * tickStep);
				}
			}
			return ticks;
		};

		const ticks = generateTicks();
		const isVertical = orientation === 'vertical';

		// 눈금 위치 계산 (썸의 중심 위치에 맞춤)
		const calculateTickPosition = (tick: number) => {
			const tickPercentage = ((tick - numMin) / (numMax - numMin)) * 100;
			const offsetPercentage = (thumbHalfSize / trackSize) * 100;
			const actualRangePercentage = 100 - offsetPercentage * 2;
			return (tickPercentage / 100) * actualRangePercentage + offsetPercentage;
		};

		if (isVertical) {
			return (
				<div className={`flex flex-col items-center gap-2 ${className}`}>
					{label && (
						<div className="flex flex-col items-center gap-0.5 sm:gap-1">
							<label
								className="text-[10px] xs:text-xs sm:text-sm md:text-base font-medium"
								style={{ color: labelColor }}
							>
								{label}
							</label>
							{showValue && (
								<span
									className="text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold"
									style={{ color: valueColor }}
								>
									{value}
									{unit}
								</span>
							)}
						</div>
					)}
					<div
						className="relative flex items-center justify-center"
						style={{ paddingTop: '10px', paddingBottom: '10px', paddingLeft: '18px', paddingRight: '10px', height: '220px' }}
					>
						{/* 세로 눈금 표시 - 트랙 왼쪽에 분리되어 표시 */}
						<div
							className="absolute pointer-events-none"
							style={{
								left: '0px',
								top: '10px',
								width: '4px',
								height: '200px',
							}}
						>
							{ticks.map((tick, index) => {
								const adjustedPercentage = calculateTickPosition(tick);

								return (
									<div
										key={index}
										className="absolute"
										style={{
											bottom: `${adjustedPercentage}%`,
											right: '0',
											width: '4px',
											height: '1px',
											backgroundColor: isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.6)',
										}}
									/>
								);
							})}
						</div>
						<input
							ref={ref}
							type="range"
							min={min}
							max={max}
							step={step}
							value={value}
							className="slider-vertical rounded-lg appearance-none cursor-pointer relative z-10"
							style={
								{
									'--progress': `${percentage}%`,
									writingMode: 'vertical-lr',
									direction: 'rtl',
									background: 'transparent',
								} as React.CSSProperties
							}
							{...props}
						/>
					</div>
				</div>
			);
		}

		return (
			<div className={`w-full ${className}`}>
				{label && (
					<div className="mb-1.5 sm:mb-2">
						<div className="flex items-center justify-between mb-0.5 sm:mb-1">
							<label
								className="text-[10px] xs:text-xs sm:text-sm md:text-base font-medium"
								style={{ color: labelColor }}
							>
								{label}
							</label>
							{showValue && (
								<span
									className="text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold"
									style={{ color: valueColor }}
								>
									{value}
									{unit}
								</span>
							)}
						</div>
						{description && (
							<p
								className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm"
								style={{ color: descColor }}
							>
								{description}
							</p>
						)}
					</div>
				)}
				<div
					ref={trackContainerRef}
					className="relative"
					style={{ paddingTop: '10px', paddingBottom: '10px' }}
				>
					{/* 가로 눈금 표시 */}
					<div
						className="absolute inset-x-0 flex items-center pointer-events-none"
						style={{ top: '6px', height: '6px' }}
					>
						{ticks.map((tick, index) => {
							const adjustedPercentage = trackSize > 0 ? calculateTickPosition(tick) : ((tick - numMin) / (numMax - numMin)) * 100;

							return (
								<div
									key={index}
									className="absolute"
									style={{
										left: `${adjustedPercentage}%`,
										transform: 'translateX(-50%)',
										width: '1px',
										height: '6px',
										backgroundColor: isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.5)',
									}}
								/>
							);
						})}
					</div>
					<input
						ref={ref}
						type="range"
						min={min}
						max={max}
						step={step}
						value={value}
						className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb relative z-10"
						style={
							{
								'--progress': `${percentage}%`,
							} as React.CSSProperties
						}
						{...props}
					/>
				</div>
			</div>
		);
	}
);

Slider.displayName = 'Slider';

export default Slider;
