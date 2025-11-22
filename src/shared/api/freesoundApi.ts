import axios, { AxiosError } from 'axios';

const FREESOUND_BASE_URL = '/api/freesound';
const SEARCH_FIELDS = 'id,name,previews,duration';
const DEFAULT_FILTER = 'duration:[100 TO 180]';

const freesoundClient = axios.create({
	baseURL: FREESOUND_BASE_URL,
	timeout: Number(import.meta.env.VITE_FREESOUND_TIMEOUT ?? 30000),
});

// API 요청 큐 시스템
type QueueItem<T> = {
	resolve: (value: T) => void;
	reject: (error: unknown) => void;
	execute: () => Promise<T>;
	signal?: AbortSignal;
};

class RequestQueue {
	private queue: QueueItem<unknown>[] = [];
	private isProcessing = false;

	async enqueue<T>(execute: () => Promise<T>, signal?: AbortSignal): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			// AbortSignal이 이미 abort된 경우 즉시 거부
			if (signal?.aborted) {
				reject(new DOMException('Operation aborted', 'AbortError'));
				return;
			}

			const queueItem: QueueItem<T> = {
				resolve,
				reject,
				execute,
				signal,
			};

			// AbortSignal 리스너 추가
			if (signal) {
				const onAbort = () => {
					const index = this.queue.indexOf(queueItem as QueueItem<unknown>);
					if (index !== -1) {
						this.queue.splice(index, 1);
						reject(new DOMException('Operation aborted', 'AbortError'));
					}
				};
				signal.addEventListener('abort', onAbort);
			}

			this.queue.push(queueItem as QueueItem<unknown>);
			this.processQueue();
		});
	}

	private async processQueue() {
		if (this.isProcessing || this.queue.length === 0) {
			return;
		}

		this.isProcessing = true;

		while (this.queue.length > 0) {
			const item = this.queue.shift();
			if (!item) {
				break;
			}

			// AbortSignal이 abort된 경우 건너뛰기
			if (item.signal?.aborted) {
				item.reject(new DOMException('Operation aborted', 'AbortError'));
				continue;
			}

			try {
				const result = await item.execute();
				item.resolve(result);
			} catch (error) {
				item.reject(error);
			}
		}

		this.isProcessing = false;
	}
}

const requestQueue = new RequestQueue();

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

interface FreesoundAnalysisResponse {
	rhythm?: {
		bpm?: {
			mean?: number;
			value?: number;
		};
	};
}

export interface FreesoundTrackPreview {
	id: string;
	title: string;
	previewUrl: string;
	duration: number;
	bpm: number | null;
}

const sanitizeQuery = (value: string) =>
	value
		.replace(/\[|\]|:/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const pickPreviewUrl = (previews: PreviewFormats) => previews['preview-hq-mp3'] || previews['preview-hq-ogg'] || previews['preview-lq-mp3'] || previews['preview-lq-ogg'] || null;

const fetchSoundBpm = async (soundId: number, signal?: AbortSignal) => {
	const { data } = await withRetry(
		() =>
			freesoundClient.get<FreesoundAnalysisResponse>(`/sounds/${soundId}/analysis/`, {
				params: { descriptors: 'rhythm.bpm' },
				signal,
			}),
		signal
	);

	const bpmValue = data?.rhythm?.bpm?.mean ?? data?.rhythm?.bpm?.value ?? null;
	return typeof bpmValue === 'number' ? Math.round(bpmValue) : null;
};

export const fetchFreesoundPreviewByGenre = async (genreName: string, signal?: AbortSignal): Promise<FreesoundTrackPreview> => {
	return requestQueue.enqueue(async () => {
		const query = sanitizeQuery(genreName + ' music');

		let response;
		try {
			response = await withRetry(
				() =>
					freesoundClient.get('/search/text/', {
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
			console.error('[FreeSound API] Request failed:', error);
			if (axios.isAxiosError(error)) {
				console.error('[FreeSound API] Response status:', error.response?.status);
				console.error('[FreeSound API] Response headers:', error.response?.headers);
				console.error('[FreeSound API] Response data type:', typeof error.response?.data);
				console.error('[FreeSound API] Response data:', error.response?.data);
			}
			throw error;
		}

		// 응답 상태 확인
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

		// 실제 데이터 추출 (타입 단언 사용)
		const data: unknown = response.data;

		// API 응답 검증 및 디버깅 로그
		if (!data) {
			console.error('[FreeSound API] No data in response:', { response, genreName, query });
			throw new Error('API 응답이 없습니다.');
		}

		// HTML 응답이 오는 경우 (프록시가 제대로 작동하지 않는 경우)
		if (typeof data === 'string' && data.trim().startsWith('<!')) {
			console.error('[FreeSound API] Received HTML instead of JSON:', {
				dataPreview: data.substring(0, 200),
				responseStatus: response.status,
				responseHeaders: response.headers,
				genreName,
				query,
			});
			throw new Error('API 프록시가 제대로 작동하지 않습니다. HTML 응답을 받았습니다.');
		}

		// data가 객체가 아닌 경우
		if (typeof data !== 'object' || data === null) {
			console.error('[FreeSound API] Invalid response data type:', {
				dataType: typeof data,
				data,
				genreName,
				query,
			});
			throw new Error('API 응답 형식이 올바르지 않습니다.');
		}

		// FreesoundSearchResponse 타입으로 캐스팅
		const searchResponse = data as FreesoundSearchResponse;

		// 응답 구조 로깅 (배포 환경 디버깅용)
		console.log('[FreeSound API] Response structure:', {
			hasData: !!searchResponse,
			hasResults: !!searchResponse.results,
			resultsType: typeof searchResponse.results,
			isArray: Array.isArray(searchResponse.results),
			resultsLength: Array.isArray(searchResponse.results) ? searchResponse.results.length : 'N/A',
			dataKeys: Object.keys(searchResponse),
			genreName,
			query,
		});

		// results가 없는 경우 - 다른 응답 구조일 수 있음
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

		if (!Array.isArray(searchResponse.results)) {
			console.error('[FreeSound API] Results is not an array:', {
				results: searchResponse.results,
				resultsType: typeof searchResponse.results,
				genreName,
				query,
			});
			throw new Error('검색 결과가 없습니다. (results가 배열이 아님)');
		}

		if (searchResponse.results.length === 0) {
			console.error('[FreeSound API] Results array is empty:', {
				data: searchResponse,
				genreName,
				query,
			});
			throw new Error('검색 결과가 없습니다. (결과 배열이 비어있음)');
		}

		// 검색 결과 중에서 랜덤하게 선택
		const randomIndex = Math.floor(Math.random() * searchResponse.results.length);
		const selectedResult = searchResponse.results[randomIndex];

		if (!selectedResult) {
			throw new Error('선택된 검색 결과가 없습니다.');
		}

		const previewUrl = pickPreviewUrl(selectedResult.previews);

		if (!previewUrl) {
			throw new Error('사용 가능한 미리듣기 URL이 없습니다.');
		}

		const bpm = await fetchSoundBpm(selectedResult.id, signal);

		return {
			id: String(selectedResult.id),
			title: selectedResult.name,
			previewUrl,
			duration: Math.round(selectedResult.duration),
			bpm,
		};
	}, signal);
};
