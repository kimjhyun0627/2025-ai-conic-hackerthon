import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useThemeColors } from '@/shared/hooks';

export interface ToastItem {
	id: string;
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	duration?: number | null; // null이면 자동으로 닫히지 않음 (API 응답 대기용)
}

interface ToastItemProps {
	toast: ToastItem;
	onClose: (id: string) => void;
	index: number;
	total: number;
}

export const ToastItem = ({ toast, onClose, index, total }: ToastItemProps) => {
	const [isVisible, setIsVisible] = useState(true);
	const colors = useThemeColors();
	const isIndefinite = toast.duration === null || toast.duration === undefined;
	const onCloseRef = useRef(onClose);

	// onClose ref를 최신 값으로 유지
	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		// duration이 null이면 자동으로 닫히지 않음
		if (isIndefinite || !toast.duration) {
			return;
		}

		const timer = setTimeout(() => {
			setIsVisible(false);
			setTimeout(() => {
				onCloseRef.current?.(toast.id);
			}, 300); // 페이드아웃 애니메이션 후 제거
		}, toast.duration);

		return () => clearTimeout(timer);
	}, [toast.duration, toast.id, isIndefinite]);

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

	const Icon = icons[toast.type || 'info'];
	const iconColor = iconColors[toast.type || 'info'];

	// 위로 쌓이도록 bottom 위치 계산
	const bottomOffset = 24 + (total - index - 1) * 50; // 24px 기본 + 각 토스트 간격(60px)

	if (!isVisible) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 10, scale: 0.95 }}
			transition={{
				duration: 0.3,
				ease: [0.4, 0, 0.2, 1],
			}}
			className="fixed right-6 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl min-w-[280px] max-w-[400px]"
			style={{
				background: colors.glassBackground,
				borderColor: colors.glassBorder,
				zIndex: 100000 + index,
				bottom: `${bottomOffset}px`,
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
			<p
				className="text-sm md:text-base font-medium flex-1"
				style={{
					color: colors.isDark ? '#f1f5f9' : '#0f172a',
				}}
			>
				{toast.message}
			</p>

			{/* 닫기 버튼 */}
			<button
				onClick={() => {
					setIsVisible(false);
					setTimeout(() => {
						onClose(toast.id);
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
						duration: (toast.duration || 3000) / 1000,
						ease: 'linear',
					}}
				/>
			)}
		</motion.div>
	);
};
