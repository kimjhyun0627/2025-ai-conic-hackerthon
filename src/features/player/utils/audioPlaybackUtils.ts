/**
 * Audio 재생 관련 유틸리티 함수
 */

/**
 * audio 요소가 재생 가능한 상태인지 확인
 */
export const isAudioReady = (audio: HTMLAudioElement): boolean => {
	return audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
};

/**
 * audio 요소를 안전하게 재생 (canplay 이벤트 대기)
 */
export const playAudioSafely = (audio: HTMLAudioElement, onError: () => void): void => {
	const handleCanPlay = () => {
		audio.play().catch(() => {
			onError();
		});
	};

	if (isAudioReady(audio)) {
		// 이미 로드된 경우 즉시 재생
		handleCanPlay();
	} else {
		// 로드 완료 대기
		audio.addEventListener('canplay', handleCanPlay, { once: true });
	}
};
