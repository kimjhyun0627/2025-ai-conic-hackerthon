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
// MP3 파일 URL 매핑 (일반 재생용)
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

// MOV 파일 URL 매핑 (첫 재생용, fade-in 효과)
export const SAMPLE_AUDIO_MOV_URLS: Record<string, string> = {
	// Focus 테마 샘플
	focus: '/samples/focus.mov',
	'focus_lofi-beats': '/samples/focus_lofi-beats.mov',
	'focus_jazz-instrumental': '/samples/focus_jazz-instrumental.mov',
	focus_ambient: '/samples/focus_ambient.mov',
	'focus_classic-piano': '/samples/focus_classic-piano.mov',

	// Energy 테마 샘플
	energy: '/samples/energy.mov',
	energy_edm: '/samples/energy_edm.mov',
	energy_house: '/samples/energy_house.mov',
	energy_techno: '/samples/energy_techno.mov',
	'energy_drum-bass': '/samples/energy_drum-bass.mov',

	// Relax 테마 샘플
	relax: '/samples/relax.mov',
	relax_downtempo: '/samples/relax_downtempo.mov',
	relax_chillwave: '/samples/relax_chillwave.mov',
	'relax_nature-ambient': '/samples/relax_nature-ambient.mov',
	relax_meditation: '/samples/relax_meditation.mov',

	// Mood 테마 샘플
	mood: '/samples/mood.mov',
	'mood_future-bass': '/samples/mood_future-bass.mov',
	mood_alternative: '/samples/mood_alternative.mov',
	mood_synthwave: '/samples/mood_synthwave.mov',
	'mood_trip-hop': '/samples/mood_trip-hop.mov',

	// Workout 테마 샘플
	workout: '/samples/workout.mov',
	workout_trap: '/samples/workout_trap.mov',
	workout_hardstyle: '/samples/workout_hardstyle.mov',
	'workout_hiphop-beats': '/samples/workout_hiphop-beats.mov',
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
 * @param categoryOrGenreId - 카테고리 또는 장르 ID
 * @param category - 테마 카테고리 (장르인 경우 필수)
 * @param useMov - MOV 파일 사용 여부 (첫 재생 시 true)
 */
export const getSampleAudioUrl = (categoryOrGenreId: string, category?: ThemeCategory, useMov = false): string | null => {
	const urlMap = useMov ? SAMPLE_AUDIO_MOV_URLS : SAMPLE_AUDIO_URLS;

	// 먼저 category_genreId 형식으로 찾기
	if (category) {
		const key = `${category}_${categoryOrGenreId}`;
		if (urlMap[key]) {
			return urlMap[key];
		}
		// 카테고리만으로 찾기
		if (urlMap[category]) {
			return urlMap[category];
		}
	}

	// 직접 키로 찾기
	return urlMap[categoryOrGenreId] || null;
};

/**
 * 샘플 오디오 키 생성 (첫 재생 여부 추적용)
 */
export const getSampleAudioKey = (categoryOrGenreId: string, category?: ThemeCategory): string => {
	if (category) {
		const key = `${category}_${categoryOrGenreId}`;
		// 해당 키가 존재하는지 확인
		if (SAMPLE_AUDIO_URLS[key] || SAMPLE_AUDIO_URLS[category]) {
			return key;
		}
	}
	return categoryOrGenreId;
};
