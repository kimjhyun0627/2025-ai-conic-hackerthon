import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../types';

interface ThemeState {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
	toggleTheme: () => void;
	initTheme: () => void;
}

// 시스템 테마 감지
const getSystemTheme = (): ThemeMode => {
	if (typeof window === 'undefined') return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// HTML에 테마 클래스 적용
const applyTheme = (theme: ThemeMode) => {
	const root = document.documentElement;
	if (theme === 'dark') {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			theme: 'dark', // 기본값

			setTheme: (theme: ThemeMode) => {
				applyTheme(theme);
				set({ theme });
			},

			toggleTheme: () => {
				const newTheme = get().theme === 'dark' ? 'light' : 'dark';
				get().setTheme(newTheme);
			},

			initTheme: () => {
				const storedTheme = get().theme;
				const theme = storedTheme || getSystemTheme();
				applyTheme(theme);
				set({ theme });
			},
		}),
		{
			name: 'theme-storage',
		}
	)
);

// 시스템 테마 변경 감지
if (typeof window !== 'undefined') {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		const { setTheme } = useThemeStore.getState();
		// localStorage에 저장된 테마가 없으면 시스템 테마 따라가기
		const storedTheme = localStorage.getItem('theme-storage');
		if (!storedTheme) {
			setTheme(e.matches ? 'dark' : 'light');
		}
	});
}
