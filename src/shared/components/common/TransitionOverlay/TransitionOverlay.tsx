import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useThemeColors } from '@/shared/hooks';

interface TransitionOverlayProps {
	isVisible: boolean;
	onCancel?: () => void;
}

export const TransitionOverlay = ({ isVisible, onCancel }: TransitionOverlayProps) => {
	const colors = useThemeColors();
	const [dots, setDots] = useState('');
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		if (!isVisible) return;

		const interval = setInterval(() => {
			setDots((prev) => {
				if (prev === '...') return '';
				return prev + '.';
			});
		}, 500);

		return () => clearInterval(interval);
	}, [isVisible]);

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center"
					style={{
						background: colors.isDark
							? 'linear-gradient(135deg, rgba(42, 37, 33, 0.95) 0%, rgba(28, 25, 23, 0.95) 100%)'
							: 'linear-gradient(135deg, rgba(245, 243, 240, 0.95) 0%, rgba(232, 228, 223, 0.95) 100%)',
						backdropFilter: 'blur(20px) saturate(180%)',
						WebkitBackdropFilter: 'blur(20px) saturate(180%)',
						zIndex: 9999999,
					}}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<motion.div
						className="text-center space-y-8 px-8"
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
					>
						{/* 로더 */}
						{/* <div className="flex justify-center">
							<Loader size="lg" />
						</div> */}

						{/* 텍스트 */}
						<div className="space-y-2 min-w-[280px]">
							<motion.h2
								className="text-2xl md:text-3xl font-semibold"
								style={{
									backgroundImage: colors.isDark
										? 'linear-gradient(135deg, #a52a2a 0%, #fb7185 20%, #f472b6 40%, #fb7185 60%, #fb923c 75%, #a52a2a 100%)'
										: 'linear-gradient(135deg, #8b2635 0%, #fb7185 20%, #f472b6 40%, #fb7185 60%, #fb923c 80%, #8b2635 100%)',
									backgroundSize: '200% 200%',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text',
								}}
								initial={{ opacity: 0, y: 10 }}
								animate={{
									opacity: 1,
									y: 0,
									backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
								}}
								transition={{
									opacity: { delay: 0.2, duration: 0.4 },
									y: { delay: 0.2, duration: 0.4 },
									backgroundPosition: {
										duration: 4,
										repeat: Infinity,
										ease: 'easeInOut',
									},
								}}
							>
								AI가 음악을 생성하고 있어요{dots}
							</motion.h2>
							<motion.p
								className="text-base md:text-lg font-medium"
								style={{
									color: colors.textMutedColor,
								}}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3, duration: 0.4 }}
							>
								잠시만 기다려주세요
							</motion.p>
						</div>

						{/* 진행 바 - 인피니트 애니메이션 */}
						<motion.div
							className="w-full max-w-md mx-auto space-y-4"
							style={{ width: '100%', minWidth: '280px', maxWidth: '448px' }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
						>
							<div
								className="w-full h-1.5 rounded-full overflow-hidden"
								style={{
									background: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
								}}
							>
								<motion.div
									className="h-full rounded-full"
									style={{
										background: `linear-gradient(90deg, transparent, #fb7185, transparent)`,
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
							</div>

							{/* 취소 버튼 */}
							{onCancel && (
								<motion.button
									onClick={onCancel}
									onMouseEnter={() => setIsHovered(true)}
									onMouseLeave={() => setIsHovered(false)}
									className="w-full py-2.5 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] backdrop-blur-md border flex items-center justify-center gap-2"
									style={{
										background: colors.glassButtonBg,
										borderColor: colors.glassBorder,
									}}
									whileHover={{
										background: colors.glassButtonBgHover,
									}}
									whileTap={{ scale: 0.98 }}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ delay: 0.5, duration: 0.3 }}
									aria-label="취소"
								>
									<motion.div
										animate={{
											color: isHovered ? '#fb7185' : colors.iconColor,
										}}
										transition={{ duration: 0.2 }}
									>
										<X className="w-4 h-4" />
									</motion.div>
									<motion.span
										className="text-base font-medium"
										animate={{
											color: isHovered ? '#fb7185' : colors.textSecondaryColor,
										}}
										transition={{ duration: 0.2 }}
									>
										취소하기
									</motion.span>
								</motion.button>
							)}
						</motion.div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
