import { X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { Slider } from '../UI';
import type { CategoryParameter } from '../../types';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ParameterSliderProps {
	param: CategoryParameter;
	value: number;
	onChange: (value: number) => void;
	onRemove?: () => void;
	isRemovable?: boolean;
}

export const ParameterSlider = ({ param, value, onChange, onRemove, isRemovable = false }: ParameterSliderProps) => {
	const colors = useThemeColors();

	return (
		<div
			className={isRemovable ? 'glass-card rounded-2xl p-4 md:p-5 relative group' : 'glass-card rounded-2xl p-4 md:p-5'}
			style={{
				...(isRemovable ? { overflow: 'visible' } : {}),
				background: colors.isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)',
				backdropFilter: 'blur(30px) saturate(200%)',
				WebkitBackdropFilter: 'blur(30px) saturate(200%)',
				border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.5)'}`,
				boxShadow: colors.isDark
					? 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.4), inset 0 1px 2px 0 rgba(0, 0, 0, 0.3), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)'
					: 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.15), inset 0 1px 2px 0 rgba(0, 0, 0, 0.1), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(31, 38, 135, 0.05)',
			}}
		>
			{isRemovable && onRemove && (
				<button
					onClick={onRemove}
					className="absolute -top-1 -right-1 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-50 backdrop-blur-md border group-hover:bg-white/20 group-hover:dark:bg-slate-800/40 hover:bg-white/30 dark:hover:bg-slate-800/50"
					style={{
						borderColor: colors.glassBorder,
					}}
					aria-label="파라미터 제거"
				>
					<X
						className="w-4 h-4"
						style={{ color: colors.iconColor }}
					/>
				</button>
			)}
			<Slider
				label={param.nameKo}
				description={param.description}
				value={value}
				min={param.min}
				max={param.max}
				step={param.unit === 'BPM' ? 5 : 1}
				unit={param.unit ? ` ${param.unit}` : ''}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
			/>
		</div>
	);
};
