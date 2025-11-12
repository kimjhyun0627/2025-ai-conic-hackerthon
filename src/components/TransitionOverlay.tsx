import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from './ui';

interface TransitionOverlayProps {
	isVisible: boolean;
}

export const TransitionOverlay = ({ isVisible }: TransitionOverlayProps) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center glass-effect"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<div className="text-center space-y-4">
						<Loader size="lg" />
						<motion.p
							className="text-xl font-medium text-slate-700 dark:text-slate-300"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							음악을 준비하고 있어요...
						</motion.p>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
