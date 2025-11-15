import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';

interface ConfirmModalProps {
	isOpen: boolean;
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmModal = ({ isOpen, title = '확인', message, confirmText = '확인', cancelText = '취소', onConfirm, onCancel }: ConfirmModalProps) => {
	const theme = useThemeStore((state) => state.theme);
	const isDark = theme === 'dark';
	const [isHovered, setIsHovered] = useState(false);
	const [isCancelHovered, setIsCancelHovered] = useState(false);
	const [isCancelPressed, setIsCancelPressed] = useState(false);

	const titleColor = isDark ? '#f1f5f9' : '#020617'; // slate-100 : slate-950
	const messageColor = isDark ? '#cbd5e1' : '#1e293b'; // slate-300 : slate-800

	// 호버 시 더 짙은 색상
	const getButtonBackground = () => {
		if (isHovered) {
			return isDark ? 'linear-gradient(to bottom right, #7e22ce, #6b21a8)' : 'linear-gradient(to bottom right, #581c87, #4c1d95)';
		}
		return isDark ? 'linear-gradient(to bottom right, #9333ea, #7e22ce)' : 'linear-gradient(to bottom right, #7e22ce, #581c87)';
	};

	// 취소 버튼 호버 및 클릭 시 배경색
	const getCancelButtonBackground = () => {
		if (isCancelPressed) {
			// 라이트 모드: 배경보다 조금 어두운 반투명 회색
			// 다크 모드: 배경보다 조금 더 밝은 반투명 회색
			return isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
		}
		if (isCancelHovered) {
			// 호버 시 약간의 배경색 변경
			return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
		}
		return 'transparent';
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10000"
						onClick={onCancel}
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-10001 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							className="glass-card rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl pointer-events-auto"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Title */}
							<h3
								className="text-xl md:text-2xl font-semibold mb-4"
								style={{ color: titleColor }}
							>
								{title}
							</h3>

							{/* Message */}
							<p
								className="text-base md:text-lg mb-6"
								style={{ color: messageColor }}
							>
								{message}
							</p>

							{/* Buttons */}
							<div className="flex gap-3 justify-end">
								<motion.button
									onClick={onCancel}
									onMouseEnter={() => setIsCancelHovered(true)}
									onMouseLeave={() => {
										setIsCancelHovered(false);
										setIsCancelPressed(false);
									}}
									onMouseDown={() => setIsCancelPressed(true)}
									onMouseUp={() => setIsCancelPressed(false)}
									className="min-w-[80px] px-5 py-2.5 text-base font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 inline-flex items-center justify-center"
									style={{
										background: getCancelButtonBackground(),
										color: isDark ? '#f1f5f9' : '#0f172a',
										transition: 'background 0.2s ease-in-out',
									}}
								>
									{cancelText}
								</motion.button>
								<motion.button
									onClick={onConfirm}
									onMouseEnter={() => setIsHovered(true)}
									onMouseLeave={() => setIsHovered(false)}
									className="min-w-[80px] px-5 py-2.5 text-base font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30"
									style={{
										background: getButtonBackground(),
										color: '#ffffff',
										transition: 'background 0.3s ease-in-out',
									}}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									transition={{
										type: 'spring',
										stiffness: 400,
										damping: 17,
									}}
								>
									{confirmText}
								</motion.button>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
};

export default ConfirmModal;
