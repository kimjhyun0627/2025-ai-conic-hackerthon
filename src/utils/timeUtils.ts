/**
 * 현재 시간을 가져옵니다.
 */
export const getCurrentHour = (): number => {
	return new Date().getHours();
};

/**
 * 시간대별 인사말을 반환합니다.
 * - 새벽 (00:00-05:59): 새벽 인사
 * - 이른 아침 (06:00-08:59): 이른 아침 인사
 * - 아침 (09:00-11:59): 아침 인사
 * - 점심 (12:00-13:59): 점심 인사
 * - 오후 (14:00-17:59): 오후 인사
 * - 저녁 (18:00-20:59): 저녁 인사
 * - 밤 (21:00-23:59): 밤 인사
 */
export const getTimeGreeting = (): string => {
	const hour = getCurrentHour();

	if (hour >= 0 && hour < 6) {
		// 새벽 (0-5시)
		return '새벽을 지키고 계시네요!';
	} else if (hour >= 6 && hour < 9) {
		// 이른 아침 (6-8시)
		return '상쾌한 이른 아침이에요!';
	} else if (hour >= 9 && hour < 12) {
		// 아침 (9-11시)
		return '좋은 아침이에요!';
	} else if (hour >= 12 && hour < 14) {
		// 점심 (12-13시)
		return '점심 맛있게 드셨나요?';
	} else if (hour >= 14 && hour < 18) {
		// 오후 (14-17시)
		return '활기찬 오후 보내고 계신가요?';
	} else if (hour >= 18 && hour < 21) {
		// 저녁 (18-20시)
		return '편안한 저녁 보내고 계신가요?';
	} else {
		// 밤 (21-23시)
		return '몰입하기 좋은 밤이네요!';
	}
};

/**
 * 시간을 포맷팅합니다 (mm:ss)
 */
export const formatTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 시간을 포맷팅합니다 (hh:mm:ss)
 */
export const formatTimeWithHours = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 퍼센트를 계산합니다
 */
export const calculatePercentage = (current: number, total: number): number => {
	if (total === 0) return 0;
	return (current / total) * 100;
};
