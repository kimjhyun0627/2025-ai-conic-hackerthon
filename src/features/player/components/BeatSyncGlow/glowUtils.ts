import type { ThemeCategory } from '@/shared/types';

/**
 * 프라이머리 컬러 (플레이어 버튼과 동일)
 * #fb7185 (rgba(251, 113, 133, 1.0))
 */
const PRIMARY_COLOR = 'rgba(251, 113, 133, 1.0)'; // 프라이머리 컬러 (#fb7185)

/**
 * 글로우 스타일 계산 함수 (컨테이너에 직접 적용하기 위해)
 * intensity와 비트(beatDetected)에 반응
 */
export const getGlowStyle = (_category: ThemeCategory, intensity: number, beatDetected: boolean) => {
	const primaryColor = PRIMARY_COLOR;

	// intensity 값 보정 (NaN이나 음수 방지)
	const safeIntensity = Math.max(0, Math.min(1, intensity || 0));

	// 블러 계산 (최소 1vh ~ 최대 12vh)
	// intensity에 따라 1vh ~ 9vh, 비트 시 +0vh (임시)
	// 최소값을 1vh로 설정하여 항상 조금은 보이도록
	const baseBlur = 1 + safeIntensity * 8; // 1vh ~ 9vh
	const blurVh = baseBlur; // 비트 시 +0vh (임시)

	// 그림자 투명도 계산 (최소 0.15 ~ 최대 1.0)
	// intensity에 따라 0.15 ~ 0.7, 비트 시 +0.3
	// 최소값을 0.15로 설정하여 항상 조금은 보이도록
	const baseOpacity = 0.15 + safeIntensity * 0.55; // 0.15 ~ 0.7
	const shadowOpacity = Math.min(baseOpacity + (beatDetected ? 0.3 : 0), 1.0); // 비트 시 +0.3 (최대 1.0)

	// 투명도가 적용된 색상 (rgba에서 마지막 숫자를 교체)
	const colorWithOpacity = primaryColor.replace(/[\d.]+\)$/g, `${shadowOpacity})`);

	return {
		boxShadow: `
			0 0 ${blurVh * 1.5}vh ${colorWithOpacity},
			0 0 ${blurVh * 2.5}vh ${colorWithOpacity},
			0 0 ${blurVh * 4}vh ${colorWithOpacity},
			0 0 ${blurVh * 6}vh ${colorWithOpacity},
			0 0 ${blurVh * 8}vh ${colorWithOpacity}
		`,
	};
};
