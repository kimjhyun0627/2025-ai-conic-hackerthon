import { MUSIC_THEMES } from '../constants/themes';
import type { MusicGenre, MusicTheme } from '../types';

/**
 * 장르 정보로부터 테마를 찾는 유틸리티 함수
 */
export const findThemeByGenre = (genre: MusicGenre | null): MusicTheme | null => {
	if (!genre) {
		return null;
	}

	// 먼저 category로 찾기
	let theme = genre.category ? MUSIC_THEMES.find((t) => t.category === genre.category) : null;

	// category로 찾지 못한 경우, genres 배열에서 장르 ID로 찾기
	if (!theme && genre.id) {
		theme = MUSIC_THEMES.find((t) => t.genres.some((g) => g.id === genre.id));
	}

	return theme || null;
};
