// 레코드판 컴포넌트 관련 상수
export const RECORD_PLAYER_CONSTANTS = {
	// 크기
	SIZE: {
		WIDTH: 'min(280px, 80vw)',
		HEIGHT: 'min(280px, 80vw)',
		MIN_WIDTH: '200px',
		MIN_HEIGHT: '200px',
		PADDING: '6px',
		LABEL_SIZE: '28%',
		HOLE_SIZE: '10%',
	},

	// 그라데이션 색상
	GRADIENT: {
		BORDER: `conic-gradient(from 0deg, rgba(255, 255, 255, 0.25) 0deg, rgba(255, 255, 255, 0.15) 60deg, rgba(0, 0, 0, 0.4) 120deg, rgba(0, 0, 0, 0.5) 180deg, rgba(0, 0, 0, 0.4) 240deg, rgba(255, 255, 255, 0.15) 300deg, rgba(255, 255, 255, 0.25) 360deg)`,
		RADIAL_STOPS: [
			{ offset: '20%', color: 'transparent' },
			{ offset: '22%', color: 'rgba(0, 0, 0, 0.3)' },
			{ offset: '24%', color: 'transparent' },
			{ offset: '28%', color: 'transparent' },
			{ offset: '30%', color: 'rgba(0, 0, 0, 0.25)' },
			{ offset: '32%', color: 'transparent' },
			{ offset: '36%', color: 'transparent' },
			{ offset: '38%', color: 'rgba(0, 0, 0, 0.25)' },
			{ offset: '40%', color: 'transparent' },
			{ offset: '44%', color: 'transparent' },
			{ offset: '46%', color: 'rgba(0, 0, 0, 0.25)' },
			{ offset: '48%', color: 'transparent' },
			{ offset: '52%', color: 'transparent' },
			{ offset: '54%', color: 'rgba(0, 0, 0, 0.25)' },
			{ offset: '56%', color: 'transparent' },
			{ offset: '60%', color: 'transparent' },
			{ offset: '62%', color: 'rgba(0, 0, 0, 0.25)' },
			{ offset: '64%', color: 'transparent' },
			{ offset: '68%', color: 'transparent' },
			{ offset: '70%', color: 'rgba(0, 0, 0, 0.25)' },
			{ offset: '72%', color: 'transparent' },
			{ offset: '76%', color: 'transparent' },
			{ offset: '78%', color: 'rgba(0, 0, 0, 0.25)' },
			{ offset: '80%', color: 'transparent' },
			{ offset: '84%', color: 'transparent' },
			{ offset: '86%', color: 'rgba(0, 0, 0, 0.25)' },
			{ offset: '88%', color: 'transparent' },
		],
		CONIC_COLORS: [
			{ deg: 0, color: 'rgba(255, 255, 255, 0.08)' },
			{ deg: 1, color: 'rgba(255, 255, 255, 0.12)' },
			{ deg: 2, color: 'rgba(0, 0, 0, 0.15)' },
			{ deg: 3, color: 'rgba(0, 0, 0, 0.15)' },
			{ deg: 4, color: 'rgba(255, 255, 255, 0.08)' },
			{ deg: 5, color: 'rgba(255, 255, 255, 0.12)' },
			{ deg: 6, color: 'rgba(0, 0, 0, 0.15)' },
			{ deg: 7, color: 'rgba(0, 0, 0, 0.15)' },
			{ deg: 8, color: 'rgba(255, 255, 255, 0.08)' },
		],
		MASK: 'radial-gradient(circle, transparent 20%, black 22%, black 88%, transparent 90%)',
	},

	// 색상
	COLORS: {
		LABEL_BG: 'rgba(255, 255, 255, 0.95)',
		HOLE_BG: 'rgba(0, 0, 0, 0.95)',
		LABEL_SHADOW: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
		HOLE_SHADOW: 'inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(255, 255, 255, 0.1)',
	},
} as const;

// 레코드판 그라데이션 생성 함수
export const generateRecordGradients = () => {
	const radialStops = RECORD_PLAYER_CONSTANTS.GRADIENT.RADIAL_STOPS.map((stop) => `${stop.color} ${stop.offset}`).join(', ');

	const conicStops = RECORD_PLAYER_CONSTANTS.GRADIENT.CONIC_COLORS.map((color) => `${color.color} ${color.deg}deg`).join(', ');

	return {
		radial: `radial-gradient(circle at center, ${radialStops})`,
		conic: `repeating-conic-gradient(from 0deg at center, ${conicStops})`,
	};
};
