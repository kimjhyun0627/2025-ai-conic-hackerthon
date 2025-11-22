import { useMemo } from 'react';
import { useThemeColors } from '@/shared/hooks';

/**
 * 프라이머리 컬러 팔레트 커스텀 훅
 * - 다크 모드: 밝은 프라이머리 컬러 (primary-400, primary-300, primary-100)
 * - 라이트 모드: 어두운 프라이머리 컬러 (primary-500, primary-600, primary-700)
 */
export const usePrimaryPalette = () => {
	const colors = useThemeColors();

	const palette = useMemo(() => {
		if (colors.isDark) {
			// 다크 모드: 밝은 색상 (배경이 어두우므로 밝은 색이 잘 보임)
			return ['#fb7185', '#fca5a5', '#fee2e2']; // primary-400, primary-300, primary-100
		} else {
			// 라이트 모드: 어두운 색상 (배경이 밝으므로 어두운 색이 잘 보임)
			return ['#fb7185', '#f43f5e', '#e11d48']; // primary-500, primary-600, primary-700
		}
	}, [colors.isDark]);

	return palette;
};
