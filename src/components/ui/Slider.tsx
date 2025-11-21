import { forwardRef, useRef, useEffect, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { useThemeStore } from '../../store/themeStore';

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

		// 썸 크기 (픽셀 단위)
		// 가로 슬라이더: 썸 width 12px, height 20px → 이동 방향은 가로이므로 width의 절반인 6px 고려
		// 세로 슬라이더: 썸 width 20px, height 12px → 이동 방향은 세로이므로 height의 절반인 6px 고려
		const thumbHalfSize = orientation === 'vertical' ? 6 : 6; // 세로: height 12px / 2, 가로: width 12px / 2

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

		// 눈금 생성 (썸의 중심 위치를 기준으로)
		// 썸이 직사각형이므로, 썸의 절반 크기만큼 양쪽에서 빼서 실제 이동 가능한 범위를 계산
		const generateTicks = () => {
			const ticks: number[] = [];

			// tickInterval이 제공되면 해당 간격으로만 눈금 생성
			if (tickInterval !== undefined) {
				const range = numMax - numMin;
				const interval = (range / 100) * tickInterval; // tickInterval을 퍼센트로 해석
				for (let i = numMin; i <= numMax; i += interval) {
					ticks.push(Math.round(i * 100) / 100); // 소수점 반올림
				}
				// 마지막 값이 정확히 max가 아니면 추가
				if (ticks[ticks.length - 1] !== numMax) {
					ticks.push(numMax);
				}
			} else {
				// 기존 로직: 최대 20개 눈금
				const tickCount = Math.min(20, Math.floor((numMax - numMin) / numStep) + 1);
				const tickStep = (numMax - numMin) / (tickCount - 1);
				for (let i = 0; i < tickCount; i++) {
					ticks.push(numMin + i * tickStep);
				}
			}
			return ticks;
		};

		const ticks = generateTicks();
		const isVertical = orientation === 'vertical';

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
								width: '8px',
								height: '200px',
							}}
						>
							{ticks.map((tick, index) => {
								// 썸의 중심 위치를 기준으로 눈금 위치 계산
								// 세로 슬라이더: 썸 높이 12px의 절반인 6px만큼 양쪽에서 빼서 실제 이동 범위 계산
								// 트랙 높이 200px에서 썸의 절반 크기(6px)만큼 양쪽에서 빼면 실제 이동 범위는 188px
								// 눈금 위치 = (tick - min) / (max - min) * 실제이동범위 + 썸절반크기
								const tickPercentage = ((tick - numMin) / (numMax - numMin)) * 100;

								// 썸의 절반 크기를 퍼센트로 변환 (트랙 높이 기준)
								const offsetPercentage = (thumbHalfSize / trackSize) * 100;
								// 실제 이동 범위의 퍼센트 (100% - 양쪽 오프셋)
								const actualRangePercentage = 100 - offsetPercentage * 2;
								// 눈금 위치를 실제 이동 범위 내에서 계산하고, 썸 절반 크기만큼 오프셋 추가
								const adjustedPercentage = (tickPercentage / 100) * actualRangePercentage + offsetPercentage;

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
							className="slider-vertical bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer relative z-10"
							style={
								{
									'--progress': `${percentage}%`,
									writingMode: 'vertical-lr',
									direction: 'rtl',
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
					{/* 눈금 표시 */}
					<div
						className="absolute inset-x-0 flex items-center pointer-events-none"
						style={{ top: '10px', height: '6px' }}
					>
						{ticks.map((tick, index) => {
							// 썸의 중심 위치를 기준으로 눈금 위치 계산
							// 가로 슬라이더: 썸 너비 12px의 절반인 6px만큼 양쪽에서 빼서 실제 이동 범위 계산
							const tickPercentage = ((tick - numMin) / (numMax - numMin)) * 100;

							// 트랙 너비가 측정되었을 때만 썸 크기 고려
							if (trackSize > 0) {
								// 썸의 절반 크기를 퍼센트로 변환 (트랙 너비 기준)
								const offsetPercentage = (thumbHalfSize / trackSize) * 100;
								// 실제 이동 범위의 퍼센트 (100% - 양쪽 오프셋)
								const actualRangePercentage = 100 - offsetPercentage * 2;
								// 눈금 위치를 실제 이동 범위 내에서 계산하고, 썸 절반 크기만큼 오프셋 추가
								const adjustedPercentage = (tickPercentage / 100) * actualRangePercentage + offsetPercentage;

								return (
									<div
										key={index}
										className="absolute"
										style={{
											left: `${adjustedPercentage}%`,
											transform: 'translateX(-50%)',
											width: '1px',
											height: '4px',
											backgroundColor: isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.5)',
										}}
									/>
								);
							}

							// 트랙 너비가 측정되기 전에는 기본 계산 사용
							return (
								<div
									key={index}
									className="absolute"
									style={{
										left: `${tickPercentage}%`,
										transform: 'translateX(-50%)',
										width: '1px',
										height: '4px',
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
