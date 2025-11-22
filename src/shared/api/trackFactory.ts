import { DEFAULT_AUDIO_PARAMS } from '@/shared/constants';
import type { MusicGenre, Track } from '@/shared/types';
import { fetchFreesoundPreviewByGenre } from './freesoundApi';

export const fetchTrackForGenre = async (genre: MusicGenre, signal?: AbortSignal): Promise<Track> => {
	const preview = await fetchFreesoundPreviewByGenre(genre.name, signal);
	const tempo = preview.bpm ?? DEFAULT_AUDIO_PARAMS.tempo;

	return {
		id: `freesound-${preview.id}-${Date.now()}`,
		title: preview.title || genre.name,
		genre: genre.name,
		genreKo: genre.nameKo,
		audioUrl: preview.previewUrl,
		duration: preview.duration,
		status: 'ready',
		params: {
			energy: DEFAULT_AUDIO_PARAMS.energy,
			bass: DEFAULT_AUDIO_PARAMS.bass,
			tempo: Math.max(45, Math.min(200, Math.round(tempo))),
		},
		createdAt: new Date(),
	};
};
