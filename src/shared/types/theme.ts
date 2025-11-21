// Music Theme Categories
export type ThemeCategory = 'focus' | 'energy' | 'relax' | 'mood' | 'workout';

// Music Genre
export interface MusicGenre {
	id: string;
	name: string;
	nameKo: string;
	category: ThemeCategory;
	description?: string;
	image?: string; // 장르 이미지 경로
}

// Category Parameter
export interface CategoryParameter {
	id: string;
	name: string;
	nameKo: string;
	description?: string; // 파라미터 설명
	min?: number; // audioParams.ts의 PARAM_RANGES에서 가져올 수 있음
	max?: number; // audioParams.ts의 PARAM_RANGES에서 가져올 수 있음
	default?: number; // audioParams.ts의 DEFAULT_AUDIO_PARAMS에서 가져올 수 있음
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
