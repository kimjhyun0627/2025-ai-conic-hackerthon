import axios from 'axios';

/**
 * 에러가 취소된 요청(AbortError 또는 axios CanceledError)인지 확인하는 유틸리티 함수
 * @param error 확인할 에러 객체
 * @returns 취소된 요청이면 true, 아니면 false
 */
export const isCancelError = (error: unknown): boolean => {
	// DOMException의 AbortError 확인
	if (error instanceof DOMException && error.name === 'AbortError') {
		return true;
	}

	// axios의 CanceledError 확인
	if (axios.isCancel(error)) {
		return true;
	}

	return false;
};
