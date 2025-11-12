import type { MusicTheme } from '../types';

export const MUSIC_THEMES: MusicTheme[] = [
  {
    category: 'focus',
    categoryName: 'Focus',
    categoryNameKo: '집중',
    genres: [
      {
        id: 'lofi-beats',
        name: 'Lo-Fi Beats',
        nameKo: '로파이 비트',
        category: 'focus',
        description: '차분한 비트와 감성적인 멜로디',
      },
      {
        id: 'jazz-instrumental',
        name: 'Jazz Instrumental',
        nameKo: '재즈 인스트루멘탈',
        category: 'focus',
        description: '우아한 재즈 연주',
      },
      {
        id: 'ambient',
        name: 'Ambient',
        nameKo: '앰비언트',
        category: 'focus',
        description: '몽환적이고 집중하기 좋은 사운드',
      },
      {
        id: 'classic-piano',
        name: 'Classic Piano',
        nameKo: '클래식 피아노',
        category: 'focus',
        description: '편안한 피아노 선율',
      },
    ],
  },
  {
    category: 'energy',
    categoryName: 'Energy',
    categoryNameKo: '텐션',
    genres: [
      {
        id: 'edm',
        name: 'EDM',
        nameKo: 'EDM',
        category: 'energy',
        description: '강렬한 일렉트로닉 댄스 뮤직',
      },
      {
        id: 'house',
        name: 'House',
        nameKo: '하우스',
        category: 'energy',
        description: '리드미컬한 하우스 비트',
      },
      {
        id: 'techno',
        name: 'Techno',
        nameKo: '테크노',
        category: 'energy',
        description: '강력한 테크노 사운드',
      },
      {
        id: 'drum-bass',
        name: 'Drum & Bass',
        nameKo: '드럼 앤 베이스',
        category: 'energy',
        description: '빠른 비트와 베이스라인',
      },
    ],
  },
  {
    category: 'relax',
    categoryName: 'Relax',
    categoryNameKo: '휴식',
    genres: [
      {
        id: 'downtempo',
        name: 'Downtempo',
        nameKo: '다운템포',
        category: 'relax',
        description: '느긋한 템포의 편안한 음악',
      },
      {
        id: 'chillwave',
        name: 'Chillwave',
        nameKo: '칠웨이브',
        category: 'relax',
        description: '몽환적이고 편안한 웨이브',
      },
      {
        id: 'nature-ambient',
        name: 'Nature Ambient',
        nameKo: '자연 앰비언트',
        category: 'relax',
        description: '자연의 소리와 앰비언트',
      },
      {
        id: 'meditation',
        name: 'Meditation',
        nameKo: '명상',
        category: 'relax',
        description: '명상과 힐링을 위한 음악',
      },
    ],
  },
  {
    category: 'mood',
    categoryName: 'Mood',
    categoryNameKo: '무드',
    genres: [
      {
        id: 'future-bass',
        name: 'Future Bass',
        nameKo: '퓨쳐 베이스',
        category: 'mood',
        description: '감성적인 베이스 사운드',
      },
      {
        id: 'alternative',
        name: 'Alternative',
        nameKo: '얼터너티브',
        category: 'mood',
        description: '독특한 분위기의 비트',
      },
      {
        id: 'synthwave',
        name: 'Synthwave',
        nameKo: '신스웨이브',
        category: 'mood',
        description: '레트로 신스 사운드',
      },
      {
        id: 'trip-hop',
        name: 'Trip Hop',
        nameKo: '트립합',
        category: 'mood',
        description: '몽환적인 힙합 비트',
      },
    ],
  },
  {
    category: 'workout',
    categoryName: 'Workout',
    categoryNameKo: '운동',
    genres: [
      {
        id: 'trap',
        name: 'Trap',
        nameKo: '트랩',
        category: 'workout',
        description: '강렬한 트랩 비트',
      },
      {
        id: 'hardstyle',
        name: 'Hardstyle',
        nameKo: '하드스타일',
        category: 'workout',
        description: '강력한 하드 킥',
      },
      {
        id: 'hiphop-beats',
        name: 'Hip-Hop Beats',
        nameKo: '힙합 비트',
        category: 'workout',
        description: '에너지 넘치는 힙합 비트',
      },
    ],
  },
];

// Default Audio Parameters
export const DEFAULT_AUDIO_PARAMS = {
  energy: 50,
  bass: 50,
  tempo: 120,
};

// Parameter Ranges
export const PARAM_RANGES = {
  energy: { min: 0, max: 100, step: 1 },
  bass: { min: 0, max: 100, step: 1 },
  tempo: { min: 60, max: 200, step: 5 },
};

// Visualizer Options
export const VISUALIZER_OPTIONS = [
  { type: 'pulse' as const, name: 'Pulse', nameKo: '펄스' },
  { type: 'club' as const, name: 'Club', nameKo: '클럽' },
  { type: 'minimal' as const, name: 'Minimal', nameKo: '미니멀' },
];
