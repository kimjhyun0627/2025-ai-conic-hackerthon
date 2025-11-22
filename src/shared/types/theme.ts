// Music Theme Categories
export type ThemeCategory = 'focus' | 'energy' | 'relax' | 'mood' | 'workout';

// Music Genre
export interface MusicGenre {
	id: string;
	name: string;
	nameKo: string;
	category: ThemeCategory;
	description?: string;
	image?: string; // 장르 이미지 경로 (랜딩 페이지 캐러셀용 - cover 폴더)
	backgroundImage?: string; // 장르 배경 이미지 경로 (player 페이지 CenterImage용 - background 폴더)
}

// Category Parameter
export interface CategoryParameter {
	id: string;
	name: string;
	nameKo: string;
	description?: string; // 파라미터 설명
	min?: number; // musicThemes.ts에서 직접 정의하거나 PARAM_RANGES에서 가져올 수 있음
	max?: number; // musicThemes.ts에서 직접 정의하거나 PARAM_RANGES에서 가져올 수 있음
	default?: number; // musicThemes.ts에서 직접 정의
	unit: string;
}

// Music Theme
export interface MusicTheme {
	category: ThemeCategory;
	categoryName: string;
	categoryNameKo: string;
	description?: string; // 카테고리 설명
	emoji: string;
	image?: string; // 카테고리 이미지 경로 (import된 이미지 URL)
	parameters: CategoryParameter[];
	genres: MusicGenre[];
}
