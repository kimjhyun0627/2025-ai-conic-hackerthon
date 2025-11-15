import { useMemo } from 'react';
import { useThemeColors } from './useThemeColors';

/**
 * Glass 버튼 스타일과 이벤트 핸들러를 제공하는 커스텀 훅
 */
export const useGlassButton = () => {
	const colors = useThemeColors();

	const buttonStyle = useMemo(
		() => ({
			background: colors.glassButtonBg,
			borderColor: colors.glassBorder,
		}),
		[colors]
	);

	const buttonHoverStyle = useMemo(
		() => ({
			background: colors.glassButtonBgHover,
		}),
		[colors]
	);

	const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
		Object.assign(e.currentTarget.style, buttonHoverStyle);
	};

	const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
		Object.assign(e.currentTarget.style, buttonStyle);
	};

	return {
		buttonStyle,
		buttonHoverStyle,
		handleMouseEnter,
		handleMouseLeave,
	};
};
