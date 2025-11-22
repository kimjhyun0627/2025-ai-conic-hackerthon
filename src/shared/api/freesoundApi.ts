import axios, { AxiosError } from 'axios';
import { isCancelError } from '@/shared/utils';
import { RequestQueue } from '@/shared/audio';

const FREESOUND_BASE_URL = '/api/freesound';
const SEARCH_FIELDS = 'id,name,previews,duration';
const DEFAULT_FILTER = 'duration:[100 TO 180]';

const freesoundClient = axios.create({
	baseURL: FREESOUND_BASE_URL,
	timeout: Number(import.meta.env.VITE_FREESOUND_TIMEOUT ?? 30000),
});

const requestQueue = new RequestQueue();

// 재시도 설정
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 600;

const wait = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		const onAbort = () => {
			clearTimeout(timeoutId);
			signal?.removeEventListener('abort', onAbort);
			reject(new DOMException('Operation aborted', 'AbortError'));
		};

		const timeoutId = setTimeout(() => {
			signal?.removeEventListener('abort', onAbort);
			resolve();
		}, ms);

		if (signal) {
			signal.addEventListener('abort', onAbort);
		}
	});

const isRetryableError = (error: unknown) => {
	if (!axios.isAxiosError(error)) {
		return false;
	}

	if (error.code === 'ECONNABORTED') {
		return true;
	}

	const status = error.response?.status;

	// 배포 환경 디버깅: 4xx 에러도 로깅
	if (status && status >= 400 && status < 500) {
		console.error('[FreeSound API] Client error:', {
			status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			url: error.config?.url,
		});
	}

	return typeof status === 'number' && RETRYABLE_STATUS.has(status);
};

const withRetry = async <T>(fn: () => Promise<T>, signal?: AbortSignal): Promise<T> => {
	let lastError: unknown;

	for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
		try {
			if (signal?.aborted) {
				throw new DOMException('Operation aborted', 'AbortError');
			}
			return await fn();
		} catch (error) {
			lastError = error;

			if (signal?.aborted || !isRetryableError(error) || attempt === MAX_RETRY_ATTEMPTS) {
				throw error;
			}

			const backoffDelay = RETRY_BASE_DELAY * attempt;
			await wait(backoffDelay, signal);
		}
	}

	throw lastError instanceof Error ? lastError : new AxiosError('Retry attempts exhausted');
};

// 타입 정의
type PreviewFormats = Partial<Record<'preview-hq-mp3' | 'preview-lq-mp3' | 'preview-hq-ogg' | 'preview-lq-ogg', string>>;

interface FreesoundSearchResult {
	id: number;
	name: string;
	duration: number;
	previews: PreviewFormats;
}

interface FreesoundSearchResponse {
	results: FreesoundSearchResult[];
}

export interface FreesoundTrackPreview {
	id: string;
	title: string;
	previewUrl: string;
	duration: number;
}

// 유틸리티 함수
const sanitizeQuery = (value: string) =>
	value
		.replace(/\[|\]|:/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const pickPreviewUrl = (previews: PreviewFormats): string | null => {
	return previews['preview-hq-mp3'] || previews['preview-hq-ogg'] || previews['preview-lq-mp3'] || previews['preview-lq-ogg'] || null;
};

// 응답 검증 및 에러 처리
const validateResponse = (data: unknown, genreName: string, query: string): FreesoundSearchResponse => {
	// 1. 데이터 존재 확인
	if (!data) {
		console.error('[FreeSound API] No data in response:', { data, genreName, query });
		throw new Error('API 응답이 없습니다.');
	}

	// 2. HTML 응답 체크 (프록시 문제)
	if (typeof data === 'string' && data.trim().startsWith('<!')) {
		console.error('[FreeSound API] Received HTML instead of JSON:', {
			dataPreview: data.substring(0, 200),
			genreName,
			query,
		});
		throw new Error('API 프록시가 제대로 작동하지 않습니다. HTML 응답을 받았습니다.');
	}

	// 3. 객체 타입 확인
	if (typeof data !== 'object' || data === null) {
		console.error('[FreeSound API] Invalid response data type:', {
			dataType: typeof data,
			data,
			genreName,
			query,
		});
		throw new Error('API 응답 형식이 올바르지 않습니다.');
	}

	const searchResponse = data as FreesoundSearchResponse;

	// 4. results 속성 확인
	if (!searchResponse.results) {
		console.error('[FreeSound API] No results property in response:', {
			data: searchResponse,
			dataStringified: JSON.stringify(searchResponse, null, 2),
			genreName,
			query,
		});

		// 다른 가능한 응답 구조 확인
		if ('count' in searchResponse && typeof (searchResponse as Record<string, unknown>).count === 'number') {
			console.warn('[FreeSound API] Response has count but no results:', searchResponse);
		}

		throw new Error('검색 결과가 없습니다. (응답에 results가 없음)');
	}

	// 5. results가 배열인지 확인
	if (!Array.isArray(searchResponse.results)) {
		console.error('[FreeSound API] Results is not an array:', {
			results: searchResponse.results,
			resultsType: typeof searchResponse.results,
			genreName,
			query,
		});
		throw new Error('검색 결과가 없습니다. (results가 배열이 아님)');
	}

	// 6. results 배열이 비어있지 않은지 확인
	if (searchResponse.results.length === 0) {
		console.error('[FreeSound API] Results array is empty:', {
			data: searchResponse,
			genreName,
			query,
		});
		throw new Error('검색 결과가 없습니다. (결과 배열이 비어있음)');
	}

	return searchResponse;
};

const logResponseStructure = (_searchResponse: FreesoundSearchResponse, _genreName: string, _query: string) => {
	// Response structure logging removed
};

const selectRandomTrack = (results: FreesoundSearchResult[]): FreesoundSearchResult => {
	const randomIndex = Math.floor(Math.random() * results.length);
	const selectedResult = results[randomIndex];

	if (!selectedResult) {
		throw new Error('선택된 검색 결과가 없습니다.');
	}

	return selectedResult;
};

const createTrackPreview = (result: FreesoundSearchResult): FreesoundTrackPreview => {
	const previewUrl = pickPreviewUrl(result.previews);

	if (!previewUrl) {
		throw new Error('사용 가능한 미리듣기 URL이 없습니다.');
	}

	return {
		id: String(result.id),
		title: result.name,
		previewUrl,
		duration: Math.round(result.duration),
	};
};

const executeSearchRequest = async (query: string, signal?: AbortSignal) => {
	const searchPath = import.meta.env.DEV ? '/search/text/' : '/search';

	try {
		return await withRetry(
			() =>
				freesoundClient.get<unknown>(searchPath, {
					params: {
						query,
						fields: SEARCH_FIELDS,
						filter: DEFAULT_FILTER,
						page_size: 10,
						sort: 'rating_desc',
					},
					signal,
					responseType: 'json',
					validateStatus: (status) => status < 500, // 5xx만 재시도
				}),
			signal
		);
	} catch (error) {
		// 취소된 요청은 로깅하지 않음
		if (isCancelError(error)) {
			throw error;
		}

		console.error('[FreeSound API] Request failed:', error);
		if (axios.isAxiosError(error)) {
			console.error('[FreeSound API] Response status:', error.response?.status);
			console.error('[FreeSound API] Response headers:', error.response?.headers);
			console.error('[FreeSound API] Response data type:', typeof error.response?.data);
			console.error('[FreeSound API] Response data:', error.response?.data);
		}
		throw error;
	}
};

/**
 * 장르 이름으로 FreeSound API에서 트랙을 검색하고 랜덤하게 하나를 선택합니다.
 */
export const fetchFreesoundPreviewByGenre = async (genreName: string, signal?: AbortSignal): Promise<FreesoundTrackPreview> => {
	return requestQueue.enqueue(async () => {
		const query = sanitizeQuery(genreName + ' music');

		// 1. API 요청 실행
		const response = await executeSearchRequest(query, signal);

		// 2. HTTP 상태 코드 확인
		if (response.status >= 400) {
			console.error('[FreeSound API] HTTP error:', {
				status: response.status,
				statusText: response.statusText,
				data: response.data,
				headers: response.headers,
				genreName,
				query,
			});
			throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
		}

		// 3. 응답 데이터 검증
		const searchResponse = validateResponse(response.data, genreName, query);

		// 4. 응답 구조 로깅 (배포 환경 디버깅용)
		logResponseStructure(searchResponse, genreName, query);

		// 5. 랜덤 트랙 선택
		const selectedResult = selectRandomTrack(searchResponse.results);

		// 6. 트랙 프리뷰 생성
		return createTrackPreview(selectedResult);
	}, signal);
};
