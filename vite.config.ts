import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@/features': path.resolve(__dirname, './src/features'),
			'@/shared': path.resolve(__dirname, './src/shared'),
			'@/store': path.resolve(__dirname, './src/store'),
			'@/pages': path.resolve(__dirname, './src/pages'),
			'@/assets': path.resolve(__dirname, './src/assets'),
		},
	},
	build: {
		assetsInlineLimit: 0, // 이미지를 항상 별도 파일로 빌드
		rollupOptions: {
			output: {
				assetFileNames: (assetInfo) => {
					// 이미지 파일은 원본 파일명 유지 (대소문자 보존)
					if (assetInfo.name && /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(assetInfo.name)) {
						return `assets/[name][extname]`;
					}
					return 'assets/[name]-[hash][extname]';
				},
			},
		},
	},
});
