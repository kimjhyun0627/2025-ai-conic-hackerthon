import type { ThemeColors } from '../hooks/useThemeColors';

/**
 * 파라미터 패널 스타일 생성
 */
export const getParameterPanelStyle = (colors: ThemeColors) => ({
	backdropFilter: 'blur(20px) saturate(180%)',
	WebkitBackdropFilter: 'blur(20px) saturate(180%)',
	background: colors.parameterPanelBg,
	borderColor: colors.glassBorder,
	padding: '1rem 1.5rem',
	position: 'absolute' as const,
	bottom: '100%',
	left: 0,
	right: 0,
	zIndex: 0,
});

/**
 * 공통 파라미터 버튼 패널 스타일 생성
 */
export const getCommonParamPanelStyle = (colors: ThemeColors) => ({
	background: colors.isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)',
	backdropFilter: 'blur(30px) saturate(200%)',
	WebkitBackdropFilter: 'blur(30px) saturate(200%)',
	border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.5)'}`,
	boxShadow: colors.isDark
		? 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.4), inset 0 1px 2px 0 rgba(0, 0, 0, 0.3), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)'
		: 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.15), inset 0 1px 2px 0 rgba(0, 0, 0, 0.1), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(31, 38, 135, 0.05)',
});

/**
 * 공통 파라미터 버튼 스타일 생성
 */
export const getCommonParamButtonStyle = (colors: ThemeColors) => ({
	background: colors.isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.6)',
	backdropFilter: 'blur(20px) saturate(180%)',
	WebkitBackdropFilter: 'blur(20px) saturate(180%)',
	border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)'}`,
	boxShadow: colors.isDark ? '0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)' : '0 4px 16px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
});
