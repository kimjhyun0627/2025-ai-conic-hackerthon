/**
 * 현재 시간을 가져옵니다.
 */
export const getCurrentHour = (): number => {
  return new Date().getHours();
};

/**
 * 시간대별 인사말을 반환합니다.
 * - 아침 (06:00-11:59): "상쾌한 아침이네요!"
 * - 오후 (12:00-17:59): "활기찬 오후 보내고 계신가요?"
 * - 저녁 (18:00-21:59): "편안한 저녁 되세요!"
 * - 밤 (22:00-05:59): "좋은 밤이네요!"
 */
export const getTimeGreeting = (): string => {
  const hour = getCurrentHour();

  if (hour >= 6 && hour < 12) {
    return '상쾌한 아침이네요!';
  } else if (hour >= 12 && hour < 18) {
    return '활기찬 오후 보내고 계신가요?';
  } else if (hour >= 18 && hour < 22) {
    return '편안한 저녁 되세요!';
  } else {
    return '좋은 밤이네요!';
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
