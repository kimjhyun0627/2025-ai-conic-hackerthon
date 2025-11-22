import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/themeStore';
import { useThemeColors } from '@/shared/hooks';
import type { VisualizationModeOption } from '../../types/visualization';

interface VisualizationModeItemProps {
	mode: VisualizationModeOption;
	isSelected: boolean;
	isHovered: boolean;
	onClick: () => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}

const PRIMARY_COLOR = '#fb7185'; // primary-500
const PRIMARY_COLOR_OPACITY = 'rgba(251, 113, 133, 0.8)';
const PRIMARY_COLOR_BORDER = 'rgba(251, 113, 133, 0.5)';

/**
 * 비주얼 모드 드롭다운 아이템 컴포넌트
 */
export const VisualizationModeItem = ({ mode, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave }: VisualizationModeItemProps) => {
	const theme = useThemeStore((state) => state.theme);
	const colors = useThemeColors();
	const IconComponent = mode.icon;

	const isActive = isSelected || isHovered;
	const iconColor = isActive ? PRIMARY_COLOR : colors.isDark ? '#f1f5f9' : '#0f172a';
	const textColor = isActive ? PRIMARY_COLOR : theme === 'dark' ? '#f1f5f9' : '#0f172a';
	const descriptionColor = isActive ? PRIMARY_COLOR_OPACITY : colors.textSecondaryColor;

	return (
		<motion.button
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 last:mb-0 transition-all ${
				isSelected ? 'bg-primary-500/20 border-2' : 'hover:bg-white/10 dark:hover:bg-white/5 border-2 border-transparent'
			}`}
			style={isSelected ? { borderColor: PRIMARY_COLOR_BORDER } : undefined}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
		>
			{/* 아이콘 */}
			<div
				className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
				style={{
					background: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
				}}
			>
				<IconComponent
					className="w-5 h-5"
					style={{ color: iconColor }}
				/>
			</div>

			{/* 모드 정보 */}
			<div className="flex-1 text-left min-w-0">
				<div
					className="font-semibold text-base mb-1 truncate"
					style={{ color: textColor }}
				>
					{mode.name}
				</div>
				{mode.description && (
					<div
						className="text-sm line-clamp-2"
						style={{ color: descriptionColor }}
					>
						{mode.description}
					</div>
				)}
			</div>
		</motion.button>
	);
};
