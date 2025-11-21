import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

/**
 * 앱 레벨 컴포넌트
 * - 라우팅 설정과 전역 Provider를 감싸는 진입점
 */
export function App() {
	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	);
}

export default App;
