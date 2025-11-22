import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { ToastContainer } from '@/shared/components/ui';

/**
 * 앱 레벨 컴포넌트
 * - 라우팅 설정과 전역 Provider를 감싸는 진입점
 */
export function App() {
	return (
		<BrowserRouter>
			<AppRoutes />
			<ToastContainer />
		</BrowserRouter>
	);
}

export default App;
