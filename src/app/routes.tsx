import { Routes, Route } from 'react-router-dom';
import { Landing, Player } from '@/pages';

/**
 * 앱 라우팅 설정
 * - 페이지 단위 라우트를 한 곳에서 관리
 */
export function AppRoutes() {
	return (
		<Routes>
			<Route
				path="/"
				element={<Landing />}
			/>
			<Route
				path="/player"
				element={<Player />}
			/>
		</Routes>
	);
}
