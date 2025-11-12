import { useEffect, useState } from 'react';

interface ToastProps {
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
	onClose?: () => void;
}

const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(false);
			setTimeout(() => {
				onClose?.();
			}, 300); // 페이드아웃 애니메이션 후 제거
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const types = {
		success: 'bg-green-500 text-white',
		error: 'bg-red-500 text-white',
		warning: 'bg-yellow-500 text-white',
		info: 'bg-blue-500 text-white',
	};

	const icons = {
		success: '✓',
		error: '✕',
		warning: '⚠',
		info: 'ℹ',
	};

	return (
		<div
			className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
				types[type]
			} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
		>
			<span className="text-xl font-bold">{icons[type]}</span>
			<p className="text-sm font-medium">{message}</p>
		</div>
	);
};

export default Toast;
