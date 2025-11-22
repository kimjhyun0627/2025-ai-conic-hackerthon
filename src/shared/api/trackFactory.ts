import type { MusicGenre, Track } from '@/shared/types';
import { fetchFreesoundPreviewByGenre } from './freesoundApi';

export const fetchTrackForGenre = async (genre: MusicGenre, signal?: AbortSignal, activeParams?: Record<string, number>): Promise<Track> => {
	// 활성화된 파라미터들을 API body로 전송할 데이터로 구성
	if (activeParams) {
		const params = {
			genre: genre.name,
			genreId: genre.id,
			parameters: activeParams,
		};
		console.log(JSON.stringify(params, null, 2));
		console.log(`📊 Active parameters count: ${Object.keys(activeParams).length}`);
	}

	const preview = await fetchFreesoundPreviewByGenre(genre.name, signal);

	return {
		id: `freesound-${preview.id}-${Date.now()}`,
		title: preview.title || genre.name,
		genre: genre.name,
		genreKo: genre.nameKo,
		audioUrl: preview.previewUrl,
		duration: preview.duration,
		status: 'ready',
		createdAt: new Date(),
	};
};
