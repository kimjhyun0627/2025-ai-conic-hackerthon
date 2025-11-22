import axios, { AxiosError } from 'axios';

const FREESOUND_BASE_URL = '/api/freesound';
const SEARCH_FIELDS = 'id,name,previews,duration';
const DEFAULT_FILTER = 'duration:[100 TO 180]';

const freesoundClient = axios.create({
	baseURL: FREESOUND_BASE_URL,
	timeout: Number(import.meta.env.VITE_FREESOUND_TIMEOUT ?? 30000),
});

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
	const query = sanitizeQuery(genreName + ' music');

	const { data } = await withRetry(
		() =>
			freesoundClient.get<FreesoundSearchResponse>('/search/text/', {
				params: {
					query,
					fields: SEARCH_FIELDS,
					filter: DEFAULT_FILTER,
					page_size: 10,
					sort: 'rating_desc',
				},
				signal,
			}),
		signal
	);

	if (!data.results.length) {
		throw new Error('검색 결과가 없습니다.');
	}

	// 검색 결과 중에서 랜덤하게 선택
	const randomIndex = Math.floor(Math.random() * data.results.length);
	const selectedResult = data.results[randomIndex];
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
};
