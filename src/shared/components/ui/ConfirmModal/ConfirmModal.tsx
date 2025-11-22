import { useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors } from '@/shared/hooks';

interface ConfirmModalProps {
	isOpen: boolean;
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

// 색상 상수
const COLORS = {
	title: {
		dark: '#f1f5f9', // slate-100
		light: '#020617', // slate-950
	},
	message: {
		dark: '#cbd5e1', // slate-300
		light: '#1e293b', // slate-800
	},
	buttonText: {
		dark: '#f1f5f9', // slate-100
		light: '#0f172a', // slate-900
	},
	confirmButton: {
		default: 'linear-gradient(to bottom right, #fb7185, #f43f5e)',
		hover: 'linear-gradient(to bottom right, #f43f5e, #e11d48)',
	},
	cancelButton: {
		pressed: {
			dark: 'rgba(255, 255, 255, 0.2)',
			light: 'rgba(0, 0, 0, 0.15)',
		},
		hover: {
			dark: 'rgba(255, 255, 255, 0.1)',
			light: 'rgba(0, 0, 0, 0.05)',
		},
	},
	backdrop: {
		dark: 'rgba(28, 25, 23, 0.1)',
		light: 'rgba(254, 248, 242, 0.1)',
	},
} as const;

// 애니메이션 상수
const ANIMATIONS = {
	backdrop: {
		duration: 0.2,
	},
	modal: {
		type: 'spring' as const,
		stiffness: 300,
		damping: 30,
	},
	confirmButton: {
		type: 'spring' as const,
		stiffness: 400,
		damping: 17,
	},
} as const;

// 버튼 상태 타입
type ButtonState = {
	confirmHovered: boolean;
	cancelHovered: boolean;
	cancelPressed: boolean;
};

type ButtonAction = { type: 'SET_CONFIRM_HOVER'; payload: boolean } | { type: 'SET_CANCEL_HOVER'; payload: boolean } | { type: 'SET_CANCEL_PRESSED'; payload: boolean } | { type: 'RESET_CANCEL' };

const buttonStateReducer = (state: ButtonState, action: ButtonAction): ButtonState => {
	switch (action.type) {
		case 'SET_CONFIRM_HOVER':
			return { ...state, confirmHovered: action.payload };
		case 'SET_CANCEL_HOVER':
			return { ...state, cancelHovered: action.payload };
		case 'SET_CANCEL_PRESSED':
			return { ...state, cancelPressed: action.payload };
		case 'RESET_CANCEL':
			return { ...state, cancelHovered: false, cancelPressed: false };
		default:
			return state;
	}
};

const ConfirmModal = ({ isOpen, title = '확인', message, confirmText = '확인', cancelText = '취소', onConfirm, onCancel }: ConfirmModalProps) => {
	const colors = useThemeColors();
	const [buttonState, dispatch] = useReducer(buttonStateReducer, {
		confirmHovered: false,
		cancelHovered: false,
		cancelPressed: false,
	});

	const titleColor = colors.isDark ? COLORS.title.dark : COLORS.title.light;
	const messageColor = colors.isDark ? COLORS.message.dark : COLORS.message.light;

	// 확인 버튼 배경색 (호버 상태에 따라)
	const getConfirmButtonBackground = () => {
		return buttonState.confirmHovered ? COLORS.confirmButton.hover : COLORS.confirmButton.default;
	};

	// 취소 버튼 배경색
	const getCancelButtonBackground = () => {
		if (buttonState.cancelPressed) {
			return colors.isDark ? COLORS.cancelButton.pressed.dark : COLORS.cancelButton.pressed.light;
		}
		if (buttonState.cancelHovered) {
			return colors.isDark ? COLORS.cancelButton.hover.dark : COLORS.cancelButton.hover.light;
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
						transition={{ duration: ANIMATIONS.backdrop.duration }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10000"
						onClick={onCancel}
						style={{
							background: colors.isDark ? COLORS.backdrop.dark : COLORS.backdrop.light,
						}}
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-10001 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={ANIMATIONS.modal}
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
									onMouseEnter={() => dispatch({ type: 'SET_CANCEL_HOVER', payload: true })}
									onMouseLeave={() => dispatch({ type: 'RESET_CANCEL' })}
									onMouseDown={() => dispatch({ type: 'SET_CANCEL_PRESSED', payload: true })}
									onMouseUp={() => dispatch({ type: 'SET_CANCEL_PRESSED', payload: false })}
									className="min-w-[80px] px-5 py-2.5 text-base font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 inline-flex items-center justify-center"
									style={{
										background: getCancelButtonBackground(),
										color: colors.isDark ? COLORS.buttonText.dark : COLORS.buttonText.light,
										transition: 'background 0.2s ease-in-out',
									}}
								>
									{cancelText}
								</motion.button>
								<motion.button
									onClick={onConfirm}
									onMouseEnter={() => dispatch({ type: 'SET_CONFIRM_HOVER', payload: true })}
									onMouseLeave={() => dispatch({ type: 'SET_CONFIRM_HOVER', payload: false })}
									className="min-w-[80px] px-5 py-2.5 text-base font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30"
									style={{
										background: getConfirmButtonBackground(),
										color: '#ffffff',
										transition: 'background 0.3s ease-in-out',
									}}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									transition={ANIMATIONS.confirmButton}
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
