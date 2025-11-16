import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { useThemeStore } from '../../store/themeStore';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: string;
	showValue?: boolean;
	unit?: string;
	description?: string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(({ label, showValue = true, unit = '', description, value, min = 0, max = 100, className = '', ...props }, ref) => {
	const theme = useThemeStore((state) => state.theme);
	const isDark = theme === 'dark';
	const labelColor = isDark ? '#cbd5e1' : '#0f172a'; // slate-300 : slate-900
	const valueColor = isDark ? '#c084fc' : '#7e22ce'; // primary-400 : primary-700
	const descColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 : slate-500

	// 프로그래스 퍼센티지 계산 (썸의 중앙 위치에 맞춤)
	const numValue = Number(value);
	const numMin = Number(min);
	const numMax = Number(max);
	const percentage = ((numValue - numMin) / (numMax - numMin)) * 100;

	return (
		<div className={`w-full ${className}`}>
			{label && (
				<div className="mb-2">
					<div className="flex items-center justify-between mb-1">
						<label
							className="text-xs sm:text-sm md:text-base font-medium"
							style={{ color: labelColor }}
						>
							{label}
						</label>
						{showValue && (
							<span
								className="text-xs sm:text-sm md:text-base font-semibold"
								style={{ color: valueColor }}
							>
								{value}
								{unit}
							</span>
						)}
					</div>
					{description && (
						<p
							className="text-[10px] sm:text-xs md:text-sm"
							style={{ color: descColor }}
						>
							{description}
						</p>
					)}
				</div>
			)}
			<input
				ref={ref}
				type="range"
				min={min}
				max={max}
				value={value}
				className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
				style={
					{
						'--progress': `${percentage}%`,
					} as React.CSSProperties
				}
				{...props}
			/>
		</div>
	);
});

Slider.displayName = 'Slider';

export default Slider;
