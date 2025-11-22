import type { ThemeCategory, MusicGenre } from '@/shared/types';

/**
 * 테마/장르별 샘플 오디오 URL 매핑
 *
 * 샘플 오디오 파일은 public/samples/ 폴더에 저장되어야 합니다.
 * 파일명 형식: {category}_{genreId}.mp3 또는 {category}.mp3
 *
 * 예시:
 * - public/samples/focus_lofi-beats.mp3
 * - public/samples/focus_ambient.mp3
 * - public/samples/focus.mp3 (테마 전체 샘플)
 */
export const SAMPLE_AUDIO_URLS: Record<string, string> = {
	// Focus 테마 샘플
	focus: '/samples/focus.mp3',
	'focus_lofi-beats': '/samples/focus_lofi-beats.mp3',
	'focus_jazz-instrumental': '/samples/focus_jazz-instrumental.mp3',
	focus_ambient: '/samples/focus_ambient.mp3',
	'focus_classic-piano': '/samples/focus_classic-piano.mp3',

	// Energy 테마 샘플
	energy: '/samples/energy.mp3',
	energy_edm: '/samples/energy_edm.mp3',
	energy_house: '/samples/energy_house.mp3',
	energy_techno: '/samples/energy_techno.mp3',
	'energy_drum-bass': '/samples/energy_drum-bass.mp3',

	// Relax 테마 샘플
	relax: '/samples/relax.mp3',
	relax_downtempo: '/samples/relax_downtempo.mp3',
	relax_chillwave: '/samples/relax_chillwave.mp3',
	'relax_nature-ambient': '/samples/relax_nature-ambient.mp3',
	relax_meditation: '/samples/relax_meditation.mp3',

	// Mood 테마 샘플
	mood: '/samples/mood.mp3',
	'mood_future-bass': '/samples/mood_future-bass.mp3',
	mood_alternative: '/samples/mood_alternative.mp3',
	mood_synthwave: '/samples/mood_synthwave.mp3',
	'mood_trip-hop': '/samples/mood_trip-hop.mp3',

	// Workout 테마 샘플
	workout: '/samples/workout.mp3',
	workout_trap: '/samples/workout_trap.mp3',
	workout_hardstyle: '/samples/workout_hardstyle.mp3',
	'workout_hiphop-beats': '/samples/workout_hiphop-beats.mp3',
};

/**
 * 테마 카테고리로 샘플 오디오 URL 가져오기
 */
export const getSampleAudioUrlByCategory = (category: ThemeCategory): string | null => {
	return SAMPLE_AUDIO_URLS[category] || null;
};

/**
 * 장르로 샘플 오디오 URL 가져오기
 */
export const getSampleAudioUrlByGenre = (genre: MusicGenre): string | null => {
	const key = `${genre.category}_${genre.id}`;
	return SAMPLE_AUDIO_URLS[key] || SAMPLE_AUDIO_URLS[genre.category] || null;
};

/**
 * 테마 카테고리 또는 장르 ID로 샘플 오디오 URL 가져오기
 */
export const getSampleAudioUrl = (categoryOrGenreId: string, category?: ThemeCategory): string | null => {
	// 먼저 category_genreId 형식으로 찾기
	if (category) {
		const key = `${category}_${categoryOrGenreId}`;
		if (SAMPLE_AUDIO_URLS[key]) {
			return SAMPLE_AUDIO_URLS[key];
		}
		// 카테고리만으로 찾기
		if (SAMPLE_AUDIO_URLS[category]) {
			return SAMPLE_AUDIO_URLS[category];
		}
	}

	// 직접 키로 찾기
	return SAMPLE_AUDIO_URLS[categoryOrGenreId] || null;
};
