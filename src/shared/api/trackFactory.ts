import type { MusicGenre, Track } from '@/shared/types';
import { fetchFreesoundPreviewByGenre } from './freesoundApi';

export const fetchTrackForGenre = async (genre: MusicGenre, signal?: AbortSignal): Promise<Track> => {
	const preview = await fetchFreesoundPreviewByGenre(genre.name, signal);
	// const tempo = DEFAULT_AUDIO_PARAMS.tempo;

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
