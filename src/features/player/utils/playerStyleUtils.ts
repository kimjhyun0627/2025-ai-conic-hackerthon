import type { ThemeColors } from '@/shared/hooks/useThemeColors';

/**
 * 파라미터 패널 스타일 생성
 */
export const getParameterPanelStyle = (colors: ThemeColors) => ({
	backdropFilter: 'blur(20px) saturate(180%)',
	WebkitBackdropFilter: 'blur(20px) saturate(180%)',
	background: colors.parameterPanelBg,
	borderColor: colors.glassBorder,
	padding: '0.75rem 0.75rem',
	position: 'absolute' as const,
	bottom: '100%',
	// 가로/세로 모드 모두 동일하게 컨트롤러 상단 전체를 덮도록 고정
	left: 0,
	right: 0,
	zIndex: 0,
});

/**
 * 공통 파라미터 버튼 패널 스타일 생성
 */
export const getCommonParamPanelStyle = (colors: ThemeColors) => ({
	background: colors.isDark ? 'rgba(28, 25, 23, 0.1)' : 'rgba(254, 248, 242, 0.2)',
	backdropFilter: 'blur(30px) saturate(200%)',
	WebkitBackdropFilter: 'blur(30px) saturate(200%)',
	border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.15)'}`,
	boxShadow: colors.isDark
		? 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.4), inset 0 1px 2px 0 rgba(0, 0, 0, 0.3), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)'
		: 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.15), inset 0 1px 2px 0 rgba(0, 0, 0, 0.1), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(31, 38, 135, 0.05)',
});

/**
 * 공통 파라미터 버튼 스타일 생성
 */
export const getCommonParamButtonStyle = (colors: ThemeColors) => ({
	background: colors.isDark ? 'rgba(28, 25, 23, 0.2)' : 'rgba(254, 248, 242, 0.2)',
	backdropFilter: 'blur(20px) saturate(180%)',
	WebkitBackdropFilter: 'blur(20px) saturate(180%)',
	border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)'}`,
	boxShadow: colors.isDark ? '0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)' : '0 4px 16px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
});
