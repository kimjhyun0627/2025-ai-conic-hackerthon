import type { MusicTheme } from '../types';
import mockup1 from '../assets/mockup1.png';
import mockup2 from '../assets/mockup2.png';
import mockup3 from '../assets/mockup3.png';
import mockup4 from '../assets/mockup4.png';
import mockup5 from '../assets/mockup5.png';

export const MUSIC_THEMES: MusicTheme[] = [
	{
		category: 'focus',
		categoryName: 'Focus',
		categoryNameKo: '집중',
		description: '깊은 집중력을 위한 차분한 사운드',
		emoji: '🎯',
		image: mockup1, // 카테고리 이미지 경로
		genres: [
			{
				id: 'lofi-beats',
				name: 'Lo-Fi Beats',
				nameKo: '로파이 비트',
				category: 'focus',
				description: '차분한 비트와 감성적인 멜로디',
				image: mockup1, // 장르 이미지 경로
			},
			{
				id: 'jazz-instrumental',
				name: 'Jazz Instrumental',
				nameKo: '재즈 인스트루멘탈',
				category: 'focus',
				description: '우아한 재즈 연주',
				image: mockup1,
			},
			{
				id: 'ambient',
				name: 'Ambient',
				nameKo: '앰비언트',
				category: 'focus',
				description: '몽환적이고 집중하기 좋은 사운드',
				image: mockup1,
			},
			{
				id: 'classic-piano',
				name: 'Classic Piano',
				nameKo: '클래식 피아노',
				category: 'focus',
				description: '편안한 피아노 선율',
				image: mockup1,
			},
		],
	},
	{
		category: 'energy',
		categoryName: 'Energy',
		categoryNameKo: '텐션',
		description: '에너지 넘치는 강렬한 비트',
		emoji: '⚡',
		image: mockup2, // 카테고리 이미지 경로
		genres: [
			{
				id: 'edm',
				name: 'EDM',
				nameKo: 'EDM',
				category: 'energy',
				description: '강렬한 일렉트로닉 댄스 뮤직',
				image: mockup2,
			},
			{
				id: 'house',
				name: 'House',
				nameKo: '하우스',
				category: 'energy',
				description: '리드미컬한 하우스 비트',
				image: mockup2,
			},
			{
				id: 'techno',
				name: 'Techno',
				nameKo: '테크노',
				category: 'energy',
				description: '강력한 테크노 사운드',
				image: mockup2,
			},
			{
				id: 'drum-bass',
				name: 'Drum & Bass',
				nameKo: '드럼 앤 베이스',
				category: 'energy',
				description: '빠른 비트와 베이스라인',
				image: mockup2,
			},
		],
	},
	{
		category: 'relax',
		categoryName: 'Relax',
		categoryNameKo: '휴식',
		description: '편안한 휴식을 위한 감성적인 멜로디',
		emoji: '🌙',
		image: mockup3, // 카테고리 이미지 경로
		genres: [
			{
				id: 'downtempo',
				name: 'Downtempo',
				nameKo: '다운템포',
				category: 'relax',
				description: '느긋한 템포의 편안한 음악',
				image: mockup3,
			},
			{
				id: 'chillwave',
				name: 'Chillwave',
				nameKo: '칠웨이브',
				category: 'relax',
				description: '몽환적이고 편안한 웨이브',
				image: mockup3,
			},
			{
				id: 'nature-ambient',
				name: 'Nature Ambient',
				nameKo: '자연 앰비언트',
				category: 'relax',
				description: '자연의 소리와 앰비언트',
				image: mockup3,
			},
			{
				id: 'meditation',
				name: 'Meditation',
				nameKo: '명상',
				category: 'relax',
				description: '명상과 힐링을 위한 음악',
				image: mockup3,
			},
		],
	},
	{
		category: 'mood',
		categoryName: 'Mood',
		categoryNameKo: '무드',
		description: '다양한 감성을 담은 독특한 사운드',
		emoji: '🎨',
		image: mockup4, // 카테고리 이미지 경로
		genres: [
			{
				id: 'future-bass',
				name: 'Future Bass',
				nameKo: '퓨쳐 베이스',
				category: 'mood',
				description: '감성적인 베이스 사운드',
				image: mockup4,
			},
			{
				id: 'alternative',
				name: 'Alternative',
				nameKo: '얼터너티브',
				category: 'mood',
				description: '독특한 분위기의 비트',
				image: mockup4,
			},
			{
				id: 'synthwave',
				name: 'Synthwave',
				nameKo: '신스웨이브',
				category: 'mood',
				description: '레트로 신스 사운드',
				image: mockup4,
			},
			{
				id: 'trip-hop',
				name: 'Trip Hop',
				nameKo: '트립합',
				category: 'mood',
				description: '몽환적인 힙합 비트',
				image: mockup4,
			},
		],
	},
	{
		category: 'workout',
		categoryName: 'Workout',
		categoryNameKo: '운동',
		description: '역동적인 운동을 위한 파워풀한 리듬',
		emoji: '💪',
		image: mockup5, // 카테고리 이미지 경로
		genres: [
			{
				id: 'trap',
				name: 'Trap',
				nameKo: '트랩',
				category: 'workout',
				description: '강렬한 트랩 비트',
				image: mockup5,
			},
			{
				id: 'hardstyle',
				name: 'Hardstyle',
				nameKo: '하드스타일',
				category: 'workout',
				description: '강력한 하드 킥',
				image: mockup5,
			},
			{
				id: 'hiphop-beats',
				name: 'Hip-Hop Beats',
				nameKo: '힙합 비트',
				category: 'workout',
				description: '에너지 넘치는 힙합 비트',
				image: mockup5,
			},
		],
	},
];
