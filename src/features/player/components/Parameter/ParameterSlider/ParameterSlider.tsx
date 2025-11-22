import { X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
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
	currentBPM?: number | null;
}

export const ParameterSlider = ({ param, value, onChange, onRemove, isRemovable = false, orientation = 'horizontal', currentBPM }: ParameterSliderProps) => {
	const colors = useThemeColors();
	const isVertical = orientation === 'vertical';
	const mergedParam = mergeParamWithDefaults(param);
	const isBPM = mergedParam.unit === 'BPM' || param.id === 'tempo';
	// BPM을 5 단위로 반올림
	const roundedBPM = currentBPM !== null && currentBPM !== undefined ? Math.round(currentBPM / 5) * 5 : null;
	const bpmPercentage = isBPM && roundedBPM !== null ? Math.min(100, Math.max(0, ((roundedBPM - mergedParam.min) / (mergedParam.max - mergedParam.min)) * 100)) : null;

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
			<div className="relative w-full">
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
				{/* BPM 표시 오버레이 (슬라이더 트랙 위에 다른 색으로 표시) */}
				{isBPM && (
					<motion.div
						className="absolute pointer-events-none"
						style={{
							...(isVertical
								? {
										// 세로 모드: label 높이(gap-2) + 트랙 컨테이너 paddingTop(10px)부터 시작
										left: 'calc(50% - 1px)',
										transform: 'translateX(-50%)',
										bottom: '10px',
										width: '4px',
										background:
											bpmPercentage !== null
												? colors.isDark
													? 'linear-gradient(to top, #fde047 0%, #facc15 100%)'
													: 'linear-gradient(to top, #eab308 0%, #ca8a04 100%)'
												: colors.isDark
													? 'rgba(253, 224, 71, 0.8)'
													: 'rgba(234, 179, 8, 0.9)',
										borderRadius: '1px',
										opacity: bpmPercentage !== null ? 0.95 : 1,
										zIndex: 5,
									}
								: {
										// 가로 모드: label 높이(1.5rem) + description 높이(0.5rem) + 트랙 컨테이너 paddingTop(10px) + 눈금 top(6px)
										top: 'calc(1.5rem + 0.5rem + 10px + 6px + 8px + 7px)',
										left: 0,
										height: '4px',
										background:
											bpmPercentage !== null
												? colors.isDark
													? 'linear-gradient(to right, #fde047 0%, #facc15 100%)'
													: 'linear-gradient(to right, #eab308 0%, #ca8a04 100%)'
												: colors.isDark
													? 'rgba(253, 224, 71, 0.8)'
													: 'rgba(234, 179, 8, 0.9)',
										borderRadius: '1px',
										opacity: bpmPercentage !== null ? 0.95 : 1,
										zIndex: 5,
									}),
						}}
						animate={{
							...(isVertical
								? {
										height: bpmPercentage !== null ? `calc(200px * ${bpmPercentage / 100})` : '60px',
									}
								: {
										width: bpmPercentage !== null ? `${bpmPercentage}%` : '30%',
									}),
							...(bpmPercentage === null
								? {
										scale: [1, 1.05, 1],
									}
								: {}),
						}}
						transition={{
							...(bpmPercentage === null
								? {
										scale: {
											duration: 2,
											repeat: Infinity,
											ease: [0.4, 0, 0.6, 1],
										},
									}
								: {
										duration: 0.3,
										ease: [0.4, 0, 0.2, 1],
									}),
						}}
					/>
				)}
			</div>
		</div>
	);
};
