import { useMemo } from 'react';
import { useThemeStore } from '../store/themeStore';

/**
 * 테마에 따른 색상 값을 반환하는 커스텀 훅
 */
export const useThemeColors = () => {
	const theme = useThemeStore((state) => state.theme);
	const isDark = theme === 'dark';

	return useMemo(
		() => ({
			isDark,
			iconColor: isDark ? '#cbd5e1' : '#334155', // slate-300 : slate-700
			textSecondaryColor: isDark ? '#cbd5e1' : '#475569', // slate-300 : slate-600
			textMutedColor: isDark ? '#e2e8f0' : '#334155', // slate-200 : slate-700
			glassBackground: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.6)',
			glassBorder: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
			glassButtonBg: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.4)',
			glassButtonBgHover: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)',
			playButtonGradient: isDark
				? 'linear-gradient(to bottom right, #9333ea, #7e22ce)'
				: 'linear-gradient(to bottom right, #a855f7, #9333ea)',
			parameterPanelBg: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.6)',
			parameterButtonBg: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.4)',
		}),
		[isDark]
	);
};

