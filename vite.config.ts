import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const token = env.VITE_FREESOUND_API_KEY;

	return {
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
		server: {
			proxy: {
				'/api/freesound': {
					target: 'https://freesound.org/apiv2',
					changeOrigin: true,
					rewrite: (p) => p.replace(/^\/api\/freesound/, ''),
					configure: (proxy) => {
						proxy.on('proxyReq', (proxyReq) => {
							if (token) {
								proxyReq.setHeader('Authorization', `Token ${token}`);
							}
						});
					},
				},
			},
		},
	};
});
