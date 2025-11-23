import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { RequestQueue } from '@/shared/audio';
import type { MusicGenre } from '../types';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const DEFAULT_MUSIC_LENGTH_MS = 120000; // 120초 (2분) - 3000ms~300000ms 범위

if (!ELEVENLABS_API_KEY) {
	console.warn('[ElevenLabs API] API key not found. Please set VITE_ELEVENLABS_API_KEY in .env file');
}

const client = new ElevenLabsClient({
	apiKey: ELEVENLABS_API_KEY,
});

const requestQueue = new RequestQueue();

export interface ElevenLabsTrackPreview {
	id: string;
	title: string;
	audioUrl: string;
	duration: number;
}

/**
 * 카테고리별 음악 분위기를 정의합니다.
 */
const CATEGORY_MOODS: Record<string, string> = {
	focus: 'calm, focused, ambient, peaceful, concentration-enhancing',
	energy: 'energetic, upbeat, dynamic, powerful, exciting',
	relax: 'relaxing, peaceful, soothing, gentle, tranquil',
	mood: 'emotional, atmospheric, expressive, evocative',
	workout: 'intense, motivating, powerful, driving, pumping',
};

/**
 * MusicGenre 정보를 바탕으로 상세한 프롬프트를 생성합니다.
 */
const buildMusicPrompt = (genre: MusicGenre): string => {
	const parts: string[] = [];

	// 1. 장르명
	parts.push(`${genre.name} music`);

	// 2. 카테고리 기반 분위기
	const mood = CATEGORY_MOODS[genre.category];
	if (mood) {
		parts.push(mood);
	}

	// 3. 설명 (있는 경우)
	if (genre.description) {
		parts.push(genre.description);
	}

	// 4. 기본 특성
	parts.push('instrumental background, high quality production');

	return parts.join(', ');
};

/**
 * ReadableStream을 Blob으로 변환합니다.
 */
const streamToBlob = async (stream: ReadableStream<Uint8Array>): Promise<Blob> => {
	const reader = stream.getReader();
	const chunks: BlobPart[] = [];

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			// ArrayBufferLike를 ArrayBuffer로 변환
			if (value) {
				const buffer = new ArrayBuffer(value.byteLength);
				const view = new Uint8Array(buffer);
				view.set(value);
				chunks.push(view);
			}
		}
	} finally {
		reader.releaseLock();
	}

	return new Blob(chunks, { type: 'audio/mpeg' });
};

/**
 * ElevenLabs Music API를 사용하여 장르에 맞는 음악을 생성합니다.
 */
export const generateSoundByGenre = async (genre: MusicGenre, signal?: AbortSignal): Promise<ElevenLabsTrackPreview> => {
	return requestQueue.enqueue(async () => {
		if (!ELEVENLABS_API_KEY) {
			throw new Error('ElevenLabs API key is not configured. Please set VITE_ELEVENLABS_API_KEY in .env file');
		}

		try {
			// 장르 기반 상세 프롬프트 생성
			const prompt = buildMusicPrompt(genre);

			console.log('[ElevenLabs API] Generating music with prompt:', prompt);

			// API 요청 - Music API 사용
			const generatePromise = client.music.compose({
				prompt,
				musicLengthMs: DEFAULT_MUSIC_LENGTH_MS,
				forceInstrumental: true, // 악기만 사용
			});

			// AbortSignal 처리
			let audioStream: ReadableStream<Uint8Array>;
			if (signal) {
				const abortPromise = new Promise<never>((_, reject) => {
					if (signal.aborted) {
						reject(new DOMException('Operation aborted', 'AbortError'));
					}
					signal.addEventListener('abort', () => {
						reject(new DOMException('Operation aborted', 'AbortError'));
					});
				});

				audioStream = await Promise.race([generatePromise, abortPromise]);
			} else {
				audioStream = await generatePromise;
			}

			// Stream을 Blob으로 변환
			const audioBlob = await streamToBlob(audioStream);
			const audioUrl = URL.createObjectURL(audioBlob);

			console.log('[ElevenLabs API] Music generated successfully');

			return {
				id: `elevenlabs-${Date.now()}`,
				title: `AI Generated ${genre.nameKo}`,
				audioUrl,
				duration: DEFAULT_MUSIC_LENGTH_MS / 1000, // ms를 초로 변환
			};
		} catch (error) {
			console.error('[ElevenLabs API] Failed to generate music:', error);
			throw new Error(`Failed to generate music: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}, signal);
};
