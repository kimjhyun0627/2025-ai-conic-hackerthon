import { X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { Slider } from '@/shared/components/ui';
import type { CategoryParameter } from '@/shared/types';
import { useThemeColors } from '@/shared/hooks';
import { mergeParamWithDefaults } from '@/shared/utils/paramUtils';

interface ParameterSliderProps {
	param: CategoryParameter;
	value: number;
	onChange: (value: number) => void;
	onRemove?: () => void;
	isRemovable?: boolean;
	orientation?: 'horizontal' | 'vertical';
}

export const ParameterSlider = ({ param, value, onChange, onRemove, isRemovable = false, orientation = 'horizontal' }: ParameterSliderProps) => {
	const colors = useThemeColors();
	const isVertical = orientation === 'vertical';
	const mergedParam = mergeParamWithDefaults(param);

	return (
		<div
			className={isRemovable ? 'glass-card rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 relative group' : 'glass-card rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5'}
			style={{
				...(isRemovable ? { overflow: 'visible' } : {}),
				background: colors.isDark ? 'rgba(28, 25, 23, 0.1)' : 'rgba(254, 248, 242, 0.4)',
				backdropFilter: 'blur(30px) saturate(200%)',
				WebkitBackdropFilter: 'blur(30px) saturate(200%)',
				border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.15)'}`,
				boxShadow: colors.isDark
					? 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.4), inset 0 1px 2px 0 rgba(0, 0, 0, 0.3), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)'
					: 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.15), inset 0 1px 2px 0 rgba(0, 0, 0, 0.1), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(251, 113, 133, 0.05)',
				...(isVertical ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '112.5px' } : {}),
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
				label={mergedParam.nameKo}
				description={isVertical ? undefined : mergedParam.description}
				value={value}
				min={mergedParam.min}
				max={mergedParam.max}
				step={mergedParam.unit === 'BPM' ? 5 : mergedParam.unit === '%' ? 5 : 1}
				tickStep={mergedParam.unit === 'BPM' ? 5 : undefined}
				tickInterval={isVertical && mergedParam.unit === '%' ? 10 : undefined}
				unit={mergedParam.unit ? ` ${mergedParam.unit}` : ''}
				orientation={orientation}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
			/>
		</div>
	);
};
