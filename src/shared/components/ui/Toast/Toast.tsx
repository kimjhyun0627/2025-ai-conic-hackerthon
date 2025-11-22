import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useThemeColors } from '@/shared/hooks';

interface ToastProps {
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	duration?: number | null; // null이면 자동으로 닫히지 않음 (API 응답 대기용)
	onClose?: () => void;
}

const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
	const [isVisible, setIsVisible] = useState(true);
	const colors = useThemeColors();
	const isIndefinite = duration === null || duration === undefined;
	const onCloseRef = useRef(onClose);

	// onClose ref를 최신 값으로 유지
	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		// duration이 null이면 자동으로 닫히지 않음
		if (isIndefinite) {
			return;
		}

		const timer = setTimeout(() => {
			setIsVisible(false);
			setTimeout(() => {
				onCloseRef.current?.();
			}, 300); // 페이드아웃 애니메이션 후 제거
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, isIndefinite]);

	const icons = {
		success: CheckCircle2,
		error: XCircle,
		warning: AlertTriangle,
		info: Info,
	};

	const iconColors = {
		success: colors.isDark ? '#4ade80' : '#22c55e', // green-400 : green-500
		error: colors.isDark ? '#f87171' : '#ef4444', // red-400 : red-500
		warning: colors.isDark ? '#fbbf24' : '#f59e0b', // amber-400 : amber-500
		info: colors.isDark ? '#fb7185' : '#fb7185', // primary-500 (로즈)
	};

	const Icon = icons[type];
	const iconColor = iconColors[type];

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 10, scale: 0.95 }}
					transition={{
						duration: 0.3,
						ease: [0.4, 0, 0.2, 1],
					}}
					className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl"
					style={{
						background: colors.glassBackground,
						borderColor: colors.glassBorder,
						zIndex: 100000,
					}}
				>
					{/* 아이콘 */}
					<div
						className="shrink-0"
						style={{
							color: iconColor,
						}}
					>
						<Icon className="w-5 h-5" />
					</div>

					{/* 메시지 */}
					<div
						className="text-sm md:text-base font-medium flex-1"
						style={{
							color: colors.isDark ? '#f1f5f9' : '#0f172a',
						}}
					>
						{message.split('\n').map((line, index) => (
							<div key={index}>{line}</div>
						))}
					</div>

					{/* 닫기 버튼 */}
					<button
						onClick={() => {
							setIsVisible(false);
							setTimeout(() => {
								onClose?.();
							}, 300);
						}}
						className="shrink-0 p-1 rounded-lg transition-colors hover:bg-white/10 dark:hover:bg-white/5"
						style={{
							color: colors.textSecondaryColor,
						}}
						aria-label="닫기"
					>
						<X className="w-4 h-4" />
					</button>

					{/* 진행 바 */}
					{isIndefinite ? (
						// 무한 로딩 애니메이션 (API 응답 대기 중)
						<motion.div
							className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden"
							style={{
								background: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
							}}
						>
							<motion.div
								className="h-full rounded-b-2xl"
								style={{
									background: `linear-gradient(90deg, transparent, ${iconColor}, transparent)`,
									width: '40%',
								}}
								animate={{
									x: ['-100%', '300%'],
								}}
								transition={{
									duration: 1.5,
									repeat: Infinity,
									ease: 'linear',
								}}
							/>
						</motion.div>
					) : (
						// 일반 타이머 프로그래스 바
						<motion.div
							className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
							style={{
								background: `linear-gradient(90deg, ${iconColor}, ${iconColor}88)`,
							}}
							initial={{ width: '100%' }}
							animate={{ width: '0%' }}
							transition={{
								duration: duration / 1000,
								ease: 'linear',
							}}
						/>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default Toast;
